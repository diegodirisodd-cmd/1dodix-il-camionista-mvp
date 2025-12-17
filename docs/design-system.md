# DodiX – Il Camionista · Design System

Identità visiva industriale e premium pensata per clienti B2B nel settore trasporti e food/export. Gli elementi qui descritti sono implementati con Tailwind e classi di utilità dedicate in `src/app/globals.css` e nel tema `tailwind.config.ts`.

## Color palette
| Token | Hex | Uso |
| --- | --- | --- |
| `brand-800` | `#0c2344` | Colore primario (header, bottoni principali, sfondi scuri)
| `brand-600` | `#1b3d85` | Hover primario, icone
| `brand-200` | `#a6b7df` | Bordi leggeri, separatori su fondi chiari
| `accent-500` | `#ff8a19` | CTA, indicatori di stato positivo/urgente
| `accent-300` | `#ffb975` | Hover/soft accent
| `neutral-50` | `#f7f8fa` | Sfondo pagina chiaro
| `neutral-200` | `#d7dde7` | Bordi e divisori
| `neutral-800` | `#1f2a38` | Testo principale su fondi chiari
| `success` | `#16a34a` | Conferme, badge VERIFIED
| `warning` | `#f59e0b` | Attenzione
| `danger` | `#dc2626` | Errori

## Typography scale
Font primario: **Inter** (fallback Roboto/system). Tagli netti e leggibili.

- Display / H1: `text-3xl` (mobile) / `text-4xl` (desktop), `font-semibold`
- H2: `text-2xl` / `text-3xl`, `font-semibold`
- H3: `text-xl`, `font-semibold`
- Body: `text-base`, `text-neutral-700`
- Meta/Label: `text-sm`, `font-semibold`

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

Usa `gap`/`padding` con questi step per sezioni, card e form.

## Buttons
Classi riutilizzabili definite in `@layer components`:
- **Primario**: `.btn-primary` — fondo `brand-700`, testo bianco, shadow card, focus ring arancione.
- **Secondario**: `.btn-secondary` — bordo `brand-200`, fondo bianco, testo `brand-800`, hover con brand-50.

## Cards
- `.card`: sfondo bianco, bordo neutro chiaro, `shadow-card`, raggio `rounded-xl`, padding 24px.
- `.card-muted`: variante su `neutral-50` per contesti di onboarding/empty state.

## Forms
- Etichetta: `.label`
- Campo: `.input-field` (bordo neutro, focus brand/accent, angoli arrotondati, shadow soft)
- Wrapper campi: `.form-field` (gap + spaziatura verticale standard)
- Azioni: `.form-actions` per distribuire pulsanti e link di supporto.

## Tables
Contenitore `div.table-shell` e `table` interno:
- `table-shell`: bordo `neutral-200`, `shadow-sm`, `rounded-xl`.
- `thead`: `bg-neutral-50`, testo uppercase XS, divisore neutro.
- `tbody tr:hover`: highlight `neutral-50`.

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
