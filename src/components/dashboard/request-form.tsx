"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PaywallModal } from "@/components/paywall-modal";
import { type Role } from "@/lib/roles";

const CARGO_TYPES = [
  { value: "", label: "Seleziona tipo merce" },
  { value: "pallet", label: "Pallet" },
  { value: "colli", label: "Colli / Pacchi" },
  { value: "sfuso", label: "Sfuso" },
  { value: "container", label: "Container" },
  { value: "frigo", label: "Merce refrigerata" },
  { value: "adr", label: "ADR / Merci pericolose" },
  { value: "liquidi", label: "Liquidi / Cisterna" },
  { value: "altro", label: "Altro" },
];

const VEHICLE_TYPES = [
  { value: "", label: "Seleziona mezzo" },
  { value: "bilico", label: "Bilico (13.6m)" },
  { value: "motrice", label: "Motrice" },
  { value: "furgone", label: "Furgone" },
  { value: "furgone_frigo", label: "Furgone frigo" },
  { value: "frigo", label: "Semirimorchio frigo" },
  { value: "cisterna", label: "Cisterna" },
  { value: "pianale", label: "Pianale" },
  { value: "centinato", label: "Centinato" },
  { value: "ribaltabile", label: "Ribaltabile" },
  { value: "altro", label: "Altro" },
];

const PAYMENT_TERMS = [
  { value: "", label: "Seleziona modalit\u00e0" },
  { value: "bonifico_30", label: "Bonifico 30 giorni" },
  { value: "bonifico_60", label: "Bonifico 60 giorni" },
  { value: "bonifico_immediato", label: "Bonifico immediato" },
  { value: "contrassegno", label: "Contrassegno" },
  { value: "altro", label: "Altro (specificare nelle note)" },
];

const INITIAL_STATE = {
  pickup: "",
  dropoff: "",
  cargoType: "",
  cargo: "",
  price: "",
  description: "",
  pickupDate: "",
  deliveryDate: "",
  weight: "",
  volume: "",
  palletCount: "",
  vehicleType: "",
  isAdr: false,
  paymentTerms: "",
  pickupContact: "",
  pickupPhone: "",
};

type RequestFormProps = {
  onSuccessRedirect?: string;
  subscriptionActive?: boolean;
  role?: Role;
  hasFreeQuota?: boolean;
  [key: string]: unknown;
};

