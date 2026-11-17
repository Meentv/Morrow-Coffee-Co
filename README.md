# Morrow Coffee Co.

A warm, editorial storefront for **Morrow Coffee Co.** — a premium coffee shop,
kitchen, and private-chef booking brand.

Rebuilt from a 5-page vanilla HTML/CSS/JS site into a production-ready
**React 19 + Vite + TypeScript** application. The original site is preserved
byte-for-byte in [`legacy/vanilla/`](./legacy/vanilla) for reference.

---

## 1. Project overview

| | |
|---|---|
| **Brand** | Morrow Coffee Co. — coffee · food · good company |
| **Pages** | 5 (Home, Menu, Kitchen, Order, Enquire) + 404 |
| **Design language** | Warm editorial: espresso brown, cream, muted gold, Inter + Fraunces italic |
| **Status** | Front-end complete. Form submissions run against a **mock service layer** (demo mode) until a backend URL is supplied. |
| **Live site** | _placeholder — not yet deployed_ |

### What it does

- **Menu** — 12 products in 4 categories, live search, `?cat=` deep links, featured grid
- **Cart** — persistent basket with quantity steppers, integer-cent maths, cross-tab sync
- **Order** — checkout with pickup/delivery rules and a validated submission payload
- **Kitchen** — private-chef enquiry (coffee bar, breakfast table, full evening)
- **Enquire** — contact form, visit details, FAQ accordion
- **3D** — interactive lathe-geometry coffee cup in the hero and in product previews
- **Newsletter** — validated subscription with loading/success/error states

---

## 2. Screenshots

Screenshots are **not committed** — I could not run a browser in the build
environment, so no images have been fabricated. To generate them once:

```bash
npm run dev
# capture each route at 1440×900 and 390×844
#   / · /menu · /kitchen · /order · /contact
```

Save to `docs/screenshots/{name}-{desktop|mobile}.png` and reference them here.

> The same constraint applies to Lighthouse: no scores are quoted in this README
> because none were measured. §12 explains how to run Lighthouse yourself.

---

## 3. Technology stack

**Core** — React 19.3 · Vite 7.1 · TypeScript 5.9 (`strict`, plus
`noUncheckedIndexedAccess` and `erasableSyntaxOnly`) · React Router 7.18 ·
Tailwind CSS 4.3 (via `@tailwindcss/vite`, tokens in `@theme`)

**State** — Zustand 5.1 with `persist`; cross-tab sync via a `storage` listener

**Forms** — React Hook Form 7.66 · Zod 4.6 · `@hookform/resolvers` 5.2

**Animation** — Motion 14.14 (`motion/react`)

**3D** — Three.js 0.187 · React Three Fiber 9.8 · Drei 10.7

**Quality** — Vitest 3.2 · Testing Library 16.3 · Playwright 1.65 · ESLint 9
(flat config, `jsx-a11y`, React Hooks/Compiler rules) · Prettier 3.6

<details>
<summary>Why Vitest 3 + Vite 7 rather than the newest majors</summary>

`vitest@4` pulls a peer set (`@vitest/browser-playwright`, `@napi-rs/canvas`,
`jsdom@27`) that crashes npm's arborist with `Cannot read properties of null
(reading 'edgesOut')` — a plain `npm install` fails before any code runs. This
combination installs cleanly with no `--legacy-peer-deps` flag. Everything else
is on its latest stable major.
</details>

---

## 4. Architecture

```
src/
├── app/                  App.tsx · router.tsx (lazy routes) · AppLayout.tsx
├── components/
│   ├── ui/               Button · Container/Section · Eyebrow · Field · Reveal · FormStatus · Skeleton
│   ├── layout/           Header · Footer · Brand · PageHero · SectionHead
│   ├── navigation/       CartButton · MobileNav
│   ├── feedback/         Toast · toast.store · PageLoading · RouteError
│   └── seo/              Seo (per-route title/description/OG/robots)
├── features/
│   ├── menu/             types.ts · components/ · hooks/useMenuFilters
│   ├── cart/             store/cart.store.ts · hooks/ (useCart, useCartSync) · components/
│   ├── kitchen/          schemas/ · components/KitchenEnquiryForm
│   ├── order/            schemas/ · components/OrderForm
│   ├── contact/          schemas/ · components/ (Enquiry, Newsletter, FaqAccordion)
│   ├── home/             components/Marquee
│   └── three/            components/ · models/ · hooks/usePointerParallax · lib/useWebGLSupport
├── pages/                HomePage · MenuPage · KitchenPage · OrderPage · ContactPage · NotFoundPage
├── data/                 menu.ts (12 items) · faq.ts (4 entries)
├── lib/                  currency.ts · constants.ts · utils.ts
├── hooks/                useInViewOnce
├── services/             form.service.ts  ← single submission boundary
├── styles/               globals.css (@theme tokens) · fonts.css
├── types/                api.ts (SubmissionResult)
└── main.tsx

