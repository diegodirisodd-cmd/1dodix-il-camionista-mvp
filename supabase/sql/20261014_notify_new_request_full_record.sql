-- 14 ott 2026 - gia' applicata in produzione (progetto jluadyrdvitmunfzfpjt).
-- Questo file allinea il repo al database: NON serve riapplicarlo.
--
-- Prima il trigger on_new_request_notify passava a whatsapp-notify solo 6 campi
-- (id, pickup, delivery, cargo, pickupDate, price): il filtro per regione/mezzo
-- della v36 non funzionava (carico #39 inviato a 99 trasportatori invece di 48)
-- e il template nuovo_carico_v2 usciva con distanza, peso, mezzo, data di
-- consegna e note vuoti. Ora passa l'intera riga.

CREATE OR REPLACE FUNCTION public.notify_new_request()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Passa il carico intero (regioni, mezzo, km, peso, date, note...) alla
  -- funzione whatsapp-notify: serve al filtro per regione/mezzo e al template v2.
  -- Contatti e indirizzi precisi non vengono mai usati nel messaggio (vedi index.ts).
  PERFORM net.http_post(
    'https://jluadyrdvitmunfzfpjt.supabase.co/functions/v1/whatsapp-notify',
    jsonb_build_object('record', to_jsonb(NEW)),
    '{}'::jsonb,
    jsonb_build_object('Content-Type', 'application/json'),
    5000
  );
  RETURN NEW;
END;
$function$;
