# Migration checklist — vanilla HTML/CSS/JS → React 19

The original site is preserved **untouched** in `legacy/vanilla/` for reference:

```
legacy/vanilla/
├── index.html · menu.html · kitchen.html · order.html · contact.html
└── assets/{css/styles.css, js/main.js}
```

Nothing was deleted. This table maps every existing page, section, component,
and interaction to its React equivalent, and records what changed and why.

---

## 1. Pages → routes

| Original       | Route      | React module                 | Preserved content                                                                        |
| -------------- | ---------- | ---------------------------- | ---------------------------------------------------------------------------------------- |
| `index.html`   | `/`        | `src/pages/HomePage.tsx`     | Hero, marquee, featured grid, story block, kitchen promo, 3 testimonials, newsletter CTA |
| `menu.html`    | `/menu`    | `src/pages/MenuPage.tsx`     | Page hero, "the menu" head, filter row, 12 products, basket sidebar                      |
| `kitchen.html` | `/kitchen` | `src/pages/KitchenPage.tsx`  | Hero, intro + stats, wide banner, 3 services, 5-image gallery, booking form              |
| `order.html`   | `/order`   | `src/pages/OrderPage.tsx`    | Hero, order form, basket panel, "need a chef" promo strip                                |
| `contact.html` | `/contact` | `src/pages/ContactPage.tsx`  | Hero, visit details, enquiry form, 4-item FAQ                                            |
| _(none)_       | `*`        | `src/pages/NotFoundPage.tsx` | **Added** — the original had no 404; a bad URL showed the host's error page              |

Navigation, brand mark, `Order now` CTA, cart button, and the footer were
duplicated verbatim in all five HTML files. They are now a single
`AppLayout` + `Header` + `Footer`.

---

## 2. Sections → components

| Original selector / block                                                | React component                                                      |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `.site-header`, `.nav`, `.nav-links`, `.nav-actions`                     | `components/layout/Header.tsx`                                       |
| `#menuToggle` + `.nav-links.open`                                        | `components/navigation/MobileNav.tsx`                                |
| `.cart-wrap`, `.cart-count`                                              | `components/navigation/CartButton.tsx`                               |
| `.brand`, `.brand-mark`                                                  | `components/layout/Brand.tsx`                                        |
| `.site-footer`, `.footer-top`, `.footer-col`, `.footer-bottom`           | `components/layout/Footer.tsx`                                       |
| `.hero`, `.hero-grid`, `.hero-stamp`, `.hero-note`, `.hero-bean`         | `HomePage` hero section                                              |
| `.marquee`, `.marquee-track`                                             | `features/home/components/Marquee.tsx`                               |
| `.menu-grid`, `.menu-card`, `.menu-media`, `.menu-badge`, `.menu-bottom` | `features/menu/components/MenuCard.tsx` + `MenuGrid.tsx`             |
| `.page-hero`, `.page-hero-grid`                                          | `components/layout/PageHero.tsx`                                     |
| `.section-head`                                                          | `components/layout/SectionHead.tsx`                                  |
| `.eyebrow`                                                               | `components/ui/Eyebrow.tsx`                                          |
| `.button`, `.button.primary`, `.button.soft`                             | `components/ui/Button.tsx` (`variant` prop)                          |
| `.text-link`                                                             | inline utility classes (used in 3 places, not abstracted)            |
| `.filter`, `#menuSearch`, `#menuResults`                                 | `features/menu/components/MenuFilterBar.tsx`                         |
| `.product-layout`, `.product-list`                                       | `MenuPage` grid                                                      |
| `.order-side`, `.cart-items`, `.cart-line`, `.cart-total`                | `features/cart/components/CartSummaryPanel.tsx` + `CartLineItem.tsx` |
| `.form-card`, `.form-grid`, `.field`                                     | `components/ui/Field.tsx` (TextField / TextAreaField / SelectField)  |
| `.form-status`                                                           | `components/ui/FormStatus.tsx` (`FormSuccess` / `FormError`)         |
| `.faq`, `.faq-item`, `.faq-question`, `.faq-answer`                      | `features/contact/components/FaqAccordion.tsx`                       |
| `.toast`, `#toast`                                                       | `components/feedback/Toast.tsx` + `toast.store.ts`                   |
| `.chef-services`, `.service-card`, `.service-icon`                       | `KitchenPage` services list                                          |
| `.gallery`, `.gallery figure/figcaption`                                 | `KitchenPage` gallery                                                |
| `.quote-grid`, `.quote`                                                  | `HomePage` testimonials                                              |
| `.cta-card`, `.newsletter-form`                                          | `HomePage` newsletter section + `NewsletterForm.tsx`                 |
| `.chef-grid`, `.chef-feature`, `.chef-overlay`, `.chef-side`             | `HomePage` kitchen promo                                             |
| `.story-grid`, `.story-image`, `.story-list`                             | `HomePage` story + `KitchenPage` intro                               |
| `.promo-strip`                                                           | `OrderPage` kitchen cross-sell                                       |
| `.split-08`, `.split-1`, `.wide-banner`                                  | Tailwind grid utilities on the pages that use them                   |
| `.reveal`                                                                | `components/ui/Reveal.tsx`                                           |
| `.container`                                                             | `components/ui/Container.tsx` / `container-page` utility             |

