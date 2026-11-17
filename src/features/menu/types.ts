/**
 * Menu domain types.
 *
 * Money is stored as an integer number of cents everywhere in the app.
 * `$5.50` is `550`. No floating point arithmetic is ever performed on prices.
 */

export const MENU_CATEGORIES = ["coffee", "cold", "kitchen", "bakery"] as const;

export type MenuCategory = (typeof MENU_CATEGORIES)[number];

/** Display order + labels for the category filter row, matching the original markup. */
export const CATEGORY_LABELS: Record<MenuCategory, string> = {
  coffee: "Coffee",
  cold: "Cold drinks",
  kitchen: "Kitchen",
  bakery: "Bakery",
};

export type MenuItem = {
  id: string;
  name: string;
  category: MenuCategory;
  /** Integer cents. Never a float. */
  priceCents: number;
  /** Path under /images. See docs/IMAGE_AUDIT.md for provenance status. */
  image: string;
  /** Intrinsic dimensions, required so the browser reserves layout space (no CLS). */
  width: number;
  height: number;
  alt: string;
  description: string;
  /** Featured items appear in the homepage "what's on" grid. */
  featured?: boolean;
  /** Small pill rendered over the image, e.g. "house favourite". */
  badge?: string;
  /**
   * True when the only available photo does not depict this product.
   * Surfaced in docs/IMAGE_AUDIT.md rather than hidden behind inaccurate alt text.
   */
  imageMismatch?: boolean;
  /** Optional compressed GLB under /models for the 3D preview. Omitted → procedural model. */
  model?: string;
};

/** A cart line as persisted by Zustand. Snapshot of the product at add-time. */
export type CartLine = {
  id: string;
  name: string;
  priceCents: number;
  quantity: number;
  image: string;
};

export type CartTotals = {
  itemCount: number;
  subtotalCents: number;
  totalCents: number;
};
