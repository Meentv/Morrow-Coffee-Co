# Morrow Coffee Co.

A warm, editorial storefront for **Morrow Coffee Co.** — a premium coffee shop,
kitchen, and private-chef booking brand.

Rebuilt from a 5-page vanilla HTML/CSS/JS site into a production-ready
**React 19 + Vite + TypeScript** application. The original site is preserved
byte-for-byte in [`legacy/vanilla/`](./legacy/vanilla) for reference.

---

## 1. Project overview

|                     |                                                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Brand**           | Morrow Coffee Co. — coffee · food · good company                                                                       |
| **Pages**           | 5 (Home, Menu, Kitchen, Order, Enquire) + 404                                                                          |
| **Design language** | Warm editorial: espresso brown, cream, muted gold, Inter + Fraunces italic                                             |
| **Status**          | Front-end complete. Form submissions run against a **mock service layer** (demo mode) until a backend URL is supplied. |
| **Live site**       | _placeholder — not yet deployed_                                                                                       |

### What it does

- **Shop** — retail coffee. 6 coffees, 3 bag sizes, 5 grind options, live per-100g pricing
- **Menu** — 12 café products in 4 categories, live search, `?cat=` deep links, featured grid
- **Cart** — one persistent basket for drinks, food _and_ beans; integer-cent maths, cross-tab sync
- **Order** — checkout with pickup/delivery rules and a validated submission payload
- **Kitchen** — private-chef enquiry (coffee bar, breakfast table, full evening)
- **Enquire** — contact form, visit details, FAQ accordion
- **Hero** — the supplied coffee-journey film, re-cut to loop seamlessly, 22.8 MB → 0.98 MB on mobile
- **Email** — every form really sends, via EmailJS, with a `reply_to` that reaches the customer
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

> All real photography **is** now in the repo (`public/images/`), so a browser
> capture will show the finished design. The only thing still missing here is the
> capture itself.

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

**Email** — EmailJS `@emailjs/browser` 5.0 (no server; see `docs/EMAIL_SETUP.md`)

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
│   ├── shop/             components/BeanCard
│   └── home/             components/Marquee
├── pages/                HomePage · MenuPage · ShopPage · KitchenPage · OrderPage · ContactPage · NotFoundPage
├── data/                 menu.ts (12 items) · beans.ts (6 coffees) · faq.ts (4 entries)
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

| Area       | Detail                                                                                                                                                                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Routing    | 6 routes + 404, all lazy-loaded via `React.lazy` + `Suspense`                                                                                                                                                                                      |
| Shop       | 6 coffees × 3 bag sizes × 5 grinds; variant price + price-per-100g computed from integer cents; roast filter with `aria-pressed`; variant identity in the basket id so the same bean at two grinds is two lines                                    |
| Email      | EmailJS transport, one template for all five forms, `reply_to` wired from each form, rate-limit and misconfiguration surfaced distinctly, never a fake success                                                                                     |
| Menu       | Typed data, category filter (`aria-pressed`), search over name/description/category, `?cat=` and `?q=` URL state, empty state with reset, result counter, `/` keyboard shortcut for search                                                         |
| Cart       | Add/remove/increment/decrement, integer cents, `localStorage` persistence under the **original** `morrow-cart` key with legacy migration, cross-tab sync, 99-per-line / 50-line caps                                                               |
| Order      | Empty-cart block, delivery-address rule, full line-item payload (ids, quantities, unit + line totals, currency), double-submit guard, basket cleared only on success                                                                               |
| Kitchen    | 5-field private-chef enquiry, email-or-phone union validation                                                                                                                                                                                      |
| Contact    | Enquiry form, phone/email links, 4-item FAQ                                                                                                                                                                                                        |
| FAQ        | `aria-expanded`/`aria-controls`, measured-height animation, keyboard operable                                                                                                                                                                      |
| Newsletter | Zod email validation, loading/success/error, honest demo notice                                                                                                                                                                                    |
| Toasts     | success/error/info, deduped, capped stack, auto-dismiss, dismiss button, single `aria-live="polite"` region                                                                                                                                        |
| Hero video | Seamless 6.88 s loop built by crossfading the source's tail into its head; H.264 + VP9 resolution ladder so phones fetch 0.98 MB rather than 3.4 MB; poster-only for reduced-motion, data-saver and 2 g connections; pauses when the tab is hidden |
| Footer     | Gooey bubble animation via SVG `feGaussianBlur` + `feColorMatrix` (no JS animation loop), oversized display headline, real newsletter form, four-column directory, and a WCAG 2.2.2 Pause/Play control that defaults to the OS motion preference   |
| Glass      | Three tokenised surfaces (`glass`, `glass-light`, `glass-dark`) reserved for floating UI and panels over photography, each with a solid `@supports` fallback so contrast never depends on `backdrop-filter`                                        |
| Forms      | Floating-label fields with a persistent real `<label>`, 48px touch targets, 16px mobile text, inline errors with icons, segmented radio groups, `aria-invalid` + `role="alert"`                                                                    |
| A11y       | Skip link, landmarks, one `h1`/page, 4.5:1 text contrast, visible focus rings, labelled fields, modal focus trap + restore, reduced-motion support                                                                                                 |
| SEO        | Per-route title/description/OG/Twitter, `noindex` on 404, canonical only when a real origin is configured                                                                                                                                          |

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

