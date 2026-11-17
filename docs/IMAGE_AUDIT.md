# Image audit — Morrow Coffee Co.

**Status: every original photo is missing from the repository.**

The five original pages referenced 20 distinct image files. None of them were
present in the working tree, and `git rev-list --objects --all` shows they were
never committed either — the repo only ever contained the HTML, CSS and JS.

Nothing has been invented or replaced with stock photography. Where a photo is
unavailable, the UI shows a labelled placeholder and this document records what
is needed. The two **mismatched** images from the original site are flagged
rather than silently re-captioned.

---

## 1. Files the original site referenced

| # | Filename | Section / product | Alt text now in use | Status |
|---|----------|-------------------|---------------------|--------|
| 1 | `coffee-hero.jpg` | Homepage hero **and** menu card "Honey Oat Latte" | "Latte in a cream cup on a warm coffee shop table" (hero) · "Honey oat latte in a cream ceramic cup" (card) | **MISSING** — also used as the OG image |
| 2 | `pastries.jpg` | Homepage featured card "Butter Croissant" | "Fresh croissants and pastries" | **MISSING** |
| 3 | `coffee-drinks-range.jpg` | Homepage featured card "House Filter" | "A range of fresh coffee drinks" | **MISSING** |
| 4 | `brunch-plate.jpg` | "Morning Toast" (homepage + menu) | "Morning toast and seasonal brunch plate" | **MISSING** |
| 5 | `open-kitchen-evening.jpg` | Homepage story block + Kitchen page wide banner | "Morrow Coffee Co. warm interior" · "Morrow open kitchen in the evening" | **MISSING** |
| 6 | `chef-portrait-aya.jpg` | Homepage "Order a chef" feature | "Morrow barista preparing coffee in the kitchen" | **MISSING** |
| 7 | `chef-portrait-eli.jpg` | Kitchen page intro | "Morrow chef pouring coffee at an espresso bar" | **MISSING** |
| 8 | `house-filter.jpg` | Menu card "House Filter" | "House filter coffee beside a pastry" | **MISSING** |
| 9 | `specialty-coffee-latte-cup-cafe-warm-cre-2.jpg` | Menu card "Cardamom Cortado" | "Cardamom cortado in a warm ceramic cup" | **MISSING** |
| 10 | `specialty-coffee-latte-cup-cafe-warm-cre-4.jpg` | Menu card "Maple Cappuccino" | "Maple cappuccino with latte art" | **MISSING** |
| 11 | `iced-coffee.jpg` | Menu card "Orange Cold Brew" | "Iced coffee with caramel foam" | **MISSING** — see mismatch #2 |
| 12 | `matcha-cloud.jpg` | Menu card "Vanilla Cloud" | "Vanilla cloud — cold milk, vanilla bean, and a light espresso float" | **MISSING — WRONG PRODUCT** (see below) |
| 13 | `cold-brew.jpg` | Menu card "Salted Caramel Cold Brew" | "Salted caramel cold brew with soft cream" | **MISSING** |
| 14 | `barista-kitchen.jpg` | Menu card "Kitchen Breakfast" | "Chef preparing a seasonal breakfast plate" | **MISSING** |
| 15 | `pastry-counter.jpg` | Menu card "Butter Croissant" | "Fresh pastries at the bakery counter" | **MISSING** |
| 16 | `cinnamon-roll.jpg` | Menu card "Burnt Honey Cake" | "Fresh cinnamon roll with icing" | **MISSING — WRONG PRODUCT** (see below) |
| 17 | `coffee-pastries-croissant-bakery-breakfa-4.jpg` | Menu card "Seasonal Danish" | "Seasonal danish pastry" | **MISSING** |
| 18 | `barista-chef-cooking-coffee-kitchen-prof-1.jpg` | Kitchen gallery "First pour" | "Morrow barista at the espresso station" | **MISSING** |
| 19 | `barista-chef-cooking-coffee-kitchen-prof-2.jpg` | Kitchen gallery "The pass" | "Chef plating in the Morrow kitchen" | **MISSING** |
| 20 | `barista-chef-cooking-coffee-kitchen-prof-3.jpg` | Kitchen gallery "Milk & steam" | "Barista steaming milk for a latte" | **MISSING** |
| 21 | `barista-chef-cooking-coffee-kitchen-prof-4.jpg` | Kitchen gallery "Service" | "Kitchen team preparing service" | **MISSING** |
| 22 | `barista-chef-cooking-coffee-kitchen-prof-5.jpg` | Kitchen gallery "Finishing touch" | "Chef finishing a plate at Morrow" | **MISSING** |

