"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getDashboardPath } from "@/lib/navigation";

function StepBadge({ step, total }: { step: number; total: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-[#0b3c5d] px-3 py-1 text-xs font-semibold text-white">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-sm font-bold">{step}</span>
      <span>
        Step {step} / {total}
      </span>
    </div>
  );
}

function useSteps(role: string) {
  if (role === "COMPANY") {
    return [
      {
        title: "Benvenuto su DodiX",
        copy: "Trova trasportatori affidabili per le tue spedizioni, senza intermediari.",
        cta: "Continua",
      },
      {
        title: "Pubblica la tua prima richiesta",
        copy: "Inserisci tratta, data e carico. I trasportatori ti contatteranno.",
        cta: "Continua",
      },
      {
        title: "Gestisci tutto da un’unica dashboard",
        copy: "Monitora le tue richieste, i contatti e lo stato abbonamento da un solo pannello.",
        cta: "Vai alla Dashboard Azienda",
      },
    ];
  }

  return [
    {
      title: "Benvenuto su DodiX",
      copy: "Accedi a richieste di trasporto verificate da aziende reali.",
      cta: "Continua",
    },
    {
      title: "Scopri le richieste disponibili",
      copy: "Visualizza tratte compatibili con i tuoi mezzi e preferenze.",
      cta: "Continua",
    },
    {
      title: "Sblocca i contatti con l’abbonamento",
      copy: "Attiva l’accesso completo per contattare direttamente le aziende.",
      cta: "Vai alla Dashboard Trasportatore",
    },
  ];
}

export function OnboardingSteps({ role }: { role: string }) {
  const steps = useSteps(role);
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const total = steps.length;
  const current = steps[stepIndex];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stepIndex]);

  const onNext = async () => {
    if (stepIndex < total - 1) {
      setStepIndex((prev) => prev + 1);
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
    } catch (error) {
      console.error("Errore nel completamento onboarding", error);
      setSubmitting(false);
    }
  };

  const onPrevious = () => {
    if (stepIndex === 0) return;
    setStepIndex((prev) => prev - 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <StepBadge step={stepIndex + 1} total={total} />
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#64748b]">Onboarding guidato</p>
      </div>

      <div className="space-y-4 rounded-2xl border border-[#1e293b] bg-[#0f172a] p-8 shadow-xl shadow-black/20">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f97316]">{role === "COMPANY" ? "Azienda" : "Trasportatore"}</p>
          <h1 className="text-3xl font-semibold text-white">{current.title}</h1>
          <p className="max-w-3xl text-base leading-relaxed text-[#cbd5e1]">{current.copy}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-[#cbd5e1]">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Durata: 3 step</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Percorso: {role === "COMPANY" ? "Azienda" : "Trasportatore"}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Abbonamento obbligatorio per i contatti</span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm leading-relaxed text-[#cbd5e1]">
            <p className="font-semibold text-white">Cosa aspettarti</p>
            <p className="text-[#cbd5e1]">Procedi passo passo: al termine verrai portato alla dashboard corretta.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onPrevious}
              disabled={stepIndex === 0 || submitting}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Indietro
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={submitting}
              className="rounded-xl bg-[#f97316] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#f97316]/25 transition hover:bg-[#ea6a10] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f172a] disabled:cursor-not-allowed"
            >
              {submitting ? "Conclusione..." : current.cta}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#1e293b] bg-[#020617] px-6 py-4 text-sm leading-relaxed text-[#cbd5e1] shadow-lg shadow-black/10">
        <p className="font-semibold text-white">Supporto onboarding</p>
        <p className="text-[#cbd5e1]">Completa questi step per sbloccare la dashboard. Potrai sempre rivedere le informazioni dalle sezioni profilo e richieste.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-[#cbd5e1]">
        <Link href="/dashboard/profile" className="underline hover:text-white">
          Profilo
        </Link>
        <span className="text-[#475569]">•</span>
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
