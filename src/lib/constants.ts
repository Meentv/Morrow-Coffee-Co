/**
 * Site-wide configuration.
 *
 * The production domain is intentionally a placeholder — the brief says not to
 * invent one. Set VITE_SITE_URL in .env to switch canonical URLs and OG tags
 * from the placeholder to the real origin.
 */

export const SITE = {
  name: "Morrow Coffee Co.",
  shortName: "Morrow",
  tagline: "Good coffee, made human",
  description:
    "Morrow Coffee Co. — warm coffee, thoughtful food, and a kitchen worth gathering around.",
  /** Placeholder until the real domain is supplied. */
  url: (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") ?? "",
  /** Placeholder OG image — see docs/IMAGE_AUDIT.md. */
  ogImage: "/images/coffee-hero.jpg",
  locale: "en_US",
  twitterHandle: "",
} as const;

/** Business details carried over verbatim from the original contact page. */
export const CONTACT = {
  address: "14 Morrow Lane, somewhere warm",
  hours: "Monday–Sunday · 7am–8pm",
  hoursShort: "Open daily · 7am — 8pm",
  phone: "+1 234 567 890",
  phoneHref: "tel:+1234567890",
  email: "hello@morrowcoffee.co",
  emailHref: "mailto:hello@morrowcoffee.co",
  groupNote: "For groups of 8+, please send an enquiry before arriving.",
} as const;

export const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Menu", to: "/menu" },
  { label: "Kitchen", to: "/kitchen" },
  { label: "Enquire", to: "/contact" },
] as const;

/**
 * Cart limits — guard rails so a persisted/stale localStorage payload or a
 * stuck auto-increment can never produce a nonsense quantity.
 */
export const CART_LIMITS = {
  maxQuantityPerLine: 99,
  maxLines: 50,
} as const;

export const CART_STORAGE_KEY = "morrow-cart";

/** How long a toast stays on screen (ms). Original used 2600ms. */
export const TOAST_DURATION_MS = 4000;

/** Mock service latency range, so loading states are actually observable. */
export const MOCK_LATENCY_MS = { min: 600, max: 1100 } as const;