> 22 references across 20 unique filenames (`coffee-hero.jpg` and
> `open-kitchen-evening.jpg` and `brunch-plate.jpg` are each reused).

---

## 2. Mismatches found in the original site (not silently "fixed")

### Mismatch #1 — "Vanilla Cloud" showed a **matcha** latte

- **Original markup:** card titled **Vanilla Cloud**, described as
  "Cold milk, vanilla bean, and a light espresso float", using
  `images/matcha-cloud.jpg` with `alt="Iced matcha latte"`.
- **Why it's wrong:** the filename *and* the alt text describe a green-tea
  matcha drink. The product is a white/cream vanilla-espresso drink. A
  sighted guest was shown the wrong beverage; a screen-reader user was told the
  wrong beverage by the alt text as well.
- **What I did:** kept the product, kept the copy, kept the existing image path
  (it is the only asset the original offered), and set `imageMismatch: true`
  in `src/data/menu.ts`. That renders a discreet **"photo pending"** flag on
  the card and marks it in the audit instead of pretending the photo is right.
  The alt text now describes the **product**, not the photo, so assistive tech
  is no longer lied to — but this is a stop-gap, not a fix.
- **What I need from you:** a real photo of a vanilla cold-milk espresso drink,
  saved as `public/images/vanilla-cloud.jpg`, then (a) update the `image` and
  `alt` fields for `vanilla-cloud` in `src/data/menu.ts`, and (b) delete
  `imageMismatch: true`.

### Mismatch #2 — "Burnt Honey Cake" showed a **cinnamon roll**

- **Original markup:** card titled **Burnt Honey Cake**, described as
  "Soft crumb, dark honey, and a little sea salt", using
  `images/cinnamon-roll.jpg` with `alt="Fresh cinnamon roll with icing"`.
- **Why it's wrong:** a glazed spiral cinnamon bun is not a slice of burnt-honey
  cake. Same treatment as above (`imageMismatch: true`).
- **What I need from you:** `public/images/burnt-honey-cake.jpg` — a slice of
  dark-honey cake with a salted top.

### Minor mismatch #3 — "Orange Cold Brew" used `iced-coffee.jpg`

- The photo is described as *"Iced coffee with caramel foam"*, but the card
  is an **orange** cold brew (orange peel, clean finish). Any iced coffee is a
  defensible stand-in, so this is flagged as a nice-to-have rather than
  marked as wrong on the page.
- **Recommended:** `public/images/orange-cold-brew.jpg` — an iced coffee with an
  orange twist/peel garnish.

---

## 3. Missing images with no original reference at all

These are needed for features that exist in the design but had no asset:

| Purpose | Recommended path | Notes |
|---------|------------------|-------|
| Open Graph / social share card | `public/images/og-image.jpg` | **1200×630**, real photo of the room or a latte. `SITE.ogImage` in `src/lib/constants.ts` currently points at `coffee-hero.jpg`, which does not exist, so link previews will fall back to nothing until this is supplied. |
| 3D scene static poster (optional) | `public/images/hero-cup-poster.webp` | Not needed — the hero uses an inline SVG poster, which costs 0 KB of requests. Only supply this if you prefer a photo fallback. |

---

## 4. Reuse / mapping check

Every image is mapped to exactly one product or section, with no image reused
across two different products **except** `coffee-hero.jpg`, which the original
site deliberately used for both the homepage hero and the Honey Oat Latte card.
That is intentional (same drink) and preserved.

Two figures in the original markup had **no** width/height attributes, no
`loading`, and no `decoding` hints. All images now have explicit intrinsic
dimensions (no layout shift), `loading="lazy"` below the fold, and
`fetchpriority="high"` + eager decoding on the hero only.

---

## 5. How to add the photos

1. Export each at 2× its display size, JPEG quality ≈80, under 250 KB.
2. Name them exactly as in the table above and drop them into `public/images/`.
3. Set the true pixel dimensions in `src/data/menu.ts` (`width` / `height`) so
   aspect-ratio reservation stays accurate. The layout box is 4:3 for menu
   cards; supplying 800×600 keeps it exact.
4. If you also export WebP, add `<source>` support in
   `src/features/menu/components/ProductImage.tsx` and update this document.

No code changes are required for files 1–22: the paths already match.

---

## 6. What the site does *right now* without these files

- Menu cards, hero, story block, kitchen gallery: warm branded placeholder with
  a small "Photo coming soon" label.
- Alt text is present and describes the intended subject, so assistive
  technology still conveys what the picture *is meant to be*.
- No broken-image icons, no layout shift, no console errors, and no failed
  requests blocking render (images are lazy and non-blocking).
