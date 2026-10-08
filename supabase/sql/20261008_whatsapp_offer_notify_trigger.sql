-- Applicata in produzione (Supabase jluadyrdvitmunfzfpjt) il 2026-10-08, dopo la migration Prisma 20261008160000_offerte_fornitori. Ad ogni nuova offerta chiama la Edge
-- Prisma 20261008160000_offerte_fornitori. Ad ogni nuova offerta chiama la Edge
-- Function whatsapp-offer-notify, che manda i WhatsApp ai trasportatori con consenso.
create or replace function public.notify_offer_created()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
begin
  perform net.http_post(
    'https://jluadyrdvitmunfzfpjt.supabase.co/functions/v1/whatsapp-offer-notify',
    jsonb_build_object('offerId', NEW.id),
    '{}'::jsonb,
    jsonb_build_object('Content-Type', 'application/json'),
    5000
  );
  return NEW;
end;
$$;

revoke all on function public.notify_offer_created() from public, anon, authenticated;

drop trigger if exists on_offer_created_notify on public."Offer";
create trigger on_offer_created_notify
  after insert on public."Offer"
  for each row execute function public.notify_offer_created();

-- Le tabelle non sono esposte alle API pubbliche: solo service role / Prisma.
alter table public."Offer" enable row level security;
alter table public."OfferDelivery" enable row level security;
revoke all on public."Offer" from anon, authenticated;
revoke all on public."OfferDelivery" from anon, authenticated;

-- La service_role (Edge Function via REST) non ha accesso alle tabelle create da Prisma.
grant select, update on public."Offer" to service_role;
grant select, insert, update on public."OfferDelivery" to service_role;
grant usage, select on sequence public."OfferDelivery_id_seq" to service_role;
