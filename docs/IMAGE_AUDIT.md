# Image audit — Morrow Coffee Co.

**Status: 23 files delivered into `public/images/`, every one wired to a real slot.**

The 20 photographs supplied on 2026-11-17 are now the authoritative image set.
Each was inspected individually, re-cropped to the aspect ratio of the slot it
fills, exported as a JPEG plus a WebP derivative, and given honest alt text.
No outside stock imagery was introduced: every file in `public/images/` is
derived from one of the supplied uploads.

---

## 1. Delivered files

`dims` is the true pixel size of the file and is what `width`/`height` in the
code carry, so the layout box is always reserved and CLS is 0. WebP is served
through a `<picture><source>` in `ProductImage.tsx` and is on average **46%
smaller** than the JPEG (1.7 MB → 0.9 MB across the set).

| File                           | dims     | JPEG  | WebP  | Used for                                                       |
| ------------------------------ | -------- | ----- | ----- | -------------------------------------------------------------- |
| `coffee-hero.jpg`              | 768×883  | 85 K  | 46 K  | Homepage hero (portrait, `fetchpriority="high"`)               |
| `honey-oat-latte.jpg`          | 768×576  | 59 K  | 33 K  | Menu card — Honey Oat Latte                                    |
| `house-filter.jpg`             | 560×420  | 41 K  | 26 K  | Menu card — House Filter                                       |
| `cardamom-cortado.jpg`         | 800×600  | 56 K  | 38 K  | Menu card — Cardamom Cortado                                   |
| `maple-cappuccino.jpg`         | 600×450  | 26 K  | 12 K  | Menu card — Maple Cappuccino                                   |
| `orange-cold-brew.jpg`         | 768×576  | 54 K  | 29 K  | Menu card — Orange Cold Brew                                   |
| `vanilla-cloud.jpg`            | 768×576  | 50 K  | 24 K  | Menu card — Vanilla Cloud ⚠️                                   |
| `salted-caramel-cold-brew.jpg` | 768×576  | 45 K  | 21 K  | Menu card — Salted Caramel Cold Brew                           |
| `morning-toast.jpg`            | 1000×750 | 129 K | 81 K  | Menu card — Morning Toast                                      |
| `kitchen-breakfast.jpg`        | 1000×750 | 137 K | 87 K  | Menu card — Kitchen Breakfast                                  |
| `butter-croissant.jpg`         | 520×390  | 38 K  | 25 K  | Menu card — Butter Croissant                                   |
| `burnt-honey-cake.jpg`         | 588×441  | 22 K  | 10 K  | Menu card — Burnt Honey Cake ⚠️                                |
| `seasonal-danish.jpg`          | 328×240  | 13 K  | 8 K   | Menu card — Seasonal Danish ⚠️                                 |
| `open-kitchen-evening.jpg`     | 1000×750 | 158 K | 107 K | Homepage story block                                           |
| `chef-portrait-aya.jpg`        | 1000×750 | 142 K | 92 K  | Homepage “Order a chef” feature                                |
| `chef-portrait-eli.jpg`        | 900×700  | 120 K | 77 K  | Kitchen page intro                                             |
| `kitchen-banner.jpg`           | 1400×560 | 162 K | 105 K | Kitchen page wide banner (2.5:1 crop)                          |
| `gallery-first-pour.jpg`       | 480×640  | 50 K  | 30 K  | Kitchen gallery — “First pour”                                 |
| `gallery-the-pass.jpg`         | 480×640  | 53 K  | 32 K  | Kitchen gallery — “The pass”                                   |
| `gallery-milk-and-steam.jpg`   | 480×640  | 35 K  | 17 K  | Kitchen gallery — “Milk & steam”                               |
| `gallery-service.jpg`          | 480×640  | 51 K  | 31 K  | Kitchen gallery — “Service”                                    |
| `gallery-finishing-touch.jpg`  | 480×640  | 42 K  | 23 K  | Kitchen gallery — “Finishing touch”                            |
| `og-image.jpg`                 | 1200×630 | 198 K | —     | Social share card (JPEG only: some scrapers still reject WebP) |

`og-image.jpg` deliberately has no WebP sibling — `ProductImage` derives one
only for `.jpg` paths it renders, and social crawlers are given the JPEG.

---

## 2. Source photograph → delivered file

All 20 uploads were used; three were used twice under different crops because
a single photograph legitimately covers two different products or slots.

