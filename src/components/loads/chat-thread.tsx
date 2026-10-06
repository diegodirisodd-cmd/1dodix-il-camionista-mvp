"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { formatDateTime } from "@/lib/format";

type ChatMessage = { id: number; body: string; createdAt: string; mine: boolean; readAt: string | null };

/**
 * Chat fra azienda e un candidato. Aggiorna ogni 8 secondi mentre e' aperta.
 * Finche' i contatti non sono sbloccati da entrambi, telefoni ed email
 * vengono oscurati dal server.
 */
export function ChatThread({
  applicationId,
  counterpartName,
}: {
  applicationId: number;
  counterpartName: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/applications/${applicationId}/messages`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { messages: ChatMessage[]; contactsOpen: boolean };
      setMessages(data.messages);
      setContactsOpen(data.contactsOpen);
      setError(null);
    } catch {
      setError("Impossibile caricare i messaggi.");
    }
  }, [applicationId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest" });
  }, [messages?.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/applications/${applicationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: ChatMessage; masked?: boolean; error?: string };
      if (!res.ok || !data.message) {
        setError(data.error ?? "Messaggio non inviato.");
      } else {
        setMessages((prev) => [...(prev ?? []), data.message!]);
        setText("");
        if (data.masked) setNotice("Telefoni ed email si scambiano dopo la conferma: li abbiamo nascosti dal messaggio.");
      }
    } catch {
      setError("Messaggio non inviato.");
    }
    setSending(false);
  }

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-textStrong">Chat con {counterpartName}</p>
        {!contactsOpen && <span className="text-[11px] text-neutral-500">Contatti nascosti fino alla conferma</span>}
      </div>

      <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg bg-neutral-50 p-2">
        {messages === null ? (
          <p className="p-2 text-xs text-neutral-500">Caricamento...</p>
        ) : messages.length === 0 ? (
          <p className="p-2 text-xs text-neutral-500">Nessun messaggio. Scrivi per chiarire dettagli, orari o prezzo.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={m.mine ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  m.mine
                    ? "max-w-[85%] rounded-2xl rounded-br-sm bg-brand-800 px-3 py-2 text-sm text-white"
                    : "max-w-[85%] rounded-2xl rounded-bl-sm border border-neutral-200 bg-white px-3 py-2 text-sm text-textStrong"
                }
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={m.mine ? "mt-1 text-[10px] text-white/60" : "mt-1 text-[10px] text-neutral-400"}>
                  {formatDateTime(m.createdAt)}
                  {m.mine && m.readAt ? " · letto" : ""}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottom} />
      </div>

      <form onSubmit={send} className="flex gap-2">
        <input
          className="input-field min-h-[44px] flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Scrivi un messaggio..."
          maxLength={2000}
          aria-label="Messaggio"
        />
        <button type="submit" className="btn-primary min-h-[44px]" disabled={sending || !text.trim()}>
          Invia
        </button>
      </form>
      {notice && <p className="text-xs text-warning">{notice}</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
