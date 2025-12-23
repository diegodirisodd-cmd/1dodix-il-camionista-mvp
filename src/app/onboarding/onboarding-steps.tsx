"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getDashboardPath } from "@/lib/navigation";

type CompanyProfile = { companyName: string; operatingArea: string };
type TransporterProfile = { transporterName: string; mainRoutes: string; capacity: string };

type Step = 1 | 2 | 3;

const TOTAL_STEPS: Step = 3;

function StepBadge({ step, total }: { step: Step; total: Step }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-sm font-bold">{step}</span>
      <span>
        Step {step} / {total}
      </span>
    </div>
  );
}

export function OnboardingSteps({ role }: { role: string }) {
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({ companyName: "", operatingArea: "" });
  const [transporterProfile, setTransporterProfile] = useState<TransporterProfile>({
    transporterName: "",
    mainRoutes: "",
    capacity: "",
  });
  const [error, setError] = useState<string | null>(null);

  const isCompany = role === "COMPANY";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const summary = useMemo(() => {
    if (isCompany) {
      return [
        { label: "Ragione sociale", value: companyProfile.companyName || "Non indicato" },
        { label: "Area operativa", value: companyProfile.operatingArea || "Non indicata" },
      ];
    }

    return [
      { label: "Nome / Azienda", value: transporterProfile.transporterName || "Non indicato" },
      { label: "Tratte principali", value: transporterProfile.mainRoutes || "Non indicate" },
      { label: "Capacità di carico", value: transporterProfile.capacity || "Non indicata" },
    ];
  }, [companyProfile, isCompany, transporterProfile]);

  const canProceed = useMemo(() => {
    if (step === 1) return true;
    if (step === 2) {
      if (isCompany) {
        return Boolean(companyProfile.companyName.trim() && companyProfile.operatingArea.trim());
      }
      return Boolean(
        transporterProfile.transporterName.trim() &&
          transporterProfile.mainRoutes.trim() &&
          transporterProfile.capacity.trim(),
      );
    }
    return true;
  }, [companyProfile.companyName, companyProfile.operatingArea, isCompany, step, transporterProfile.capacity, transporterProfile.mainRoutes, transporterProfile.transporterName]);

  const goNext = async () => {
    setError(null);

    if (step < TOTAL_STEPS) {
      setStep((prev) => ((prev + 1) as Step));
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/onboarding/complete", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Impossibile completare l'onboarding.");
      }

      window.location.replace(data?.redirectTo ?? getDashboardPath(role));
    } catch (err) {
      console.error("Errore nel completamento onboarding", err);
      setError("Non è stato possibile completare l'onboarding. Riprova.");
      setSubmitting(false);
    }
  };

  const goBack = () => {
    if (step === 1) return;
    setError(null);
    setStep((prev) => ((prev - 1) as Step));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <StepBadge step={step} total={TOTAL_STEPS} />
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#cbd5e1]">Percorso guidato</p>
      </div>

      <div className="space-y-6 rounded-2xl border border-[#1e293b] bg-[#0f172a] p-8 shadow-xl shadow-black/25">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#f97316]">
            {isCompany ? "Azienda" : "Trasportatore"} • Step {step} di {TOTAL_STEPS}
          </p>
          {step === 1 && (
            <>
              <h1 className="text-3xl font-semibold text-white">Benvenuto su DodiX – Il Camionista</h1>
              <p className="max-w-3xl text-base leading-relaxed text-[#cbd5e1]">
                Completa pochi passaggi per iniziare a ricevere opportunità. Ti guideremo per configurare il profilo di base e ti
                porteremo subito nella dashboard corretta.
              </p>
            </>
          )}
          {step === 2 && (
            <>
              <h1 className="text-3xl font-semibold text-white">Configura il tuo profilo</h1>
              <p className="max-w-3xl text-base leading-relaxed text-[#cbd5e1]">
                Inserisci le informazioni essenziali per mostrare chi sei e dove operi. I dati aiutano a ricevere contatti pertinenti
                e richieste di qualità.
              </p>
            </>
          )}
          {step === 3 && (
            <>
              <h1 className="text-3xl font-semibold text-white">Conferma e accedi</h1>
              <p className="max-w-3xl text-base leading-relaxed text-[#cbd5e1]">
                Il tuo profilo è pronto. Con un abbonamento attivo potrai contattare direttamente le controparti e gestire le
                richieste dalla dashboard.
              </p>
            </>
          )}
        </div>

        {step === 1 && (
          <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6 text-sm leading-relaxed text-[#cbd5e1]">
            <p className="font-semibold text-white">Cosa succede ora</p>
            <ul className="space-y-2 text-[#cbd5e1]">
              <li>• Configuri il profilo base in meno di un minuto.</li>
              <li>• Completi l’onboarding e arrivi alla dashboard del tuo ruolo.</li>
              <li>• Potrai sbloccare i contatti con l’abbonamento quando vorrai.</li>
            </ul>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-6 rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-white md:grid-cols-2">
            {isCompany ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#cbd5e1]" htmlFor="companyName">
                    Ragione sociale
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    value={companyProfile.companyName}
                    onChange={(e) => setCompanyProfile((prev) => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Es. Logistica Nord S.r.l."
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-white focus:outline-none"
                  />
                  <p className="text-xs text-[#cbd5e1]">Mostra alle aziende chi sei e con quale ragione sociale operi.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#cbd5e1]" htmlFor="operatingArea">
                    Area geografica operativa
                  </label>
                  <input
                    id="operatingArea"
                    name="operatingArea"
                    value={companyProfile.operatingArea}
                    onChange={(e) => setCompanyProfile((prev) => ({ ...prev, operatingArea: e.target.value }))}
                    placeholder="Es. Nord Italia, Europa occidentale"
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-white focus:outline-none"
                  />
                  <p className="text-xs text-[#cbd5e1]">Indica dove gestisci le spedizioni: aiuta i trasportatori a rispondere con rapidità.</p>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#cbd5e1]" htmlFor="transporterName">
                    Nome / Azienda
                  </label>
                  <input
                    id="transporterName"
                    name="transporterName"
                    value={transporterProfile.transporterName}
                    onChange={(e) => setTransporterProfile((prev) => ({ ...prev, transporterName: e.target.value }))}
                    placeholder="Es. Autotrasporti Verdi"
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-white focus:outline-none"
                  />
                  <p className="text-xs text-[#cbd5e1]">Presentati alle aziende con il nome che usi per i servizi di trasporto.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#cbd5e1]" htmlFor="mainRoutes">
                    Tratte principali
                  </label>
                  <input
                    id="mainRoutes"
                    name="mainRoutes"
                    value={transporterProfile.mainRoutes}
                    onChange={(e) => setTransporterProfile((prev) => ({ ...prev, mainRoutes: e.target.value }))}
                    placeholder="Es. Milano ⇄ Roma, Nord Italia"
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-white focus:outline-none"
                  />
                  <p className="text-xs text-[#cbd5e1]">Segnala le tratte che gestisci abitualmente per ricevere richieste compatibili.</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#cbd5e1]" htmlFor="capacity">
                    Capacità di carico
                  </label>
                  <input
                    id="capacity"
                    name="capacity"
                    value={transporterProfile.capacity}
                    onChange={(e) => setTransporterProfile((prev) => ({ ...prev, capacity: e.target.value }))}
                    placeholder="Es. Bilici 33 pallet, Furgoni 3.5t"
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-white focus:outline-none"
                  />
                  <p className="text-xs text-[#cbd5e1]">Specifiche sulla capacità aiutano le aziende a contattarti con incarichi adatti.</p>
                </div>
              </>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-white">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">Riepilogo</p>
              <h2 className="text-xl font-semibold text-white">Verifica i dati e completa l’onboarding</h2>
              <p className="text-[#cbd5e1]">Il tuo profilo è pronto. Conferma per passare alla dashboard del tuo ruolo.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {summary.map((item) => (
                <div key={item.label} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#cbd5e1]">{item.label}</p>
                  <p className="text-base font-medium text-white">{item.value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#cbd5e1]">Dopo la conferma potrai completare l’abbonamento per sbloccare i contatti diretti.</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm leading-relaxed text-[#cbd5e1]">
            <p className="font-semibold text-white">Avanzamento onboarding</p>
            <p className="text-[#cbd5e1]">Completa tutti e tre gli step: lo sblocco della dashboard è automatico.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 1 || submitting}
              className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Indietro
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed || submitting}
              className="rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#f97316]/25 transition hover:bg-[#ea6a10] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f172a] disabled:cursor-not-allowed"
            >
              {submitting ? "Salvataggio..." : step === 1 ? "Inizia" : step === TOTAL_STEPS ? "Vai alla dashboard" : "Continua"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#1e293b] bg-[#020617] px-6 py-4 text-sm leading-relaxed text-[#cbd5e1] shadow-lg shadow-black/15">
        <p className="font-semibold text-white">Supporto onboarding</p>
        <p className="text-[#cbd5e1]">Completa questi step per sbloccare la dashboard. Potrai aggiornare i dati del profilo in qualsiasi momento.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-[#cbd5e1]">
        <Link href="/paywall" className="underline hover:text-white">
          Abbonamento
        </Link>
        <span className="text-[#475569]">•</span>
        <Link href="/" className="underline hover:text-white">
          Torna al sito
        </Link>
      </div>
    </div>
  );
}
