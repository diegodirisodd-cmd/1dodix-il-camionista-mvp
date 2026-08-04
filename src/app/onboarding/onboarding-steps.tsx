"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { routeForUser } from "@/lib/navigation";
import { type Role } from "@/lib/roles";

type CompanyProfile = { companyName: string; operatingArea: string };
type TransporterProfile = { transporterName: string; mainRoutes: string; capacity: string };
type SupplierProfile = { supplierName: string; services: string; areas: string };

type Step = 1 | 2 | 3;

const TOTAL_STEPS: Step = 3;

const ROLE_LABELS: Record<string, string> = {
  COMPANY: "Azienda",
  TRANSPORTER: "Trasportatore",
  SUPPLIER: "Fornitore di servizi",
  ADMIN: "Admin",
};

function StepBadge({ step, total }: { step: Step; total: Step }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
      <span className="stat-mono flex h-6 w-6 items-center justify-center rounded-full bg-accent-500 text-sm font-bold text-white">
        {step}
      </span>
      <span className="stat-mono">
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
  const [supplierProfile, setSupplierProfile] = useState<SupplierProfile>({
    supplierName: "",
    services: "",
    areas: "",
  });
  const [error, setError] = useState<string | null>(null);

  const isCompany = role === "COMPANY";
  const isSupplier = role === "SUPPLIER";

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

    if (isSupplier) {
      return [
        { label: "Ragione sociale", value: supplierProfile.supplierName || "Non indicato" },
        { label: "Servizi offerti", value: supplierProfile.services || "Non indicati" },
        { label: "Province servite", value: supplierProfile.areas || "Non indicate" },
      ];
    }

    return [
      { label: "Nome / Azienda", value: transporterProfile.transporterName || "Non indicato" },
      { label: "Tratte principali", value: transporterProfile.mainRoutes || "Non indicate" },
      { label: "Capacità di carico", value: transporterProfile.capacity || "Non indicata" },
    ];
  }, [companyProfile, isCompany, isSupplier, supplierProfile, transporterProfile]);

  const canProceed = useMemo(() => {
    if (step !== 2) return true;

    if (isCompany) {
      return Boolean(companyProfile.companyName.trim() && companyProfile.operatingArea.trim());
    }

    if (isSupplier) {
      return Boolean(supplierProfile.supplierName.trim() && supplierProfile.services.trim());
    }

    return Boolean(
      transporterProfile.transporterName.trim() &&
        transporterProfile.mainRoutes.trim() &&
        transporterProfile.capacity.trim(),
    );
  }, [companyProfile, isCompany, isSupplier, step, supplierProfile, transporterProfile]);

  const goNext = async () => {
    setError(null);

    if (step < TOTAL_STEPS) {
      setStep((prev) => (prev + 1) as Step);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/onboarding/complete", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Impossibile completare l'onboarding.");
      }

      window.location.replace(data?.redirectTo ?? routeForUser(role as Role));
    } catch (err) {
      console.error("Errore nel completamento onboarding", err);
      setError("Non è stato possibile completare l'onboarding. Riprova.");
      setSubmitting(false);
    }
  };

  const goBack = () => {
    if (step === 1) return;
    setError(null);
    setStep((prev) => (prev - 1) as Step);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <StepBadge step={step} total={TOTAL_STEPS} />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-300/80">Percorso guidato</p>
      </div>

      <div className="card-contrast animate-fadeUp space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-300">
            {ROLE_LABELS[role] ?? role} • <span className="stat-mono">Step {step} di {TOTAL_STEPS}</span>
          </p>
          {step === 1 && (
            <>
              <h2 className="text-white">Benvenuto su DodiX – Il Camionista</h2>
              <p className="max-w-3xl text-neutral-200/85">
                Completa pochi passaggi per iniziare a ricevere opportunità. Configuriamo il profilo di
                base e ti portiamo subito nella dashboard corretta.
              </p>
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="text-white">Configura il tuo profilo</h2>
              <p className="max-w-3xl text-neutral-200/85">
                Inserisci le informazioni essenziali per mostrare chi sei e dove operi: aiutano a
                ricevere contatti pertinenti e richieste di qualità.
              </p>
            </>
          )}
          {step === 3 && (
            <>
              <h2 className="text-white">Conferma e accedi</h2>
              <p className="max-w-3xl text-neutral-200/85">
                Il tuo profilo è pronto. Dalla dashboard potrai gestire richieste, preventivi e contatti.
              </p>
            </>
          )}
        </div>

        {step === 1 && (
          <div className="glass space-y-4 text-sm leading-relaxed text-neutral-200/85">
            <p className="font-semibold text-white">Cosa succede ora</p>
            <ul className="space-y-2">
              <li>• Configuri il profilo base in meno di un minuto.</li>
              <li>• Completi l&apos;onboarding e arrivi alla dashboard del tuo ruolo.</li>
              <li>• Sblocchi i contatti solo quando ti serve, richiesta per richiesta.</li>
            </ul>
          </div>
        )}

        {step === 2 && (
          <div className="glass grid gap-6 md:grid-cols-2">
            {isCompany ? (
              <>
                <OnboardingField
                  id="companyName"
                  label="Ragione sociale"
                  value={companyProfile.companyName}
                  onChange={(value) => setCompanyProfile((prev) => ({ ...prev, companyName: value }))}
                  placeholder="Es. Logistica Nord S.r.l."
                  hint="Mostra ai trasportatori chi sei e con quale ragione sociale operi."
                />
                <OnboardingField
                  id="operatingArea"
                  label="Area geografica operativa"
                  value={companyProfile.operatingArea}
                  onChange={(value) => setCompanyProfile((prev) => ({ ...prev, operatingArea: value }))}
                  placeholder="Es. Nord Italia, Europa occidentale"
                  hint="Indica dove gestisci le spedizioni: aiuta i trasportatori a rispondere in fretta."
                />
              </>
            ) : isSupplier ? (
              <>
                <OnboardingField
                  id="supplierName"
                  label="Ragione sociale"
                  value={supplierProfile.supplierName}
                  onChange={(value) => setSupplierProfile((prev) => ({ ...prev, supplierName: value }))}
                  placeholder="Es. Officina Rossi S.r.l."
                  hint="È il nome che i trasportatori vedono sui tuoi preventivi."
                />
                <OnboardingField
                  id="services"
                  label="Servizi offerti"
                  value={supplierProfile.services}
                  onChange={(value) => setSupplierProfile((prev) => ({ ...prev, services: value }))}
                  placeholder="Es. teloni e rimorchi, gommista pesanti"
                  hint="Le categorie precise le sceglierai nel profilo fornitore."
                />
                <div className="md:col-span-2">
                  <OnboardingField
                    id="areas"
                    label="Province servite"
                    value={supplierProfile.areas}
                    onChange={(value) => setSupplierProfile((prev) => ({ ...prev, areas: value }))}
                    placeholder="Es. MO, BO, RE"
                    hint="Ricevi una notifica solo per le richieste nelle province che copri."
                    mono
                  />
                </div>
              </>
            ) : (
              <>
                <OnboardingField
                  id="transporterName"
                  label="Nome / Azienda"
                  value={transporterProfile.transporterName}
                  onChange={(value) => setTransporterProfile((prev) => ({ ...prev, transporterName: value }))}
                  placeholder="Es. Autotrasporti Verdi"
                  hint="Presentati alle aziende con il nome che usi per i servizi di trasporto."
                />
                <OnboardingField
                  id="mainRoutes"
                  label="Tratte principali"
                  value={transporterProfile.mainRoutes}
                  onChange={(value) => setTransporterProfile((prev) => ({ ...prev, mainRoutes: value }))}
                  placeholder="Es. Milano ⇄ Roma, Nord Italia"
                  hint="Segnala le tratte che gestisci abitualmente per ricevere richieste compatibili."
                />
                <div className="md:col-span-2">
                  <OnboardingField
                    id="capacity"
                    label="Capacità di carico"
                    value={transporterProfile.capacity}
                    onChange={(value) => setTransporterProfile((prev) => ({ ...prev, capacity: value }))}
                    placeholder="Es. Bilici 33 pallet, Furgoni 3.5t"
                    hint="Le specifiche sulla capacità aiutano le aziende a contattarti con incarichi adatti."
                  />
                </div>
              </>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="glass space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-300">Riepilogo</p>
              <h3 className="text-white">Verifica i dati e completa l&apos;onboarding</h3>
              <p className="text-neutral-200/85">
                Il tuo profilo è pronto. Conferma per passare alla dashboard del tuo ruolo.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {summary.map((item) => (
                <div key={item.label} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-300/80">{item.label}</p>
                  <p className="text-base font-medium text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-danger/40 bg-danger/15 px-4 py-3 text-sm font-semibold text-white">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm leading-relaxed text-neutral-200/85">
            <p className="font-semibold text-white">Avanzamento onboarding</p>
            <p>Completa tutti e tre gli step: lo sblocco della dashboard è automatico.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 1 || submitting}
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-white/25 px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:border-white/50 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Indietro
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed || submitting}
              className="btn-primary min-h-[44px]"
            >
              {submitting
                ? "Salvataggio..."
                : step === 1
                  ? "Inizia"
                  : step === TOTAL_STEPS
                    ? "Vai alla dashboard"
                    : "Continua"}
            </button>
          </div>
        </div>
      </div>

      <div className="glass text-sm leading-relaxed text-neutral-200/85">
        <p className="font-semibold text-white">Supporto onboarding</p>
        <p>Potrai aggiornare i dati del profilo in qualsiasi momento dalla dashboard.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-300/80">
        <Link href="/paywall" className="underline transition-colors hover:text-accent-300">
          Abbonamento
        </Link>
        <span className="text-white/30">•</span>
        <Link href="/" className="underline transition-colors hover:text-accent-300">
          Torna al sito
        </Link>
      </div>
    </div>
  );
}

function OnboardingField({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  mono,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  hint: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-200" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`input-field-dark ${mono ? "stat-mono" : ""}`}
      />
      <p className="text-xs text-neutral-300/70">{hint}</p>
    </div>
  );
}
