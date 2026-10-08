"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { recipients: number; whatsappRecipients: number; maxTitle: number; maxBody: number };

export function OfferForm({ recipients, whatsappRecipients, maxTitle, maxBody }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const ready = title.trim().length > 0 && body.trim().length > 0;

  async function send() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, linkUrl }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Invio non riuscito.");
        setConfirming(false);
        return;
      }
      setDone(true);
      setTitle("");
      setBody("");
      setLinkUrl("");
      setConfirming(false);
      router.refresh();
    } catch {
      setError("Connessione assente. Riprova.");
      setConfirming(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="card space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) setConfirming(true);
      }}
    >
      <div className="space-y-1">
        <label className="text-sm font-semibold text-textStrong" htmlFor="offer-title">Titolo</label>
        <input id="offer-title" className="input" value={title} maxLength={maxTitle} onChange={(e) => { setTitle(e.target.value); setDone(false); setConfirming(false); }} placeholder="Es. Teloni nuovi -15% fino a venerdì" />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-semibold text-textStrong" htmlFor="offer-body">Testo dell&apos;offerta</label>
        <textarea id="offer-body" className="input min-h-[140px]" value={body} maxLength={maxBody} onChange={(e) => { setBody(e.target.value); setDone(false); setConfirming(false); }} />
        <p className="text-xs text-neutral-500">{body.length}/{maxBody}</p>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-semibold text-textStrong" htmlFor="offer-link">Link (facoltativo)</label>
        <input id="offer-link" className="input" value={linkUrl} onChange={(e) => { setLinkUrl(e.target.value); setConfirming(false); }} placeholder="https://" inputMode="url" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {done && <p className="text-sm font-semibold text-green-700">Offerta inviata: è in bacheca e i WhatsApp stanno partendo.</p>}

      {!confirming ? (
        <button type="submit" className="btn-primary min-h-[44px]" disabled={!ready}>
          Invia a tutti i trasportatori
        </button>
      ) : (
        <div className="space-y-3 rounded-xl border-2 border-accent-500 p-4">
          <p className="text-sm text-textStrong">
            Stai per inviare questa offerta a <strong>{recipients}</strong> trasportatori in piattaforma e a{" "}
            <strong>{whatsappRecipients}</strong> su WhatsApp. Non si può annullare.
          </p>
          <div className="flex gap-2">
            <button type="button" className="btn-primary min-h-[44px]" disabled={busy} onClick={send}>
              {busy ? "Invio…" : "Conferma e invia"}
            </button>
            <button type="button" className="btn-secondary min-h-[44px]" disabled={busy} onClick={() => setConfirming(false)}>
              Annulla
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
