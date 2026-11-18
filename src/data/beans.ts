/**
 * Retail coffee — the beans we sell by the bag.
 *
 * Every product is a single coffee with one or more purchasable variants. A
 * variant is a weight option; a grind choice is applied to it without changing
 * the price. That keeps the data flat and makes the price of anything the
 * customer can actually buy explicit and unambiguous.
 *
 * Money is integer cents, exactly like the rest of the app. `1900` is $19.00.
 *
 * Honesty notes:
 *  - Roast dates and tasting notes describe the shop's own offering; they are
 *    not invented certifications. `origin` states what the label states.
 *  - There is no stock count here because there is no inventory system. The
 *    shop says "roasted to order" rather than pretending to track units.
 */

export const WEIGHT_OPTIONS = ["250g", "500g", "1kg"] as const;
export type WeightOption = (typeof WEIGHT_OPTIONS)[number];

export const GRIND_OPTIONS = [
  "Whole bean",
  "Espresso",
  "Filter / pour-over",
  "French press",
  "Moka pot",
] as const;
export type GrindOption = (typeof GRIND_OPTIONS)[number];

export const ROAST_LEVELS = ["Light", "Medium", "Medium-dark", "Dark"] as const;
export type RoastLevel = (typeof ROAST_LEVELS)[number];

export type BeanVariant = {
  /** Stable id used in the basket: `${beanId}__${weight}__${grindSlug}`. */
  id: string;
  weight: WeightOption;
  /** Integer cents for one bag of this weight. */
  priceCents: number;
  /** Grams, for the "price per 100g" comparison the shop shows. */
  grams: number;
};

export type BeanProduct = {
  slug: string;
  name: string;
  /** Short editorial line, shown on the card. */
  tagline: string;
  origin: string;
  region: string;
  process: string;
  roast: RoastLevel;
  /** Tasting notes — three words, the way a bag would list them. */
  notes: readonly [string, string, string];
  description: string;
  image: string;
  width: number;
  height: number;
  alt: string;
  /**
   * Base price for 250g in cents. Variant prices are derived from this so the
   * bigger bags can offer a genuine saving without hand-maintaining 3 numbers.
   */
  basePriceCents: number;
  /** Shown as a badge on the card, e.g. "Best seller". */
  badge?: string;
  /** Featured on the homepage shop strip. */
  featured?: boolean;
};

export const WEIGHT_GRAMS: Record<WeightOption, number> = {
  "250g": 250,
  "500g": 500,
  "1kg": 1000,
};

/**
 * Bigger bags are cheaper per gram — 500g is 1.85× the 250g price rather than
 * 2×, and 1kg is 3.4×. Rounded to whole cents so the arithmetic stays exact.
 */
export function variantPriceCents(basePriceCents: number, weight: WeightOption): number {
  switch (weight) {
    case "250g":
      return basePriceCents;
    case "500g":
      return Math.round(basePriceCents * 1.85);
    case "1kg":
      return Math.round(basePriceCents * 3.4);
  }
}

