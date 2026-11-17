# Morrow Coffee Co. — Frontend

A warm, editorial 5-page storefront for **Morrow Coffee Co.** — plain HTML, CSS, and JavaScript (no framework), bundled with Vite for dev/build.

## Pages

| Page          | File           | What it covers                                      |
| ------------- | -------------- | --------------------------------------------------- |
| Home          | `index.html`   | Hero, featured menu, story, kitchen promo, reviews  |
| Menu          | `menu.html`    | Filterable/searchable menu with a live cart sidebar |
| Kitchen       | `kitchen.html` | Private chef & coffee-bar services, team gallery, booking form |
| Order         | `order.html`   | Pickup/delivery request form + basket summary       |
| Contact       | `contact.html` | Visit details, enquiry form, FAQ accordion          |

## Features

- **Cart** — add items from the menu; persists across pages via `localStorage`
- **Menu filters & search** — category pills + live text search with item count
- **Forms** — order, kitchen booking, enquiry, and newsletter (front-end only; wire up your backend/API to submit)
- **FAQ accordion**, **mobile nav**, **toast notifications**, **scroll-reveal animations**
- Fully responsive (mobile → desktop)

## Run it

```bash
npm install
npm run dev        # local dev server
npm run build      # production build → dist/
npm run preview    # preview the production build
```

No build step needed for simple hosting: upload the HTML files, `assets/`, and `images/` folders as-is to any static host (Netlify, Vercel, GitHub Pages, cPanel…).

## Structure

```
morrow-coffee-co/
├── index.html
├── menu.html
├── kitchen.html
├── order.html
├── contact.html
├── assets/
│   ├── css/styles.css
│   └── js/main.js
├── images/          # photography used across the site
├── vite.config.js
└── package.json
```

## Notes for handoff

- Fonts: Inter + Fraunces via Google Fonts (falls back to system fonts offline).
- Forms show a success toast only — connect `chefForm`, `orderForm`, `enquiryForm`, and `.newsletter-form` in `assets/js/main.js` to your API when the backend is ready.
- © 2025 Morrow Coffee Co.
