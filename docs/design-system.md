# DodiX – Il Camionista · Design System v2

Identità industriale "asfalto e alta visibilità": blu asfalto profondo, arancione
hi-vis satura, cifre in monospace per tutto ciò che è quantitativo (prezzi, km,
ID richiesta). Fluida ma disciplinata: un'animazione alla volta, mai decorazione
fine a sé stessa. Implementata in `src/app/globals.css` e `tailwind.config.ts`.

## Color palette
| Token | Hex | Uso |
| --- | --- | --- |
| `brand-900` | `#0B1420` | Asfalto profondo: hero, sidebar, card-contrast |
| `brand-700` | `#22394D` | Superficie scura secondaria, hover su fondo scuro |
| `brand-300` | `#87A3BA` | Bordi/testo secondario su fondi scuri |
| `accent-500` | `#FF6A00` | CTA principali, stati urgenti — hi-vis, non decorativo |
| `accent-300` | `#FFA347` | Hover accent, badge informativi |
| `steel-500` | `#41708F` | Accento freddo secondario: link, badge "in corso" |
| `appBg` | `#F6F7FA` | Sfondo pagine chiare (dashboard) |
| `neutral-900` | `#121824` | Testo principale su fondi chiari |
| `success` / `warning` / `danger` | `#22C55E` / `#F59E0B` / `#EF4444` | Semantici, invariati |

Regola: le pagine "hero" (home, register, login) usano fondo scuro asfalto
(`card-contrast`, `bg-road`); le dashboard usano fondo chiaro (`appBg`). Non
mischiare: un componente scuro su pagina chiara va sempre dentro `.card-contrast`
o `.glass`, mai testo chiaro direttamente sul body chiaro.

## Typography
- **Display / titoli** (`h1`-`h3`, classe `font-display`): **Archivo** 700/800,
  `tracking-tight` — dà carattere senza diventare un cliché editoriale.
- **Corpo / UI**: **Inter**, invariato, resta il workhorse per leggibilità.
- **Cifre** (prezzi, km, ID richiesta, orari): classe `.stat-mono` → **JetBrains
  Mono** — firma distintiva del prodotto, richiama un manifesto/bolla di
  trasporto. Usare ovunque compaia un numero quantitativo, mai per testo libero.

Caricati via `next/font/google` in `src/app/layout.tsx` (variabili CSS
`--font-inter`, `--font-archivo`, `--font-jbmono`), niente `<link>` esterni.

## Motion
Un'animazione con uno scopo, non decorazione sparsa:
- `animate-fadeUp` — hero e card al primo render.
- `.reveal` + `components/scroll-reveal.tsx` — fade-up all'ingresso in viewport
  (una volta sola, IntersectionObserver).
- Hover card: `.card-hover` (`-translate-y-1` + `shadow-cardHover`).
- `.btn-primary` — sheen animato al passaggio del mouse (`::after`), lift,
  glow arancio.
- `.badge-urgent` — puntino pulsante (`animate-pulseGlow`), richiama una luce
  di emergenza: usare solo per urgenza/emergenza reale, non come decorazione.
- `.skeleton` — shimmer per stati di caricamento al posto degli spinner.
- `.bg-road` — texture "linee di carreggiata" molto discreta (opacità ~5%) per
  hero scuri, pan lentissimo (18s). È un **overlay su `::before`**, non un
  `background-image` sull'elemento: si combina con `.card-contrast` (o con un
  gradiente Tailwind) senza sostituirne lo sfondo. I figli diretti vengono
  alzati a `z-index: 1`; le utility di posizionamento continuano a vincere.
- Tutto rispetta `prefers-reduced-motion` (regola globale in `globals.css` che
  azzera le durate).

## Buttons
- `.btn-primary` — gradiente hi-vis, glow, sheen al hover, lift, focus ring
  arancio.
- `.btn-secondary` — bordo `brand-300`, testo `brand-700`, per superfici
  chiare.
- `.btn-ghost` — testo puro, hover neutro, per link contestuali.

## Cards
- `.card` + `.card-hover` — superficie bianca, `shadow-card` → `shadow-cardHover`
  al hover con lift.
- `.card-contrast` — gradiente asfalto (`brand-900` → `brand-700`) con glow
  radiale hi-vis discreto in alto a destra. Per hero, form di registrazione,
  callout finali. Lo sfondo è una singola dichiarazione `background`: **non
  aggiungere `bg-gradient-to-*` / `from-*` / `via-*` / `to-*` in `@apply`**,
  emettono un `background-image` concorrente che entra in conflitto.
- `.card-muted` — tinta `steel-50`, per box informativi/guida.
- `.glass` — superficie traslucida (`bg-white/5`, `backdrop-blur`) su fondi
  scuri.

## Forms
- `.input-field` — su superfici chiare.
- `.input-field-dark` — su `.card-contrast`/`.glass` (bordo e fondo
  semitrasparenti bianchi, testo chiaro).
- `.form-field`, `.form-actions` invariati.

## Tables
`.table-shell` — bordo `neutral-100`, righe alternate `neutral-50/60`, hover
riga `accent-50/60`, transizioni di colore fluide invece di stacchi netti.

## Badges
- `.badge`, `.badge-verified` invariati.
- `.badge-urgent` — nuovo, puntino hi-vis pulsante per urgenza/emergenza reale.

## Dati quantitativi
`.stat-mono` (JetBrains Mono, `tabular-nums`) su ogni prezzo, distanza, ID
richiesta o timestamp mostrato in UI — è la firma visiva del prodotto.

## Mobile
- Bottom nav fissa (già presente) con indicatore attivo hi-vis.
- Sotto i 640px: preferire card impilate a tabelle dense (vedi `.table-shell`
  con `overflow-x-auto` come fallback quando una tabella è indispensabile).
- Target touch minimo 44px su azioni primarie.
- CTA primaria di ogni pagina raggiungibile senza scroll su mobile.

## Uso rapido
```
<section className="card-contrast bg-road">…</section>
<button className="btn-primary">Pubblica richiesta</button>
<span className="badge-urgent">Emergenza</span>
<span className="stat-mono">€ 180,00</span>
<ScrollReveal><div className="card card-hover">…</div></ScrollReveal>
```