export function RequestForm({
  onSuccessRedirect,
  subscriptionActive = false,
  role = "COMPANY",
  hasFreeQuota = false,
}: RequestFormProps) {
  const [form, setForm] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [unlockConfirmed, setUnlockConfirmed] = useState(false);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [distanceKm, setDistanceKm] = useState("");
  const router = useRouter();

  const canPublish = subscriptionActive || hasFreeQuota || unlockConfirmed;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!canPublish) {
      setPaywallOpen(true);
      setLoading(false);
      return;
    }

    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pickup: form.pickup,
        delivery: form.dropoff,
        cargoType: form.cargoType,
        cargo: form.cargo,
        description: form.description,
        price: form.price,
        pickupDate: form.pickupDate || null,
        deliveryDate: form.deliveryDate || null,
        weight: form.weight || null,
        volume: form.volume || null,
        palletCount: form.palletCount || null,
        vehicleType: form.vehicleType || null,
        isAdr: form.isAdr,
        paymentTerms: form.paymentTerms || null,
        pickupContact: form.pickupContact || null,
        pickupPhone: form.pickupPhone || null,
        distanceKm: distanceKm || null,
      }),
    });

    setLoading(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error ?? "Impossibile pubblicare la richiesta");
      return;
    }

    setSuccess("Richiesta pubblicata correttamente");
    setForm(INITIAL_STATE);
    setDistanceKm("");
    setUnlockConfirmed(false);
    router.push(onSuccessRedirect ?? "/dashboard/requests?created=1");
  }

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const distanceValue = Number(distanceKm);
  const hasEstimate = Number.isFinite(distanceValue) && distanceValue > 0;
  const minBudget = hasEstimate ? distanceValue * 1.2 : 0;
  const maxBudget = hasEstimate ? distanceValue * 1.5 : 0;

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* === SEZIONE 1: TRATTA E DATE === */}
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#0b3c5d]">
          Tratta e date
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="form-field">
          <span className="label">Luogo di ritiro *</span>
          <input
            required
            className="input-field"
            value={form.pickup}
            onChange={(e) => updateField("pickup", e.target.value)}
            placeholder="Es. Milano (MI), Via Mecenate 76"
          />
        </label>
        <label className="form-field">
          <span className="label">Luogo di consegna *</span>
          <input
            required
            className="input-field"
            value={form.dropoff}
            onChange={(e) => updateField("dropoff", e.target.value)}
            placeholder="Es. Roma (RM), Via Tiburtina 1200"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="form-field">
          <span className="label">Data ritiro *</span>
          <input
            required
            type="date"
            className="input-field"
            value={form.pickupDate}
            onChange={(e) => updateField("pickupDate", e.target.value)}
          />
        </label>
        <label className="form-field">
          <span className="label">Data consegna desiderata</span>
          <input
            type="date"
            className="input-field"
            value={form.deliveryDate}
            onChange={(e) => updateField("deliveryDate", e.target.value)}
          />
        </label>
        <label className="form-field">
          <span className="label">Distanza stimata (km)</span>
          <input
            type="number"
            min="0"
            step="1"
            className="input-field"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            placeholder="Es. 580"
          />
        </label>
      </div>

      {hasEstimate && (
        <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-700">
          <p className="font-semibold">Stima budget consigliato</p>
          <p className="mt-1">
            Da <strong>&euro;{minBudget.toFixed(0)}</strong> a{" "}
            <strong>&euro;{maxBudget.toFixed(0)}</strong>{" "}
            <span className="text-xs text-slate-500">(1,20&ndash;1,50 &euro;/km)</span>
          </p>
        </div>
      )}

      {/* === SEZIONE 2: DETTAGLI CARICO === */}
      <div className="space-y-1 pt-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#0b3c5d]">
          Dettagli carico
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="form-field">
          <span className="label">Tipo merce *</span>
          <select
            required
            className="input-field"
            value={form.cargoType}
            onChange={(e) => updateField("cargoType", e.target.value)}
          >
            {CARGO_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.value === ""}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span className="label">Mezzo richiesto</span>
          <select
            className="input-field"
            value={form.vehicleType}
            onChange={(e) => updateField("vehicleType", e.target.value)}
          >
            {VEHICLE_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="form-field">
          <span className="label">Peso stimato (kg)</span>
          <input
            type="number"
            min="0"
            step="1"
            className="input-field"
            value={form.weight}
            onChange={(e) => updateField("weight", e.target.value)}
            placeholder="Es. 12000"
          />
        </label>
        <label className="form-field">
          <span className="label">Volume / Dimensioni</span>
          <input
            className="input-field"
            value={form.volume}
            onChange={(e) => updateField("volume", e.target.value)}
            placeholder="Es. 33 posti pallet, 80m&sup3;"
          />
        </label>
        <label className="form-field">
          <span className="label">N. colli / pallet</span>
          <input
            type="number"
            min="0"
            step="1"
            className="input-field"
            value={form.palletCount}
            onChange={(e) => updateField("palletCount", e.target.value)}
            placeholder="Es. 24"
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isAdr"
          className="h-4 w-4 rounded border-gray-300"
          checked={form.isAdr}
          onChange={(e) => updateField("isAdr", e.target.checked)}
        />
        <label htmlFor="isAdr" className="text-sm font-medium text-[#0f172a]">
          Merce ADR / pericolosa
        </label>
      </div>

      <label className="form-field">
        <span className="label">Note sul carico</span>
        <input
          className="input-field"
          value={form.cargo}
          onChange={(e) => updateField("cargo", e.target.value)}
          placeholder="Dettagli aggiuntivi: fragilit&agrave;, temperatura, impilabilit&agrave;..."
        />
      </label>

      {/* === SEZIONE 3: ECONOMIA === */}
      <div className="space-y-1 pt-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#0b3c5d]">
          Budget e pagamento
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="form-field">
          <span className="label">Prezzo trasporto (&euro;) *</span>
          <input
            required
            type="number"
            min="1"
            className="input-field"
            value={form.price}
            onChange={(e) => updateField("price", e.target.value)}
            placeholder="Es. 1200"
          />
          <span className="text-xs text-[#64748b]">
            Commissione applicata solo allo sblocco contatti: 2% + IVA
          </span>
        </label>
        <label className="form-field">
          <span className="label">Modalit&agrave; pagamento</span>
          <select
            className="input-field"
            value={form.paymentTerms}
            onChange={(e) => updateField("paymentTerms", e.target.value)}
          >
            {PAYMENT_TERMS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* === SEZIONE 4: CONTATTO RITIRO === */}
      <div className="space-y-1 pt-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#0b3c5d]">
          Referente ritiro
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="form-field">
          <span className="label">Nome referente</span>
          <input
            className="input-field"
            value={form.pickupContact}
            onChange={(e) => updateField("pickupContact", e.target.value)}
            placeholder="Es. Mario Rossi"
          />
        </label>
        <label className="form-field">
          <span className="label">Telefono referente</span>
          <input
            type="tel"
            className="input-field"
            value={form.pickupPhone}
            onChange={(e) => updateField("pickupPhone", e.target.value)}
            placeholder="+39 333 1234567"
          />
        </label>
      </div>

      {/* === SEZIONE 5: NOTE === */}
      <div className="space-y-1 pt-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#0b3c5d]">
          Note aggiuntive
        </p>
      </div>

      <label className="form-field">
        <span className="label">Descrizione / istruzioni</span>
        <textarea
          className="input-field"
          rows={3}
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Orari di carico/scarico, vincoli di accesso, documenti necessari..."
        />
      </label>

      {error && <p className="alert-warning">{error}</p>}
      {success && <p className="alert-success">{success}</p>}

      {!subscriptionActive && (
        <div className="rounded-lg border border-[#f5c76a] bg-[#fffdf7] p-3 text-xs font-medium text-[#475569]">
          <p className="text-[#0f172a]">
            La pubblicazione oltre la prima richiesta richiede lo sblocco con commissione.
          </p>
          <p className="text-[#64748b]">
            La prima richiesta &egrave; gratuita, poi puoi sbloccare i contatti per ogni richiesta.
          </p>
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Pubblicazione..." : "Pubblica richiesta"}
      </button>

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onConfirm={async () => {
          setUnlockLoading(true);
          setUnlockConfirmed(true);
          setUnlockLoading(false);
          setPaywallOpen(false);
        }}
        loading={unlockLoading}
        role={role}
      />
    </form>
  );
}