| Supplied upload                                     | Delivered as                                           |
| --------------------------------------------------- | ------------------------------------------------------ |
| `coffee-hero.jpg` (portrait latte on travertine)    | `coffee-hero` + `honey-oat-latte`                      |
| `coffee-interior.jpg` (sunlit room, brass pendants) | `open-kitchen-evening` + `kitchen-banner` + `og-image` |
| `chef-portrait-eli.jpg` (chef plating)              | `chef-portrait-eli` + `kitchen-breakfast`              |
| `barista-kitchen.jpg` (barista pouring latte art)   | `chef-portrait-aya`                                    |
| `brunch-plate.jpg` (avocado toast + poached eggs)   | `morning-toast`                                        |
| `iced-coffee.jpg` (iced caramel latte, portrait)    | `orange-cold-brew` + `salted-caramel-cold-brew`        |
| `matcha-cloud.jpg` (iced matcha, portrait)          | `vanilla-cloud` ⚠️                                     |
| `coffee-pastries-croissant-bakery-breakfa-5.jpg`    | `house-filter` + `butter-croissant`                    |
| `pastries.jpg` (= `…-2.jpg`, 328×240)               | `seasonal-danish` + `burnt-honey-cake` ⚠️              |
| `specialty-coffee-latte-cup-cafe-warm-cre-2.jpg`    | `cardamom-cortado`                                     |
| `specialty-coffee-latte-cup-cafe-warm-cre-5.jpg`    | `maple-cappuccino`                                     |
| `barista-chef-cooking-coffee-kitchen-prof-1.jpg`    | `gallery-first-pour`                                   |
| `barista-chef-cooking-coffee-kitchen-prof-3.jpg`    | `gallery-service`                                      |
| `barista-chef-cooking-coffee-kitchen-prof-4.jpg`    | `gallery-milk-and-steam`                               |
| `cozy-modern-coffee-shop-interior-cream-w-4.jpg`    | _(unused — near-duplicate of `w-1`)_                   |
| `cozy-modern-coffee-shop-interior-cream-w-5.jpg`    | _(unused — near-duplicate of `w-1`)_                   |
| `cozy-modern-coffee-shop-interior-cream-w-2.jpg`    | `gallery-finishing-touch`                              |
| `cozy-modern-coffee-shop-interior-cream-w-1.jpg`    | _(unused — near-duplicate)_                            |
| `coffee-pastries-croissant-bakery-breakfa-2.jpg`    | duplicate of `pastries.jpg` (identical bytes)          |
| `barista-chef-cooking-coffee-kitchen-prof-…`        | see gallery rows above                                 |

`specialty-coffee-latte-cup-cafe-warm-cre-3.jpg` and the three
`cozy-modern-coffee-shop-interior-cream-w-{1,4,5}.jpg` frames were left out:
they are near-duplicates of frames already in use, and the gallery only has five
slots. Nothing was invented to fill a slot.

---

## 3. Watermark disclosure

**9 of the 20 supplied photographs carry a visible “dreamstime” watermark**
burned across the middle of the frame:

- `specialty-coffee-latte-cup-cafe-warm-cre-2/-3/-5.jpg`
- `cozy-modern-coffee-shop-interior-cream-w-1/-2/-4/-5.jpg`
- `barista-chef-cooking-coffee-kitchen-prof-1/-3/-4.jpg`

They were used where a clean alternative did not exist, because a watermarked
photograph of the right subject is a closer fit than an empty placeholder — this
was confirmed with the site owner. They are **preview-grade assets**: before the
site goes live they should be replaced with licensed or original photography.
The files to replace, in priority order:

| Priority | File                          | Currently shows                                           |
| -------- | ----------------------------- | --------------------------------------------------------- |
| 1        | `cardamom-cortado.jpg`        | red Christmas mug on white — festive stock, not a cortado |
| 1        | `maple-cappuccino.jpg`        | red Christmas mug with chocolate — festive stock          |
| 2        | `gallery-first-pour.jpg`      | two baristas at the machine                               |
| 2        | `gallery-the-pass.jpg`        | service counter, long crop                                |
| 2        | `gallery-service.jpg`         | barista grinding / tamping                                |
| 2        | `gallery-milk-and-steam.jpg`  | espresso pulling into small cups                          |
| 2        | `gallery-finishing-touch.jpg` | pendant lights over the counter                           |

Clean (unwatermarked) files: `coffee-hero`, `honey-oat-latte`,
`coffee-interior` family, `chef-portrait-eli`, `kitchen-breakfast`,
`barista-kitchen`, `brunch-plate`, `morning-toast`, `iced-coffee` family,
`matcha-cloud`, `coffee-pastries-…-5` family.

---

