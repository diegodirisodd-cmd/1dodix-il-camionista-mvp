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