export function grindSlug(grind: GrindOption): string {
  return grind
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Every weight a bean can be bought in. */
export function variantsFor(bean: BeanProduct): BeanVariant[] {
  return WEIGHT_OPTIONS.map((weight) => ({
    id: `${bean.slug}__${weight}`,
    weight,
    priceCents: variantPriceCents(bean.basePriceCents, weight),
    grams: WEIGHT_GRAMS[weight],
  }));
}

/**
 * The basket id for one exact purchase. The grind is part of the id because a
 * bag ground for espresso is not interchangeable with a bag left whole — they
 * must be separate lines, not the same line twice.
 */
export function basketIdFor(bean: BeanProduct, weight: WeightOption, grind: GrindOption): string {
  return `${bean.slug}__${weight}__${grindSlug(grind)}`;
}

export const BEANS: readonly BeanProduct[] = [
  {
    slug: "morrow-house",
    name: "Morrow House",
    tagline: "The one we pour every morning.",
    origin: "Brazil · Colombia blend",
    region: "Cerrado & Huila",
    process: "Natural + washed",
    roast: "Medium",
    notes: ["Milk chocolate", "Toasted almond", "Brown sugar"],
    description:
      "Our everyday espresso, built to be forgiving and sweet. Cocoa and almond up front, a soft brown-sugar finish, and enough body to hold its own through milk.",
    image: "/images/house-filter.jpg",
    width: 560,
    height: 420,
    alt: "A white cup of house filter coffee photographed from above beside a croissant",
    basePriceCents: 1900,
    badge: "Best seller",
    featured: true,
  },
  {
    slug: "honey-oat",
    name: "Honey Oat",
    tagline: "Wildflower honey, built for oat milk.",
    origin: "Ethiopia",
    region: "Guji",
    process: "Washed",
    roast: "Light",
    notes: ["Wildflower honey", "White peach", "Bergamot"],
    description:
      "The coffee behind our most-ordered drink. Floral and tea-like when brewed as filter, and it turns syrupy and sweet under oat milk as espresso.",
    image: "/images/honey-oat-latte.jpg",
    width: 768,
    height: 576,
    alt: "A honey oat latte with swirled latte art in a cream ceramic cup",
    basePriceCents: 2200,
    featured: true,
  },
  {
    slug: "night-shift",
    name: "Night Shift",
    tagline: "For the second pot, and the long table.",
    origin: "Sumatra",
    region: "Gayo Highlands",
    process: "Wet-hulled",
    roast: "Dark",
    notes: ["Dark cocoa", "Cedar", "Dried fig"],
    description:
      "Deep, low-acid and unapologetically heavy. The bag we reach for at closing time, and the one that survives a French press in a hurry.",
    image: "/images/salted-caramel-cold-brew.jpg",
    width: 768,
    height: 576,
    alt: "Salted caramel cold brew with soft cream and a caramel drizzle",
    basePriceCents: 2000,
  },
  {
    slug: "cardamom-morning",
    name: "Cardamom Morning",
    tagline: "Spiced the way the cortado is.",
    origin: "Guatemala",
    region: "Antigua",
    process: "Washed",
    roast: "Medium-dark",
    notes: ["Green cardamom", "Cocoa nib", "Orange peel"],
    description:
      "The house cortado in bean form: rounded cocoa, a lift of citrus, and the warm spice note that makes the morning version worth ordering twice.",
    image: "/images/cardamom-cortado.jpg",
    width: 800,
    height: 600,
    alt: "A cardamom cortado in a warm ceramic cup on a marble counter",
    basePriceCents: 2100,
    badge: "Seasonal",
  },
  {
    slug: "decaf-after-hours",
    name: "Decaf After Hours",
    tagline: "All of the ritual, none of the 2am.",
    origin: "Colombia",
    region: "Cauca",
    process: "Sugarcane decaf · washed",
    roast: "Medium",
    notes: ["Caramel", "Red apple", "Cacao"],
    description:
      "Sugarcane-process decaf that tastes like coffee rather than a compromise. Sweet, round, and genuinely good after dinner.",
    image: "/images/morning-toast.jpg",
    width: 1000,
    height: 750,
    alt: "An avocado toast and poached egg brunch plate beside a cup of coffee",
    basePriceCents: 1800,
  },
  {
    slug: "first-light",
    name: "First Light",
    tagline: "Single origin, bright and clean.",
    origin: "Kenya",
    region: "Nyeri",
    process: "Washed",
    roast: "Light",
    notes: ["Blackcurrant", "Grapefruit", "Cane sugar"],
    description:
      "Our brightest coffee: juicy acidity, red fruit, and a long clean finish. Best as filter, and best with nothing added to it.",
    image: "/images/iced-coffee.jpg",
    width: 768,
    height: 576,
    alt: "An iced coffee with caramel-toned foam in a tall glass",
    basePriceCents: 2400,
    badge: "Single origin",
  },
] as const;

export function getBeanBySlug(slug: string): BeanProduct | undefined {
  return BEANS.find((bean) => bean.slug === slug);
}

export const FEATURED_BEANS: readonly BeanProduct[] = BEANS.filter((bean) => bean.featured);

/** Price per 100g, in cents — used for the honest "value per gram" line. */
export function pricePer100g(priceCents: number, grams: number): number {
  return Math.round((priceCents / grams) * 100);
}