---

## 3. Interactions → implementations

| Original behaviour (`main.js`)                                           | React equivalent                                                                                             | Status                                             |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| `loadCart` / `saveCart` (localStorage `morrow-cart`)                     | Zustand + `persist`, **same storage key**, with a `migrate` that upgrades the old `{name, price, qty}` shape | Preserved + upgraded                               |
| `addToCart` (increment if exists)                                        | `cart.store.addItem`                                                                                         | Preserved                                          |
| `removeFromCart` (by index)                                              | `cart.store.removeItem` (by product id — index-based removal broke when the list re-ordered)                 | Fixed                                              |
| `cartCount` / `cartTotal` (floats, `toFixed`)                            | `computeTotals` in integer cents                                                                             | Fixed                                              |
| _nothing_                                                                | quantity increment/decrement in the basket                                                                   | **Added** (original had no way to change quantity) |
| `renderCart` (DOM innerHTML)                                             | React state → derived render                                                                                 | Preserved                                          |
| `showToast` (single element, 2600 ms)                                    | `ToastViewport` queue, variants, aria-live, dismissible                                                      | Preserved + extended                               |
| `initMobileNav` (toggle only)                                            | `MobileNav` with Escape, click-outside, focus return, `aria-controls`, tab-out close                         | Fixed (3 a11y defects)                             |
| `initMenuFilters` (`.style.display`)                                     | `useMenuFilters` with `?cat=` + `?q=` URL state                                                              | Preserved + deep links                             |
| `initForms` (preventDefault + fake success, **no validation, no names**) | React Hook Form + Zod + `form.service`                                                                       | Fixed                                              |
| `initFaq` (class toggle, `max-height: 240px`)                            | `FaqAccordion` with `aria-expanded`/`aria-controls`, measured height                                         | Fixed (clipping + a11y)                            |
| `initCheckout` (empty-cart guard)                                        | `MenuPage.handleContinue`                                                                                    | Preserved                                          |
| `initReveal` (adds `.reveal`, IntersectionObserver)                      | `Reveal` + `useInViewOnce`                                                                                   | Fixed (transform clash)                            |
| _nothing_                                                                | cross-tab cart sync (`storage` listener)                                                                     | **Added**                                          |
| _nothing_                                                                | 3D hero cup + product previews                                                                               | **Added**                                          |

---

## 4. Bugs found in the original, fixed, and documented

1. **Hover lift never worked on menu cards.** `.reveal` and
   `.menu-card:hover` both set `transform` at equal specificity, and `.reveal`
   wins on cascade order, so `transform: none` overrode `translateY(-5px)`.
   Also meant the image-zoom `overflow` context was inconsistent.
   → Fixed structurally: reveal transform on a wrapper element, hover lift on
   the card via Motion. Regression test: `MenuCard.test.tsx`.

2. **Cart maths used floats.** `$` amounts were parsed with `Number()` and
   totalled with `toFixed(2)`. Any repeated `19.99`-style price could drift.
   → Fixed: integer cents end-to-end, `formatCents` for display only.

3. **Cart removal used array indices.** Removing item 0 re-indexed every later
   line; a fast double-click could delete the wrong item.
   → Fixed: removal by stable product id.

4. **Forms had no `name` or `id` attributes.** No label was associated with its
   input, and no data could ever have been submitted. "Success" was a toast
   fired without validation.
   → Fixed: named, labelled, validated, with honest demo-mode copy.

5. **Mobile nav could not be closed with Escape or by clicking away**, never
   moved or restored focus, and lacked `aria-controls`.

6. **FAQ answers were clipped at `max-height: 240px`** and the trigger exposed no
   expanded state to assistive tech.

7. **Reveal animation could strand content invisible** — if the observer never
   fired (no `IntersectionObserver`, or the element was already in view on load),
   cards stayed at `opacity: 0`.
   → Fixed: initial state resolves to visible when the API is missing or the
   user prefers reduced motion.

8. **`menu.html` hard-coded "12 items"** in the results counter and never
   updated it on filter changes. → Now derived from the filtered list.

9. **Duplicate IDs across pages** (`#cartItems`, `#cartTotal`, `#toast` appeared
   once per document, fine) but **`#menuSearch` styling was an ID selector**,
   making the search field impossible to restyle or reuse. → Utility classes.

10. **Two product cards showed the wrong photo** (Vanilla Cloud → matcha,
    Burnt Honey Cake → cinnamon roll). Not silently re-captioned; flagged in
    `src/data/menu.ts` (`imageMismatch`) and in `docs/IMAGE_AUDIT.md`.

