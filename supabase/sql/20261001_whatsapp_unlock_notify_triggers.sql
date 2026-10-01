-- Applicata a mano in produzione (Supabase jluadyrdvitmunfzfpjt) il 2026-10-01.
-- Non e' una migration Prisma: i trigger chiamano la Edge Function
-- whatsapp-unlock-notify a ogni nuovo sblocco contatto pagato.
create or replace function public.notify_contact_unlock()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
begin
  perform net.http_post(
    'https://jluadyrdvitmunfzfpjt.supabase.co/functions/v1/whatsapp-unlock-notify',
    jsonb_build_object('kind', TG_ARGV[0], 'unlockId', NEW.id),
    '{}'::jsonb,
    jsonb_build_object('Content-Type', 'application/json'),
    5000
  );
  return NEW;
end;
$$;

revoke all on function public.notify_contact_unlock() from public, anon, authenticated;

drop trigger if exists on_request_unlock_notify on public."RequestUnlock";
create trigger on_request_unlock_notify
  after insert on public."RequestUnlock"
  for each row execute function public.notify_contact_unlock('LOAD');

drop trigger if exists on_service_unlock_notify on public."ServiceContactUnlock";
create trigger on_service_unlock_notify
  after insert on public."ServiceContactUnlock"
  for each row execute function public.notify_contact_unlock('SERVICE');

-- Deduplica: al massimo un avviso per sblocco (la Edge Function inserisce qui
-- prima di inviare; un secondo inserimento fallisce con 409 e non invia).
create table if not exists public."WhatsappUnlockNotice" (
  kind text not null check (kind in ('LOAD','SERVICE')),
  "unlockId" integer not null,
  "createdAt" timestamptz not null default now(),
  primary key (kind, "unlockId")
);
alter table public."WhatsappUnlockNotice" enable row level security;
alter table public."WhatsappUnlockNotice" force row level security;
revoke all on public."WhatsappUnlockNotice" from anon, authenticated;

-- Stato e ritentativi: pending -> sending -> sent | failed | skipped.
alter table public."WhatsappUnlockNotice"
  add column if not exists status text not null default 'pending',
  add column if not exists attempts integer not null default 0,
  add column if not exists "lastError" text,
  add column if not exists "updatedAt" timestamptz not null default now();

-- Prenota l'invio in modo atomico: true solo se l'avviso non è già stato
-- inviato/saltato, non è in corso da meno di 2 minuti e ha meno di 12 tentativi.
create or replace function public.claim_unlock_notice(p_kind text, p_unlock_id integer)
returns boolean
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare ok boolean;
begin
  insert into "WhatsappUnlockNotice"(kind, "unlockId") values (p_kind, p_unlock_id)
  on conflict (kind, "unlockId") do nothing;

  update "WhatsappUnlockNotice"
     set status = 'sending', attempts = attempts + 1, "updatedAt" = now()
   where kind = p_kind and "unlockId" = p_unlock_id
     and attempts < 12
     and (status in ('pending', 'failed')
          or (status = 'sending' and "updatedAt" < now() - interval '2 minutes'))
  returning true into ok;

  return coalesce(ok, false);
end;
$$;

-- Registra l'esito; non declassa mai un avviso già "sent".
create or replace function public.finish_unlock_notice(p_kind text, p_unlock_id integer, p_status text, p_error text)
returns void
language sql
security definer
set search_path to 'public', 'pg_temp'
as $$
  insert into "WhatsappUnlockNotice"(kind, "unlockId", status, "lastError")
  values (p_kind, p_unlock_id, p_status, p_error)
  on conflict (kind, "unlockId") do update
    set status = excluded.status, "lastError" = excluded."lastError", "updatedAt" = now()
    where "WhatsappUnlockNotice".status <> 'sent';
$$;

revoke all on function public.claim_unlock_notice(text, integer) from public, anon, authenticated;
revoke all on function public.finish_unlock_notice(text, integer, text, text) from public, anon, authenticated;
grant execute on function public.claim_unlock_notice(text, integer) to service_role;
grant execute on function public.finish_unlock_notice(text, integer, text, text) to service_role;

-- Rete di sicurezza: ogni 10 minuti ritenta gli sblocchi delle ultime 48 ore
-- il cui avviso non risulta inviato o saltato (Meta giù, timeout, template
-- non ancora approvato...). Attesa crescente tra i tentativi (10, 20, 30...
-- minuti): 12 tentativi coprono circa 11 ore.
create or replace function public.retry_unlock_notices()
returns integer
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare r record; n integer := 0;
begin
  for r in
    select 'LOAD' as kind, u.id from "RequestUnlock" u
     where u."createdAt" > (now() at time zone 'utc') - interval '48 hours'
    union all
    select 'SERVICE', s.id from "ServiceContactUnlock" s
     where s."createdAt" > (now() at time zone 'utc') - interval '48 hours'
  loop
    if not exists (
      select 1 from "WhatsappUnlockNotice" w
       where w.kind = r.kind and w."unlockId" = r.id
         and (w.status in ('sent', 'skipped') or w.attempts >= 12
              or w."updatedAt" > now() - make_interval(mins => greatest(2, 10 * w.attempts) - 1))
    ) then
      perform net.http_post(
        'https://jluadyrdvitmunfzfpjt.supabase.co/functions/v1/whatsapp-unlock-notify',
        jsonb_build_object('kind', r.kind, 'unlockId', r.id),
        '{}'::jsonb,
        jsonb_build_object('Content-Type', 'application/json'),
        10000
      );
      n := n + 1;
    end if;
  end loop;
  return n;
end;
$$;

revoke all on function public.retry_unlock_notices() from public, anon, authenticated;

select cron.schedule('dodix_unlock_notice_retry', '*/10 * * * *', 'select public.retry_unlock_notices()');
