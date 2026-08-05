"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/skeleton";
import { ITALIAN_PROVINCES } from "@/lib/province";
import {
  SERVICE_CATEGORY_LABELS,
  SERVICE_CATEGORY_VALUES,
  URGENCY_LABELS,
  URGENCY_VALUES,
} from "@/lib/service-categories";

type UploadedPhoto = {
  path: string;
  previewUrl: string | null;
};

const MAX_PHOTOS = 6;

export function ServiceRequestForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList).slice(0, MAX_PHOTOS - photos.length);

    if (files.length === 0) {
      setError(`Puoi allegare al massimo ${MAX_PHOTOS} foto.`);
      return;
    }

    setError(null);
    setUploading((count) => count + files.length);

    await Promise.all(
      files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await fetch("/api/uploads/service-photo", {
            method: "POST",
            body: formData,
          });
          const data = (await response.json().catch(() => null)) as
            | (UploadedPhoto & { error?: string })
            | null;

          if (!response.ok) {
            // 503 = le env var Supabase non sono configurate. Non e' colpa
            // dell'utente e non gli impedisce di pubblicare: diciamoglielo.
            setError(
              response.status === 503
                ? "Le foto non sono ancora attivabili su questo ambiente. Puoi pubblicare lo stesso: descrivi il problema nel testo e le aggiungerai piu' avanti."
                : data?.error ?? "Caricamento della foto non riuscito.",
            );
            return;
          }

          if (!data?.path) {
            setError("Caricamento della foto non riuscito.");
            return;
          }

          setPhotos((current) => [...current, { path: data.path, previewUrl: data.previewUrl }]);
        } catch (uploadError) {
          console.error("[ServiceRequestForm] upload failed", uploadError);
          setError("Caricamento della foto non riuscito.");
        } finally {
          setUploading((count) => Math.max(0, count - 1));
        }
      }),
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (formData: FormData) => {
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/service-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoria: formData.get("categoria"),
            posizione: formData.get("posizione"),
            provincia: formData.get("provincia"),
            marcaVeicolo: formData.get("marcaVeicolo"),
            tipoVeicolo: formData.get("tipoVeicolo"),
            descrizione: formData.get("descrizione"),
            urgenza: formData.get("urgenza"),
            scadenza: formData.get("scadenza"),
            fotoUrls: photos.map((photo) => photo.path),
          }),
        });

        const data = (await response.json()) as { id?: number; error?: string };

        if (!response.ok) {
          setError(data?.error ?? "Pubblicazione non riuscita. Riprova.");
          return;
        }

        router.push(`/dashboard/services/${data.id}`);
        router.refresh();
      } catch (submitError) {
        console.error("[ServiceRequestForm] submit failed", submitError);
        setError("Pubblicazione non riuscita. Controlla i dati e riprova.");
      }
    });
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <p className="alert-danger" role="alert" aria-live="assertive">
          {error}
        </p>
      )}

      <div className="card space-y-5">
        <div className="space-y-1">
          <h2>Di cosa hai bisogno</h2>
          <p>Categoria e urgenza determinano quali fornitori ricevono la notifica.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="form-field">
            <label className="label" htmlFor="categoria">
              Categoria *
            </label>
            <select className="input-field" id="categoria" name="categoria" required defaultValue="">
              <option value="" disabled>
                Seleziona una categoria
              </option>
              {SERVICE_CATEGORY_VALUES.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {SERVICE_CATEGORY_LABELS[categoria]}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="label" htmlFor="urgenza">
              Urgenza *
            </label>
            <select className="input-field" id="urgenza" name="urgenza" required defaultValue="MEDIA">
              {URGENCY_VALUES.map((urgenza) => (
                <option key={urgenza} value={urgenza}>
                  {URGENCY_LABELS[urgenza]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-field">
          <label className="label" htmlFor="scadenza">
            Serve entro il *
          </label>
          <input
            className="input-field stat-mono"
            id="scadenza"
            name="scadenza"
            type="date"
            required
            min={today}
            defaultValue={today}
          />
        </div>
      </div>

      <div className="card space-y-5">
        <div className="space-y-1">
          <h2>Dove si trova il mezzo</h2>
          <p>La provincia è usata per il matching con le zone servite dai fornitori.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <div className="form-field">
            <label className="label" htmlFor="posizione">
              Posizione *
            </label>
            <input
              className="input-field"
              id="posizione"
              name="posizione"
              type="text"
              required
              placeholder="A1 uscita Modena Nord / Via Emilia 12, Modena"
            />
          </div>

          <div className="form-field">
            <label className="label" htmlFor="provincia">
              Provincia *
            </label>
            <select className="input-field stat-mono" id="provincia" name="provincia" required defaultValue="">
              <option value="" disabled>
                —
              </option>
              {ITALIAN_PROVINCES.map((provincia) => (
                <option key={provincia} value={provincia}>
                  {provincia}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card space-y-5">
        <div className="space-y-1">
          <h2>Il mezzo e il problema</h2>
          <p>Più dettagli dai, più i preventivi che ricevi sono precisi.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="form-field">
            <label className="label" htmlFor="marcaVeicolo">
              Marca *
            </label>
            <input
              className="input-field"
              id="marcaVeicolo"
              name="marcaVeicolo"
              type="text"
              required
              placeholder="Iveco, Scania, Volvo..."
            />
          </div>

          <div className="form-field">
            <label className="label" htmlFor="tipoVeicolo">
              Tipologia *
            </label>
            <input
              className="input-field"
              id="tipoVeicolo"
              name="tipoVeicolo"
              type="text"
              required
              placeholder="Motrice, semirimorchio centinato, cisterna..."
            />
          </div>
        </div>

        <div className="form-field">
          <label className="label" htmlFor="descrizione">
            Descrizione del problema *
          </label>
          <textarea
            className="input-field min-h-[140px]"
            id="descrizione"
            name="descrizione"
            required
            placeholder="Telone laterale strappato per circa 2 metri sul lato guida, il carico è già a bordo..."
          />
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <p className="label">Fotografie</p>
            <p className="text-xs text-neutral-500">
              Fino a {MAX_PHOTOS} immagini (JPG, PNG, WEBP o HEIC, max 5 MB l&apos;una). Visibili solo ai
              fornitori compatibili con la richiesta.
            </p>
          </div>

          <input
            ref={fileInputRef}
            id="fotos"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            multiple
            className="hidden"
            onChange={(event) => void handleFiles(event.target.files)}
          />

          <div className="flex flex-wrap gap-3">
            {photos.map((photo) => (
              <div
                key={photo.path}
                className="relative h-24 w-24 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50"
              >
                {photo.previewUrl ? (
                  <Image
                    src={photo.previewUrl}
                    alt="Foto allegata alla richiesta"
                    fill
                    sizes="96px"
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-neutral-500">
                    Caricata
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setPhotos((current) => current.filter((p) => p.path !== photo.path))}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-900/80 text-xs font-bold text-white transition hover:bg-danger"
                  aria-label="Rimuovi foto"
                >
                  ×
                </button>
              </div>
            ))}

            {Array.from({ length: uploading }).map((_, index) => (
              <Skeleton key={`uploading-${index}`} className="h-24 w-24 rounded-xl" />
            ))}

            {photos.length + uploading < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-neutral-200 text-xs font-semibold text-neutral-500 transition-colors duration-150 hover:border-accent-400 hover:text-accent-600"
              >
                <span className="text-xl leading-none">+</span>
                Aggiungi
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="form-actions justify-between">
        <button type="submit" className="btn-primary min-h-[44px] w-full sm:w-auto" disabled={isPending || uploading > 0}>
          {isPending ? "Pubblicazione in corso..." : "Pubblica la richiesta"}
        </button>
        <p className="text-xs text-neutral-500">
          La pubblicazione è gratuita. I fornitori compatibili ricevono una notifica via email.
        </p>
      </div>
    </form>
  );
}