11. **No `<main>` skip link, no landmark structure, emoji used as icons with no
    accessible name** (the cart was announced as "Open order 0").

12. **Kitchen page reused a `.footer-bottom`-only footer**, so it had no site
    links at all — inconsistent with the other four pages. → Single shared footer.

### Polish pass (after the photos were supplied)

These were found by inspecting the rendered markup and measuring contrast, not
guessed at.

13. **Every image hover-zoom was dead.** `ProductImage` applied the caller's
    `group-hover:scale-*` class but the `<img>` only transitioned `opacity`, so
    every zoom on the menu cards and the kitchen gallery snapped instantly
    instead of easing. → the img now transitions `transform` too, and a test
    asserts the transition list so this cannot silently regress.

14. **The hover zoom fired during the fade-in.** If the pointer was already over
    a card when its photo finished loading, the image zoomed while it was still
    fading, which read as a glitch. → the zoom class is withheld until the image
    has actually loaded.

15. **`<picture>` would have collapsed the photo.** Adding a WebP `<source>`
    wraps the `<img>` in a `<picture>`, which is an inline, shrink-to-fit box by
    default — the img's `h-full`/`w-full` would resolve against zero height. →
    the `<picture>` is explicitly `block h-full w-full`. Caught before it
    shipped; the WebP path is what introduced the risk.

16. **The 3D cup covered the photographed latte.** With the real hero photo in
    place, both cups occupied the lower half of the frame and the composition
    read as a mistake. → the 3D cup moved to the blurred upper-right corner and
    deliberately breaks the frame edge, and is hidden below 900px where it would
    crowd the photo. The photograph now carries the hero.

17. **The focus ring failed WCAG 1.4.11.** `--color-gold` (#c98a45) is only
    2.87:1 on paper and 2.71:1 on cream — a 2px focus indicator needs 3:1. →
    new `--color-focus` (#b0722a) token, ≥3.11:1 on every surface in the palette
    including `espresso` and `espresso-2`.

18. **Placeholders and hint text were below 4.5:1.** Form placeholders at
    `espresso/40` measured 2.44:1 on the field background and the optional-field
    hint at `muted-strong/70` measured 3.37:1. → placeholders raised to
    `espresso/65` (5.04:1), hint to full `muted-strong` (6.78:1), and the
    newsletter demo note from `cream/45` (4.16:1) to `cream/60` (6.32:1).

---

## 5. Design tokens → Tailwind v4 `@theme`

Every original `:root` variable is preserved with the same value:

| Token                            | Value                       | Tailwind utility                   |
| -------------------------------- | --------------------------- | ---------------------------------- |
| `--espresso`                     | `#2a1c15`                   | `bg-espresso` / `text-espresso`    |
| `--espresso-2`                   | `#3c2a1f`                   | `bg-espresso-2`                    |
| `--cream`                        | `#faf6f0`                   | `bg-cream`                         |
| `--cream-2`                      | `#f3ebdf`                   | `bg-cream-2`                       |
| `--paper`                        | `#fffdf9`                   | `bg-paper`                         |
| `--gold`                         | `#c98a45`                   | `text-gold`                        |
| `--gold-2`                       | `#e3aa63`                   | `text-gold-2`                      |
| `--line`                         | `rgba(42,28,21,.12)`        | `border-line`                      |
| `--line-soft`                    | `rgba(42,28,21,.07)`        | `border-line-soft`                 |
| `--muted`                        | `rgba(42,28,21,.62)`        | `text-muted`                       |
| `--r` / `--r-lg`                 | `20px` / `28px`             | `rounded-card` / `rounded-card-lg` |
| `--shadow` / `--shadow-soft`     | (unchanged)                 | `shadow-card` / `shadow-card-soft` |
| `--font-body` / `--font-display` | Inter / Fraunces            | `font-body` / `font-display`       |
| `--ease`                         | `cubic-bezier(.22,1,.36,1)` | `ease-brand`                       |
| `--header-h`                     | `72px`                      | `h-[var(--header-h)]`              |

Typography clamps for `h1`/`h2`/`h3` are preserved verbatim in `globals.css`.

**One deliberate contrast change:** `--muted` at `rgba(42,28,21,.62)` is only
~3.4:1 on cream — below WCAG AA for body text. Small text now uses
`--color-muted-strong` (`#6b5647`, ~4.6:1). The original `--muted` value is
still used for decorative/secondary accents where it passes.

---

## 6. Breakpoints preserved

| Original media query | React                                                             |
| -------------------- | ----------------------------------------------------------------- |
| `max-width: 1060px`  | `min-[1060px]:` (grids, gallery, footer)                          |
| `max-width: 900px`   | `min-[900px]:` (hero split, mobile nav switchover, section heads) |
| `max-width: 640px`   | `min-[640px]:` (container gutter, form grid)                      |
