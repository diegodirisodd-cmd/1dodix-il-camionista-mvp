import { type ServiceCategory, type ServiceRequestStatus, type UrgencyLevel } from "@/lib/service-categories";

export type ServicePhoto = {
  id: number;
  url: string;
};

export type ServiceQuoteItem = {
  id: number;
  requestId: number;
  supplierId: number;
  priceCents: number;
  tempi: string;
  disponibilita: string;
  createdAt: string;
  supplier?: {
    id: number;
    ragioneSociale: string;
    userId?: number;
    partitaIva?: string | null;
    // Recapiti mascherati dall'API finché il preventivo non viene assegnato.
    user?: {
      email: string | null;
      phone: string | null;
      city?: string | null;
      province?: string | null;
    } | null;
  } | null;
};

export type ServiceRequestItem = {
  id: number;
  transporterId: number;
  categoria: ServiceCategory;
  posizione: string;
  provincia: string;
  marcaVeicolo: string;
  tipoVeicolo: string;
  descrizione: string;
  urgenza: UrgencyLevel;
  scadenza: string;
  stato: ServiceRequestStatus;
  assignedQuoteId: number | null;
  createdAt: string;
  fotos: ServicePhoto[];
  quotes: ServiceQuoteItem[];
  transporter?: {
    id?: number;
    companyName: string | null;
    city: string | null;
    province: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  unlocks?: { supplierId: number }[];
};

export type SupplierServiceAreaItem = {
  id?: number;
  categoria: ServiceCategory;
  provincia: string;
};

export type SupplierProfileItem = {
  id: number;
  userId: number;
  ragioneSociale: string;
  partitaIva: string | null;
  aree: SupplierServiceAreaItem[];
};
