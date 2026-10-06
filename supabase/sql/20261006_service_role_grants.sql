-- Applicata a mano in produzione il 2026-10-06.
-- La Edge Function whatsapp-unlock-notify legge Request (e le tabelle della
-- Borsa Servizi) via REST con la service_role, che non aveva il permesso
-- SELECT: ogni avviso di sblocco finiva in "carico non trovato" e non partiva.
GRANT SELECT ON "Request", "ServiceRequest", "SupplierProfile", "ServiceQuote", "ServiceContactUnlock" TO service_role;
