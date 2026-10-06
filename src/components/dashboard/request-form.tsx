"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { PlaceInput, type PlaceValue } from "@/components/loads/place-input";
import {
  CARGO_TYPES,
  MAX_PRICE_EUR,
  MIN_PRICE_EUR,
  PAYMENT_TERMS,
  VEHICLE_TYPES,
  estimateRoadKm,
  parseEuroToCents,
  priceOutOfRange,
} from "@/lib/catalog";
import { calculateCommission, formatCurrency } from "@/lib/commission";

const INITIAL = {
  pickupDate: "",
  deliveryDate: "",
  vehicleType: "",
  cargoType: "",
  weight: "",
  palletCount: "",
  volume: "",
  isAdr: false,
  price: "",
  paymentTerms: "",
  description: "",
  pickupAddress: "",
  deliveryAddress: "",
  pickupContact: "",
  pickupPhone: "",
};

function todayIso() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function RequestForm({ onSuccessRedirect }: { onSuccessRedirect?: string }) {
  const router = useRouter();
  const [pickup, setPickup] = useState<PlaceValue | null>(null);
  const [delivery, setDelivery] = useState<PlaceValue | null>(null);
  const [form, setForm] = useState(INITIAL);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const km = useMemo(() => (pickup && delivery ? estimateRoadKm(pickup, delivery) : null), [pickup, delivery]);
  const priceCents = parseEuroToCents(form.price) ?? 0;
  const commission = priceCents > 0 ? calculateCommission(priceCents).total : 0;

  function set<K extends keyof typeof INITIAL>(key: K, value: (typeof INITIAL)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!pickup || !delivery) {
      setError("Scegli i comuni di ritiro e consegna dall'elenco.");
      return;
    }
    if (priceCents <= 0 || priceOutOfRange(priceCents)) {
      setError(`Indica un prezzo fra ${MIN_PRICE_EUR} e ${MAX_PRICE_EUR.toLocaleString("it-IT")} €.`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupPlace: { city: pickup.city, province: pickup.province },
          deliveryPlace: { city: delivery.city, province: delivery.province },
          pickupAddress: form.pickupAddress || null,
          deliveryAddress: form.deliveryAddress || null,
          pickupDate: form.pickupDate,
          deliveryDate: form.deliveryDate || null,
          vehicleType: form.vehicleType || null,
          cargoType: form.cargoType || null,
          weight: form.weight || null,
          palletCount: form.palletCount || null,
          volume: form.volume || null,
          isAdr: form.isAdr,
          price: form.price,
          paymentTerms: form.paymentTerms || null,
          description: form.description || null,
          pickupContact: form.pickupContact || null,
          pickupPhone: form.pickupPhone || null,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: number; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Impossibile pubblicare il carico.");
        setLoading(false);
        return;
      }
      router.push(data.id ? `/dashboard/company/requests/${data.id}?created=1` : onSuccessRedirect ?? "/dashboard/company/requests");
    } catch {
      setError("Connessione non riuscita. Riprova.");
      setLoading(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={submit}>
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">Tratta</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <PlaceInput label="Ritiro" value={pickup} onChange={setPickup} required placeholder="Es. Brescia" />
          <PlaceInput label="Consegna" value={delivery} onChange={setDelivery} required placeholder="Es. Angri" />
        </div>
        {km !== null && (
          <p className="text-sm text-neutral-600">
            Distanza stimata <b className="stat-mono">{km.toLocaleString("it-IT")} km</b>
            {pickup?.region !== delivery?.region ? ` · ${pickup?.region} → ${delivery?.region}` : ` · ${pickup?.region}`}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="form-field">
            <span className="label">Data di ritiro *</span>
            <input
              type="date"
              className="input-field"
              required
              min={todayIso()}
              value={form.pickupDate}
              onChange={(e) => set("pickupDate", e.target.value)}
            />
          </label>
          <label className="form-field">
            <span className="label">Consegna entro</span>
            <input
              type="date"
              className="input-field"
              min={form.pickupDate || todayIso()}
              value={form.deliveryDate}
              onChange={(e) => set("deliveryDate", e.target.value)}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">Carico</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="form-field">
            <span className="label">Mezzo richiesto *</span>
            <select className="input-field" required value={form.vehicleType} onChange={(e) => set("vehicleType", e.target.value)}>
              <option value="">Seleziona</option>
              {VEHICLE_TYPES.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span className="label">Tipo merce</span>
            <select className="input-field" value={form.cargoType} onChange={(e) => set("cargoType", e.target.value)}>
              <option value="">Seleziona</option>
              {CARGO_TYPES.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span className="label">Peso (kg) *</span>
            <input
              className="input-field stat-mono"
              inputMode="numeric"
              required
              value={form.weight}
              onChange={(e) => set("weight", e.target.value.replace(/[^\d]/g, ""))}
              placeholder="Es. 12000"
            />
          </label>
          <label className="form-field">
            <span className="label">Pallet / colli</span>
            <input
              className="input-field stat-mono"
              inputMode="numeric"
              value={form.palletCount}
              onChange={(e) => set("palletCount", e.target.value.replace(/[^\d]/g, ""))}
              placeholder="Es. 33"
            />
          </label>
        </div>
        <label className="flex min-h-[44px] items-center gap-3 text-sm text-textStrong">
          <input type="checkbox" className="h-5 w-5" checked={form.isAdr} onChange={(e) => set("isAdr", e.target.checked)} />
          Merce pericolosa (ADR)
        </label>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-600">Prezzo</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="form-field">
            <span className="label">Prezzo che offri (€, IVA esclusa) *</span>
            <input
              className="input-field stat-mono text-lg"
              inputMode="decimal"
              required
              value={form.price}
              onChange={(e) => set("price", e.target.value.replace(/[^\d,.]/g, ""))}
              placeholder="Es. 1200"
            />
            {km && priceCents > 0 && (
              <span className="stat-mono text-xs text-neutral-500">
                {(priceCents / 100 / km).toLocaleString("it-IT", { maximumFractionDigits: 2 })} €/km
              </span>
            )}
          </label>
          <label className="form-field">
            <span className="label">Pagamento al trasportatore</span>
            <select className="input-field" value={form.paymentTerms} onChange={(e) => set("paymentTerms", e.target.value)}>
              <option value="">Da concordare</option>
              {PAYMENT_TERMS.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-xs text-neutral-500">
          Pubblicare è gratis. I trasportatori possono accettare il tuo prezzo o proporne un altro.
          {commission > 0 && (
            <>
              {" "}Quando scegli il trasportatore paghi la commissione DodiX: circa{" "}
              <b className="stat-mono">{formatCurrency(commission)}</b> (2% + IVA).
            </>
          )}
        </p>
      </fieldset>

      <div className="space-y-4">
        <button type="button" className="btn-ghost min-h-[44px] px-0" onClick={() => setMore((v) => !v)} aria-expanded={more}>
          {more ? "− Nascondi dettagli facoltativi" : "+ Indirizzi, referente, note (facoltativo)"}
        </button>
        {more && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="form-field">
              <span className="label">Indirizzo di ritiro</span>
              <input className="input-field" value={form.pickupAddress} onChange={(e) => set("pickupAddress", e.target.value)} placeholder="Via, numero" />
            </label>
            <label className="form-field">
              <span className="label">Indirizzo di consegna</span>
              <input className="input-field" value={form.deliveryAddress} onChange={(e) => set("deliveryAddress", e.target.value)} placeholder="Via, numero" />
            </label>
            <label className="form-field">
              <span className="label">Referente al ritiro</span>
              <input className="input-field" value={form.pickupContact} onChange={(e) => set("pickupContact", e.target.value)} />
            </label>
            <label className="form-field">
              <span className="label">Telefono referente</span>
              <input className="input-field" type="tel" value={form.pickupPhone} onChange={(e) => set("pickupPhone", e.target.value)} />
            </label>
            <label className="form-field">
              <span className="label">Misure / volume</span>
              <input className="input-field" value={form.volume} onChange={(e) => set("volume", e.target.value)} placeholder="Es. 13,6 m, 80 m³" />
            </label>
            <label className="form-field sm:col-span-2">
              <span className="label">Note e istruzioni</span>
              <textarea
                className="input-field min-h-[90px]"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Orari di carico, sponda idraulica, scarico a mano..."
              />
            </label>
            <p className="text-xs text-neutral-500 sm:col-span-2">
              Indirizzi e referente si vedono solo dopo che avete confermato entrambi.
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="alert-danger" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary min-h-[48px] w-full sm:w-auto">
        {loading ? "Pubblicazione..." : "Pubblica il carico"}
      </button>
    </form>
  );
}
