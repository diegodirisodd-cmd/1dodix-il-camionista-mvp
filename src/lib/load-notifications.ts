import "server-only";

import { emailShell, sendEmail } from "./email";
import { formatCurrency } from "./commission";

// Avvisi email del flusso carichi. Gli avvisi WhatsApp di sblocco contatti
// partono invece dai trigger del database (supabase/sql) all'inserimento in
// RequestUnlock, quindi qui non si duplicano.

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dodix.it";

type Person = { email: string; firstName?: string | null; companyName?: string | null };
type Load = { id: number; pickup: string; delivery: string };

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function route(load: Load) {
  return `${esc(load.pickup)} → ${esc(load.delivery)}`;
}

function hello(p: Person) {
  return p.firstName ? `Ciao ${esc(p.firstName)},` : "Ciao,";
}

async function send(to: Person, subject: string, title: string, body: string, href: string, cta: string) {
  try {
    await sendEmail({ to: to.email, subject, html: emailShell(title, body, href, cta, "Borsa carichi") });
  } catch (e) {
    console.error("[load-notifications]", subject, e);
  }
}

export function notifyNewApplication(company: Person, load: Load, transporterName: string, priceCents: number | null) {
  const price = priceCents ? ` e propone <b>${formatCurrency(priceCents)}</b>` : " al prezzo che hai indicato";
  return send(
    company,
    `Nuova candidatura per ${load.pickup} → ${load.delivery}`,
    "Hai una nuova candidatura",
    `<p>${hello(company)}</p><p><b>${esc(transporterName)}</b> si è candidato per il carico <b>${route(load)}</b>${price}.</p><p>Confronta i candidati, scrivigli in chat e scegli chi preferisci.</p>`,
    `${SITE}/dashboard/company/requests/${load.id}`,
    "Vedi i candidati",
  );
}

export function notifySelected(transporter: Person, load: Load, priceCents: number) {
  return send(
    transporter,
    `Sei stato scelto: ${load.pickup} → ${load.delivery}`,
    "L'azienda ha scelto te",
    `<p>${hello(transporter)}</p><p>Per il carico <b>${route(load)}</b> l'azienda ha scelto te, a <b>${formatCurrency(priceCents)}</b>.</p><p>Conferma entro 24 ore pagando la commissione del 2% + IVA: vedrai subito telefono ed email dell'azienda. Se non ti interessa più puoi rinunciare dalla stessa pagina.</p>`,
    `${SITE}/dashboard/transporter/requests/${load.id}`,
    "Conferma il carico",
  );
}

export function notifyNotSelected(transporter: Person, load: Load) {
  return send(
    transporter,
    `Carico assegnato: ${load.pickup} → ${load.delivery}`,
    "Questa volta è andata a un altro",
    `<p>${hello(transporter)}</p><p>Il carico <b>${route(load)}</b> è stato assegnato a un altro trasportatore. Non ti è stato addebitato nulla.</p><p>Nella bacheca trovi gli altri carichi disponibili.</p>`,
    `${SITE}/dashboard/transporter/jobs`,
    "Vai alla bacheca",
  );
}

export function notifyReleased(company: Person, load: Load, reason: "declined" | "expired") {
  const why =
    reason === "declined"
      ? "Il trasportatore che avevi scelto ha rinunciato."
      : "Il trasportatore che avevi scelto non ha confermato in tempo.";
  return send(
    company,
    `Scegli un altro trasportatore: ${load.pickup} → ${load.delivery}`,
    "Il carico è di nuovo aperto",
    `<p>${hello(company)}</p><p>${why} Il carico <b>${route(load)}</b> è di nuovo aperto: puoi scegliere un altro candidato senza pagare di nuovo la commissione.</p>`,
    `${SITE}/dashboard/company/requests/${load.id}`,
    "Scegli un altro candidato",
  );
}

export function notifyNewMessage(recipient: Person, load: Load, senderName: string, role: "COMPANY" | "TRANSPORTER") {
  const path = role === "COMPANY" ? "company" : "transporter";
  return send(
    recipient,
    `Nuovo messaggio da ${senderName}`,
    "Hai un nuovo messaggio",
    `<p>${hello(recipient)}</p><p><b>${esc(senderName)}</b> ti ha scritto sul carico <b>${route(load)}</b>.</p>`,
    `${SITE}/dashboard/${path}/requests/${load.id}`,
    "Leggi e rispondi",
  );
}

export function notifyCancelled(transporter: Person, load: Load) {
  return send(
    transporter,
    `Carico annullato: ${load.pickup} → ${load.delivery}`,
    "L'azienda ha annullato il carico",
    `<p>${hello(transporter)}</p><p>Il carico <b>${route(load)}</b> a cui ti eri candidato è stato annullato dall'azienda. Non ti è stato addebitato nulla.</p>`,
    `${SITE}/dashboard/transporter/jobs`,
    "Vai alla bacheca",
  );
}
