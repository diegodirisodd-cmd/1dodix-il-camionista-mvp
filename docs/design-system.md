# DodiX – Il Camionista · Design System

Identità visiva industriale e premium pensata per clienti B2B nel settore trasporti e food/export. Gli elementi qui descritti sono implementati con Tailwind e classi di utilità dedicate in `src/app/globals.css` e nel tema `tailwind.config.ts`.

## Color palette
| Token | Hex | Uso |
| --- | --- | --- |
| `brand-900` | `#0f1a2a` | Blu industriale profondo per header, sfondi scuri, card contrast |
| `brand-700` | `#26395b` | Hover primario, icone, sidebar |
| `brand-300` | `#7e9ac6` | Bordi e highlight su superfici scure |
| `accent-500` | `#f46f00` | CTA principali, indicatori urgenti |
| `accent-300` | `#ffa240` | Hover accent, badge informativi |
| `neutral-50` | `#f6f7fa` | Neutro chiaro per overlay e contrasti |
| `neutral-900` | `#121824` | Testo principale su fondi chiari, ombre profonde |
| `success` | `#16a34a` | Conferme, badge VERIFIED |
| `warning` | `#f59e0b` | Attenzione |
| `danger` | `#dc2626` | Errori |

## Typography scale
Font primario: **Inter** (fallback Roboto/system). Tagli netti e leggibili.

- Display / H1: `text-4xl` (mobile) / `text-5xl` (desktop), `font-semibold`, `leading-tight`
- H2: `text-3xl` / `text-4xl`, `font-semibold`
- H3: `text-2xl`, `font-semibold`
- H4: `text-xl`, `font-semibold`
- Body: `text-base`, `text-neutral-100/80` su fondi scuri
- Meta/Label: `text-xs` o `text-sm`, uppercase con tracking ampia

Inter è importato via `next/font` in `src/app/layout.tsx` e applicato al `<body>`.

## Spacing rules
Scala coerente espressa come CSS custom properties (vedi `:root` in `globals.css`):
- `--space-2xs`: 4px
- `--space-xs`: 8px
- `--space-sm`: 12px
- `--space-md`: 16px
- `--space-lg`: 24px
- `--space-xl`: 32px
- `--space-2xl`: 48px
- `--space-3xl`: 64px

Usa `gap`/`padding` con questi step per sezioni, card e form.

## Buttons
Classi riutilizzabili definite in `@layer components`:
- **Primario**: `.btn-primary` — arancione industriale, testo bianco, focus ring arancio chiaro, disabled attenuato.
- **Secondario**: `.btn-secondary` — bordo blu chiaro su fondo scuro, testo chiaro, hover con leggero contrasto.
- **Ghost**: `.btn-ghost` — testo chiaro e hover trasparente per link contestuali.

## Cards
- `.card`: superficie traslucida su fondi scuri (`bg-white/5`), bordo `white/10`, `shadow-card`, `rounded-2xl`.
- `.card-muted`: variante leggermente più chiara (`bg-white/10`) per messaggi informativi.
- `.card-contrast`: versione più intensa (`bg-brand-900/60`) per hero o callout.

## Forms
- Etichetta: `.label`
- Campo: `.input-field` (bordo `white/20`, fondo semitrasparente, focus accent, testo chiaro)
- Wrapper campi: `.form-field` (gap maggiore e spaziatura generosa)
- Azioni: `.form-actions` per distribuire pulsanti e link di supporto.

## Tables
Contenitore `div.table-shell` e `table` interno:
- `table-shell`: bordo `white/10`, `bg-white/5`, `rounded-2xl`, backdrop-blur.
- `thead`: `bg-white/5`, testo uppercase XS chiaro.
- `tbody tr:hover`: highlight `white/5`.

## Alerts
- Base: `.alert`
- Successo: `.alert-success`
- Warning: `.alert-warning`
- Errore: `.alert-danger`

Ogni variante usa combinazioni di bordo/riempimento a bassa opacità per mantenere un tono professionale.

## Badges
- Base: `.badge` — pill, uppercase XS, fondo `neutral-100`.
- Verified: `.badge-verified` — stato di verifica/contratto attivo (`success`).

## Layout e superfici
- Header: gradient `brand-800` → `surface-muted`, testo chiaro, ombra profonda.
- Contenuto: max-width 1200px, padding `--space-xl` orizzontale `--space-lg`.
- Background app: mix diagonale brand → `neutral-50` per dare profondità industriale senza distrarre dal contenuto.

## Uso rapido
- Pulsante CTA: `<button className="btn-primary">Abbonati ora</button>`
- Card sezione: `<section className="card">…</section>`
- Tabella: wrapper `<div className="table-shell"><table>…</table></div>`
- Badge verificato: `<span className="badge-verified">VERIFIED</span>`

Questi token e componenti mantengono coerenza B2B, affidabilità e leggibilità su tutto il prodotto.
