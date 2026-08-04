import clsx from "clsx";

import {
  SERVICE_REQUEST_STATUS_LABELS,
  URGENCY_LABELS,
  type ServiceRequestStatus,
  type UrgencyLevel,
} from "@/lib/service-categories";

const STATUS_STYLES: Record<ServiceRequestStatus, string> = {
  APERTA: "border-steel-200 bg-steel-50 text-steel-700",
  IN_TRATTATIVA: "border-accent-200 bg-accent-50 text-accent-700",
  ASSEGNATA: "border-success/40 bg-success/10 text-success",
  CONCLUSA: "border-neutral-200 bg-neutral-50 text-neutral-600",
  ANNULLATA: "border-danger/30 bg-danger/10 text-danger",
};

export function StatusBadge({ stato, className }: { stato: ServiceRequestStatus; className?: string }) {
  return (
    <span className={clsx("badge", STATUS_STYLES[stato], className)}>
      {SERVICE_REQUEST_STATUS_LABELS[stato] ?? stato}
    </span>
  );
}

// L'urgenza alta o l'emergenza usano il badge con puntino pulsante: è la sola
// animazione ricorrente in lista, riservata a chi ha davvero il mezzo fermo.
export function UrgencyBadge({ urgenza, className }: { urgenza: UrgencyLevel; className?: string }) {
  const isCritical = urgenza === "ALTA" || urgenza === "EMERGENZA";

  return (
    <span
      className={clsx(
        isCritical ? "badge-urgent" : "badge border-neutral-200 bg-neutral-50 text-neutral-600",
        className,
      )}
    >
      {URGENCY_LABELS[urgenza] ?? urgenza}
    </span>
  );
}