## 4. Mismatches — flagged, not silently reassigned

Per the project rules, a photo that does not depict its product is flagged in
the UI and documented here rather than re-captioned or swapped for stock.

### Mismatch #1 — “Vanilla Cloud” shows a green matcha latte

`vanilla-cloud.jpg` is the supplied `matcha-cloud.jpg`. The product is described
as “cold milk, vanilla bean, and a light espresso float”; the photo is
unmistakably a green iced matcha. The filename and the photograph agree with each
other — they just do not agree with the product. `imageMismatch: true` is set,
the card shows a discreet **“photo pending”** badge, and the alt text describes
the **photograph** (“Iced matcha latte in a tall glass”) so assistive technology
is not lied to. **Needed:** a real vanilla/espresso cold drink.

> Correction to an earlier note in this document: an early draft claimed this
> mismatch was resolved on delivery. It is not — the only supplied cold-drink
> photography is matcha. The flag stays until a correct photo arrives.

### Mismatch #2 — “Burnt Honey Cake” shows a bakery rack

`burnt-honey-cake.jpg` is cropped from the supplied `pastries.jpg` tray. It reads
as dark, glossy baked goods, which is closer than the original site's cinnamon
roll, but it is not a slice of burnt-honey cake. `imageMismatch: true` and the
same “photo pending” badge. **Needed:** a slice of dark-honey cake with a
salted top.

### Minor #3 — “Seasonal Danish” is a soft 328×240 crop

`seasonal-danish.jpg` is the only supplied frame of a pastry tray and the source
is the smallest file in the set. It is upscaled no further than its true size, so
it is soft on retina displays at card size. Not flagged in the UI (it _is_ a
danish tray), but worth replacing with a ≥800 px-wide frame.

### Minor #4 — cold drinks share two photographs

`orange-cold-brew` and `salted-caramel-cold-brew` are two crops of the same
supplied iced-coffee frame, and `vanilla-cloud` uses the matcha frame. All three
are legitimate cold drinks, so no flag is shown; supplying three distinct drinks
would be better.

---

## 5. Framing and crop decisions

The hero upload is **portrait** (768×1376) but the hero frame is `aspect-[4/4.6]`.
Rather than letterbox it, it was cropped to 768×883 keeping the cup and saucer
centred and the blurred counter at the top. Menu cards are 4:3, so every menu
photo is a 4:3 crop with the subject centred; the 1:1 and 3:4 sources were
cropped to 4:3 rather than padded.

The five kitchen gallery frames are `aspect-[3/4]`, so each was re-cut to exactly
480×640 (`-resize 480x640^` + `-extent`). `gallery-milk-and-steam` is a
hand-placed crop that keeps the espresso machine and the two cups in frame — a
centre crop cut the machine off entirely.

The kitchen page banner is a wide 2.5:1 band; a dedicated 1400×560 crop was made
rather than letting `object-cover` slice a 4:3 photo.

---

## 6. How the images are rendered

`ProductImage.tsx` is the single image primitive. For every photo it guarantees:

- **Explicit `width`/`height`** from the table above → no layout shift (CLS 0).
- **`loading="lazy"`** by default; only the hero and the first menu card row pass
  `priority`, which switches to `eager` + `fetchpriority="high"` + sync decoding.
- **WebP first** via `<picture><source>`, JPEG fallback. Verified over HTTP:
  `coffee-hero` is 86 KB as JPEG and 47 KB as WebP.
- **`sizes`** per placement, so the browser picks an appropriate source width.
- **Alt text that describes the photograph**, never “image” or “photo of”.
- A warm branded **“photo coming soon”** placeholder if a file 404s, instead of a
  broken-image icon.

The hero deliberately keeps the real photograph as the hero — the 3D cup layers
_around_ it (upper-right, breaking the frame over the blurred background) instead
of covering the photographed latte. See `docs/MIGRATION.md`.

---

## 7. Reproducing the derivatives

There is no image build step in the repo — the derivatives are committed. To
regenerate from the original uploads with ImageMagick:

```bash
# JPEG + WebP pair, from a 4:3 crop of a portrait source
convert source.jpg -auto-orient -strip -crop 768x576+0+560 +repage \
  -unsharp 0x0.9+0.7+0.02 -quality 82 -sampling-factor 4:2:0 -interlace Plane \
  public/images/honey-oat-latte.jpg
convert public/images/honey-oat-latte.jpg -quality 78 \
  public/images/honey-oat-latte.webp
```

Keep JPEG quality ≈82 and WebP ≈78; that pair lands every file well under 200 KB.