| Variable                   | Required       | Purpose                                                                                                                                                |
| -------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `VITE_SITE_URL`            | recommended    | Public origin, no trailing slash. Enables canonical URLs + absolute OG images. Unset ⇒ canonical is **omitted** rather than pointing at a fake domain. |
| `VITE_EMAILJS_SERVICE_ID`  | for real email | EmailJS service id. Missing ⇒ **demo mode**, clearly labelled.                                                                                         |
| `VITE_EMAILJS_TEMPLATE_ID` | for real email | EmailJS template id (one template serves all forms).                                                                                                   |
| `VITE_EMAILJS_PUBLIC_KEY`  | for real email | EmailJS public key. Publishable by design; restrict with the dashboard's allowed-origins list.                                                         |
| `VITE_ANALYTICS_ID`        | optional       | Reserved, not wired up.                                                                                                                                |

Only `VITE_`-prefixed values reach the browser. **Never** put a secret in one.

Full 5-minute walkthrough, including the exact template body to paste into the
EmailJS dashboard: [`docs/EMAIL_SETUP.md`](./docs/EMAIL_SETUP.md).

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

## 12. Photography and the removed 3D layer

**The 3D layer has been removed.** The homepage hero previously layered an
interactive Three.js cup over the photograph, with a procedural croissant
preview on featured menu cards. It was removed on request: it was the heaviest
part of the app (a separate **940 kB / 252 kB gzip** chunk) and it competed with
the real hero photography rather than complementing it.

What that removed, concretely:

- `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three` — four
  dependencies and their transitive tree.
- `src/features/three/**` — the scenes, models, WebGL detection and pointer hook.
- The "view in 3D" trigger on featured cards, and `public/models/`.

The 6 route chunks and the eager payload were unaffected (167.6 kB gzip before
and after); the win is that the 3D graph no longer exists at all. Photography is
unchanged and documented in [`docs/IMAGE_AUDIT.md`](./docs/IMAGE_AUDIT.md).

## 13. Licensing

- **Code** in this repository: © 2025 Morrow Coffee Co.
- **Fonts**: Inter © The Inter Project Authors, Fraunces © Undercase Type — both
  SIL Open Font License 1.1, self-hosted via `@fontsource-variable`.
- **React**: MIT. **Tailwind CSS**: MIT. **Motion**: MIT. **EmailJS browser SDK**: MIT.
- **Photography**: 20 photographs supplied by the site owner, cropped and
  optimised into 23 files (JPEG + WebP). Provenance, watermarks and the two
  outstanding product mismatches are documented in
  [`docs/IMAGE_AUDIT.md`](./docs/IMAGE_AUDIT.md). **9 of the 20 source frames
  carry a visible stock-site watermark** and should be replaced with licensed or
  original photography before launch.
- **3D**: removed. No 3D assets, models or licences remain in the project.

## 14. Important architectural decisions

1. **Integer cents everywhere.** Floats are banned from money. `formatCents` is
   the only formatter; `parseAmountToCents` refuses a third decimal rather than
   rounding silently.
2. **The reveal/hover bug is fixed structurally.** The original put the
   scroll-reveal `transform` and the `:hover` lift on the _same_ element; equal
   specificity plus cascade order meant the lift never fired. Reveal now lives on
   a wrapper, the lift on the card. A regression test asserts they stay separated.
3. **One submission boundary.** All five forms call `submitForm(kind, payload, { replyTo })`.
   Demo vs live is decided inside that module, and the result is tagged
   `mode: "demo" | "live"` so the UI can be honest instead of promising an order
   reached a kitchen.
4. **The 3D layer was removed rather than optimised.** It was the single largest
   dependency in the project and it duplicated what the hero photograph already
   showed. Deleting it removed four packages and a 940 kB chunk outright. The
   page chunks and eager payload were unchanged — the win is maintenance surface
   and total bytes, not first-paint.
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

- **Photography is preview-grade.** All 23 delivered images derive from the 20
  photographs supplied on 2026-11-17, but 9 source frames carry a visible
  "dreamstime" watermark, and 2 product cards still show a photo of the wrong
  product ("Vanilla Cloud" is a matcha drink, "Burnt Honey Cake" is a pastry
  tray). Both are flagged in the UI with a "photo pending" badge and listed for
  replacement in `docs/IMAGE_AUDIT.md` rather than silently re-captioned.
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
  original interaction, all 26 documented changes and bug fixes, and the token
  translation table.
- [`docs/VIDEO_SETUP.md`](./docs/VIDEO_SETUP.md) — the hero encode: why the source
  wasn't web-ready, how the loop seam was closed, the exact `ffmpeg` commands,
  and the honest limits of a 1664-wide master.
- [`docs/EMAIL_SETUP.md`](./docs/EMAIL_SETUP.md) — connecting real email in 5 minutes,
  including the template body and every variable it receives.
- [`docs/IMAGE_AUDIT.md`](./docs/IMAGE_AUDIT.md) — the 23 delivered files with true
  dimensions and weights, which upload each one came from, the watermark
  disclosure, the crop decisions, and the replacement list.
- [`legacy/vanilla/`](./legacy/vanilla) — the original site, untouched.

---

© 2025 Morrow Coffee Co. · Made slowly. Served warmly.
