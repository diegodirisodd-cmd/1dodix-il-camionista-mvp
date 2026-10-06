"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { REGIONS, VEHICLE_TYPES } from "@/lib/catalog";

export type ProfileData = {
  role: string;
  email: string;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  vatNumber: string | null;
  vatVerified: boolean;
  city: string | null;
  province: string | null;
  vehicleTypes: string[];
  serviceRegions: string[];
  whatsappOptIn: boolean;
};

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-[44px] rounded-full border px-3 py-2 text-sm transition ${
        active ? "border-accent-500 bg-accent-50 font-semibold text-textStrong" : "border-neutral-200 bg-white text-neutral-600"
      }`}
    >
      {active ? "✓ " : ""}
      {children}
    </button>
  );
}

export function ProfileForm({ initial, welcome }: { initial: ProfileData; welcome?: boolean }) {
  const router = useRouter();
  const [p, setP] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const isTransporter = p.role === "TRANSPORTER";

  function toggle(key: "vehicleTypes" | "serviceRegions", value: string) {
    setP((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: p.firstName ?? "",
        lastName: p.lastName ?? "",
        companyName: p.companyName ?? "",
        vatNumber: p.vatNumber ?? "",
        city: p.city ?? "",
        province: p.province ?? "",
        phone: p.phone ?? "",
        whatsappOptIn: p.whatsappOptIn,
        ...(isTransporter ? { vehicleTypes: p.vehicleTypes, serviceRegions: p.serviceRegions } : {}),
      }),
    });
    const data = (await res.json().catch(() => ({}))) as Partial<ProfileData> & { error?: string; vatMessage?: string };
    setSaving(false);
    if (!res.ok) {
      setMsg({ ok: false, text: data.error ?? "Salvataggio non riuscito." });
      return;
    }
    setP((prev) => ({ ...prev, ...data }));
    setMsg({ ok: true, text: data.vatMessage ?? "Profilo salvato." });
    router.refresh();
    if (welcome && isTransporter) router.push("/dashboard/transporter/jobs");
  }

  const field = (key: keyof ProfileData, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="form-field">
      <span className="label">{label}</span>
      <input
        className="input-field"
        value={(p[key] as string | null) ?? ""}
        onChange={(e) => setP((prev) => ({ ...prev, [key]: e.target.value }))}
        {...props}
      />
    </label>
  );

  return (
    <form onSubmit={save} className="space-y-6">
      {isTransporter && (
        <div className="card space-y-5">
          <div>
            <h2 className="text-lg">Dove lavori e con che mezzi</h2>
            <p className="text-sm text-neutral-600">
              Ti mostriamo prima i carichi che partono o arrivano in queste regioni e ti avvisiamo su WhatsApp solo per quelli.
            </p>
          </div>
          <div className="space-y-2">
            <p className="label">I tuoi mezzi</p>
            <div className="flex flex-wrap gap-2">
              {VEHICLE_TYPES.map((v) => (
                <Chip key={v.value} active={p.vehicleTypes.includes(v.value)} onClick={() => toggle("vehicleTypes", v.value)}>
                  {v.label}
                </Chip>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="label">Regioni in cui lavori</p>
              <button
                type="button"
                className="btn-ghost min-h-[44px] text-xs"
                onClick={() =>
                  setP((prev) => ({
                    ...prev,
                    serviceRegions: prev.serviceRegions.length === REGIONS.length ? [] : [...REGIONS],
                  }))
                }
              >
                {p.serviceRegions.length === REGIONS.length ? "Togli tutte" : "Tutta Italia"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((r) => (
                <Chip key={r} active={p.serviceRegions.includes(r)} onClick={() => toggle("serviceRegions", r)}>
                  {r}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="card space-y-4">
        <h2 className="text-lg">Dati</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("firstName", "Nome", { autoComplete: "given-name" })}
          {field("lastName", "Cognome", { autoComplete: "family-name" })}
          {field("companyName", isTransporter ? "Nome / ragione sociale" : "Ragione sociale", { autoComplete: "organization" })}
          <label className="form-field">
            <span className="label">
              Partita IVA {p.vatVerified && <span className="badge-verified ml-1 normal-case">Verificata</span>}
            </span>
            <input
              className="input-field stat-mono"
              value={p.vatNumber ?? ""}
              onChange={(e) => setP((prev) => ({ ...prev, vatNumber: e.target.value, vatVerified: false }))}
              placeholder="IT12345678901"
            />
            <span className="text-xs text-neutral-500">La verifichiamo sul registro europeo VIES: chi ha la P.IVA verificata ottiene il badge.</span>
          </label>
          {field("city", "Città", { autoComplete: "address-level2" })}
          {field("province", "Provincia (sigla)", { maxLength: 2, placeholder: "SA" })}
          {field("phone", "Cellulare (WhatsApp) *", { type: "tel", required: true, autoComplete: "tel", placeholder: "+39 333 1234567" })}
          <label className="form-field">
            <span className="label">Email</span>
            <input className="input-field" value={p.email} disabled />
          </label>
        </div>
        <label className="flex min-h-[44px] items-center gap-3 text-sm text-textStrong">
          <input
            type="checkbox"
            className="h-5 w-5"
            checked={p.whatsappOptIn}
            onChange={(e) => setP((prev) => ({ ...prev, whatsappOptIn: e.target.checked }))}
          />
          {isTransporter ? "Avvisami su WhatsApp per i nuovi carichi nelle mie zone" : "Avvisami su WhatsApp per candidature e conferme"}
        </label>
      </div>

      {msg && <p className={msg.ok ? "alert-success" : "alert-danger"}>{msg.text}</p>}
      <button type="submit" className="btn-primary min-h-[48px] w-full sm:w-auto" disabled={saving}>
        {saving ? "Salvataggio..." : welcome ? "Salva e vai ai carichi" : "Salva profilo"}
      </button>
    </form>
  );
}