public/                   favicon.svg · images/ · models/ · icons/
docs/                     IMAGE_AUDIT.md · MIGRATION.md
e2e/                      order-flow.spec.ts
legacy/vanilla/           the untouched original site
```

**Boundaries that matter**

- `features/*/schemas` — validation only, no UI. Shared by form and tests.
- `services/form.service.ts` — the only place that knows how to submit. Swapping
  mock → live is an env var, not a refactor.
- `data/menu.ts` — the single source of truth for products. No product is
  hardcoded in JSX anywhere.
- `lib/currency.ts` — the only module allowed to format or parse money.

---

## 5. Feature list

| Area | Detail |
|---|---|
| Routing | 5 routes + 404, all lazy-loaded via `React.lazy` + `Suspense` |
| Menu | Typed data, category filter (`aria-pressed`), search over name/description/category, `?cat=` and `?q=` URL state, empty state with reset, result counter, `/` keyboard shortcut for search |
| Cart | Add/remove/increment/decrement, integer cents, `localStorage` persistence under the **original** `morrow-cart` key with legacy migration, cross-tab sync, 99-per-line / 50-line caps |
| Order | Empty-cart block, delivery-address rule, full line-item payload (ids, quantities, unit + line totals, currency), double-submit guard, basket cleared only on success |
| Kitchen | 5-field private-chef enquiry, email-or-phone union validation |
| Contact | Enquiry form, phone/email links, 4-item FAQ |
| FAQ | `aria-expanded`/`aria-controls`, measured-height animation, keyboard operable |
| Newsletter | Zod email validation, loading/success/error, honest demo notice |
| Toasts | success/error/info, deduped, capped stack, auto-dismiss, dismiss button, single `aria-live="polite"` region |
| 3D | Procedural lathe cup + croissant, slow auto-rotation, pointer parallax, DPR capped at 2, offscreen/tab-hidden pause, SVG poster while loading, WebGL detection, `prefers-reduced-motion` |
| A11y | Skip link, landmarks, one `h1`/page, 4.5:1 text contrast, visible focus rings, labelled fields, modal focus trap + restore, reduced-motion support |
| SEO | Per-route title/description/OG/Twitter, `noindex` on 404, canonical only when a real origin is configured |

---

## 6. Installation

Requires **Node ≥ 20.19**.

```bash
git clone <your-repo-url>
cd Morrow-Coffee-Co
npm install
cp .env.example .env.local     # optional — see §11
```

## 7. Development

```bash
npm run dev          # http://localhost:5173
npm run typecheck    # tsc -b
npm run lint         # eslint .
npm run format       # prettier --write .
```

## 8. Build

```bash
npm run build        # tsc -b && vite build → dist/
npm run preview      # serve dist/ at http://localhost:4173
```

## 9. Testing

```bash
npm test             # Vitest, 132 tests
npm run test:watch
npm run test:e2e:install   # one-time Chromium download
npm run test:e2e           # Playwright, builds + previews automatically
```

Current results (actually run — see §18):

- `npm test` → **11 files, 132 tests, all passing**
- `npm run build` → succeeds, no type errors
- `npm run lint` → 0 errors, 0 warnings
- `npm run test:e2e` → **not run in the build environment**; the Playwright
  browser download was blocked and `apt` had no `libnss3`/`libpango`. The spec is
  committed and runs with `npm run test:e2e` on your machine or in CI.

## 10. Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `VITE_SITE_URL` | recommended | Public origin, no trailing slash. Enables canonical URLs + absolute OG images. Unset ⇒ canonical is **omitted** rather than pointing at a fake domain. |
| `VITE_API_BASE_URL` | for real submissions | Base URL of the form backend. Unset ⇒ **demo mode**. |
| `VITE_ANALYTICS_ID` | optional | Reserved, not wired up. |

Only `VITE_`-prefixed values reach the browser. **Never** put a secret in one.

## 11. Deployment

**Vercel** — `vercel.json` is committed (SPA rewrite + immutable asset caching).

```bash
npm i -g vercel
vercel            # preview
vercel --prod     # production
```

**Netlify** — `netlify.toml` is committed (`/*` → `/index.html`, 200).

```bash
npm i -g netlify-cli
netlify deploy --build            # draft
netlify deploy --build --prod     # production
```

**Any static host** — upload `dist/` and configure a catch-all rewrite to
`/index.html`, otherwise deep links (`/menu?cat=coffee`) 404 on refresh.
Set the env vars in the platform's dashboard, not in a committed file.

## 12. 3D assets

**No model files are required.** Both scenes are built procedurally with Three.js
`LatheGeometry` / `SphereGeometry`, so the site downloads **0 KB** of 3D assets
and there are no licence questions.

To swap in GLB models, place them at exactly:

| File | Used by |
|---|---|
| `public/models/morrow-cup.glb` | homepage hero cup |
| `public/models/morrow-croissant.glb` | croissant preview |

Constraints: ≤ 1.5 MB, Draco or Meshopt compressed, CC0 or commercially
licensed, +Y up, ~1 unit tall, origin at the base. Full details in
[`public/models/README.md`](./public/models/README.md).

## 13. Licensing

- **Code** in this repository: © 2025 Morrow Coffee Co.
- **Fonts**: Inter © The Inter Project Authors, Fraunces © Undercase Type — both
  SIL Open Font License 1.1, self-hosted via `@fontsource-variable`.
- **Three.js**: MIT. **React**: MIT. **Tailwind CSS**: MIT. **Motion**: MIT.
- **Photography**: not included. See [`docs/IMAGE_AUDIT.md`](./docs/IMAGE_AUDIT.md) —
  every original photo is missing from the repository.
- **3D models**: none bundled (procedural only).

## 14. Important architectural decisions

1. **Integer cents everywhere.** Floats are banned from money. `formatCents` is
   the only formatter; `parseAmountToCents` refuses a third decimal rather than
   rounding silently.
2. **The reveal/hover bug is fixed structurally.** The original put the
   scroll-reveal `transform` and the `:hover` lift on the *same* element; equal
   specificity plus cascade order meant the lift never fired. Reveal now lives on
   a wrapper, the lift on the card. A regression test asserts they stay separated.
3. **One submission boundary.** All four forms call `submitForm(kind, payload)`.
   Demo vs live is decided inside that module, and the result is tagged
   `mode: "demo" | "live"` so the UI can be honest instead of promising an order
   reached a kitchen.
4. **Three.js is unreachable from the entry bundle.** Every 3D consumer sits
   behind `lazy()`. A hand-written `manualChunks` was removed after it accidentally
   made the entry statically import the 940 kB 3D chunk via Vite's preload
   helper — verified by inspecting `dist/index.html` (only the React chunk is
   preloaded). See the comment in `vite.config.ts`.
5. **URL is the state for menu filtering.** `?cat=` / `?q=` means deep links,
   refreshes, shares and the back button all work for free.
6. **Demo mode is never dressed up as success.** Success panels state "Demo
   mode — your details stayed in this browser and were not sent to Morrow."
7. **Contrast fix, not a redesign.** Brand gold is 2.87:1 on cream — unusable for
   label text. Added `--color-gold-ink` (#94601f, 5.23:1) for small gold text and
   kept the original gold for accents, dots and backgrounds. The original
   `--muted` (3.4:1) is supplemented by `--color-muted-strong` (6.78:1) for body copy.

---

## 15. Known limitations

See the delivery report for the full list. In short:

- **All 22 original photographs are missing** from the repo; 2 product cards show
  the wrong image in the original design and are flagged, not fake-fixed.
- **Forms submit to a mock.** No email, CRM or kitchen printer is connected.
- **No E2E run** in this environment (no browser available).
- **No Lighthouse measurement** — targets were not verified.
- **SPA SEO**: titles/OG are set at runtime, so crawlers that don't run JS see the
  static defaults in `index.html`. Add prerendering if per-route SEO matters.
- **No tax, delivery fee, or payment.** The original had none; `totals.totalCents`
  exists as the seam for a delivery fee.

---

## 16. Project docs

- [`docs/MIGRATION.md`](./docs/MIGRATION.md) — page/section/component mapping, every
  original interaction, all 12 bug fixes, and the token translation table.
- [`docs/IMAGE_AUDIT.md`](./docs/IMAGE_AUDIT.md) — all 22 image references, alt text,
  mismatches, and the replacement list.
- [`legacy/vanilla/`](./legacy/vanilla) — the original site, untouched.

---

© 2025 Morrow Coffee Co. · Made slowly. Served warmly.
