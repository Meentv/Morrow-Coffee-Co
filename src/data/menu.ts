import type { MenuItem } from "@/features/menu/types";

/**
 * The Morrow Coffee Co. menu — migrated verbatim from the original
 * menu.html (12 items) plus the 2 extra featured cards on the homepage.
 *
 * Prices were floats in the original (`data-price="5.50"`); they are now
 * integer cents (`550`) so all arithmetic stays exact.
 *
 * IMAGE NOTE — every `image` path below is a path the *original site*
 * referenced. The repository that was handed over contains no image files
 * at all, so each of these is currently unresolved. Intrinsic width/height
 * are the layout box the original CSS used (4:3 menu media), which is what
 * matters for reserving space; replace with the true pixel size of the real
 * photo when you drop it in. See docs/IMAGE_AUDIT.md.
 */
export const MENU_ITEMS: readonly MenuItem[] = [
  {
    id: "honey-oat-latte",
    name: "Honey Oat Latte",
    category: "coffee",
    priceCents: 550,
    image: "/images/coffee-hero.jpg",
    width: 800,
    height: 600,
    alt: "Honey oat latte in a cream ceramic cup",
    description: "Silky espresso, oat milk, and a little wildflower honey.",
    featured: true,
    badge: "house favourite",
  },
  {
    id: "house-filter",
    name: "House Filter",
    category: "coffee",
    priceCents: 325,
    image: "/images/house-filter.jpg",
    width: 800,
    height: 600,
    alt: "House filter coffee beside a pastry",
    description: "Clean, bright, and brewed for the long conversation.",
    featured: true,
  },
  {
    id: "cardamom-cortado",
    name: "Cardamom Cortado",
    category: "coffee",
    priceCents: 475,
    image: "/images/specialty-coffee-latte-cup-cafe-warm-cre-2.jpg",
    width: 800,
    height: 600,
    alt: "Cardamom cortado in a warm ceramic cup",
    description: "Short, silky, and finished with a warm spice note.",
  },
  {
    id: "maple-cappuccino",
    name: "Maple Cappuccino",
    category: "coffee",
    priceCents: 500,
    image: "/images/specialty-coffee-latte-cup-cafe-warm-cre-4.jpg",
    width: 800,
    height: 600,
    alt: "Maple cappuccino with latte art",
    description: "Double espresso, steamed milk, and a soft maple finish.",
  },
  {
    id: "orange-cold-brew",
    name: "Orange Cold Brew",
    category: "cold",
    priceCents: 525,
    image: "/images/iced-coffee.jpg",
    width: 800,
    height: 600,
    alt: "Iced coffee with caramel foam",
    description: "Slow-steeped coffee, orange peel, and a clean finish.",
  },
  {
    id: "vanilla-cloud",
    name: "Vanilla Cloud",
    category: "cold",
    priceCents: 500,
    image: "/images/matcha-cloud.jpg",
    width: 800,
    height: 600,
    alt: "Vanilla cloud — cold milk, vanilla bean, and a light espresso float",
    description: "Cold milk, vanilla bean, and a light espresso float.",
    // BUG (original): this card displayed images/matcha-cloud.jpg, a matcha latte,
    // while advertising a vanilla/espresso drink. Alt text and image disagreed.
    // The genuine photo is missing, so the mismatch cannot be silently fixed —
    // see docs/IMAGE_AUDIT.md#missing-images for the required replacement.
    imageMismatch: true,
  },
  {
    id: "salted-caramel-cold-brew",
    name: "Salted Caramel Cold Brew",
    category: "cold",
    priceCents: 575,
    image: "/images/cold-brew.jpg",
    width: 800,
    height: 600,
    alt: "Salted caramel cold brew with soft cream",
    description: "Slow coffee, soft cream, and a little sea salt.",
  },
  {
    id: "morning-toast",
    name: "Morning Toast",
    category: "kitchen",
    priceCents: 850,
    image: "/images/brunch-plate.jpg",
    width: 800,
    height: 600,
    alt: "Morning toast and seasonal brunch plate",
    description: "Sourdough, whipped ricotta, jam, and cracked pepper.",
    featured: true,
    badge: "new",
  },
  {
    id: "kitchen-breakfast",
    name: "Kitchen Breakfast",
    category: "kitchen",
    priceCents: 1200,
    image: "/images/barista-kitchen.jpg",
    width: 800,
    height: 600,
    alt: "Chef preparing a seasonal breakfast plate",
    description: "Eggs, greens, sourdough, and today's seasonal extra.",
  },
  {
    id: "butter-croissant",
    name: "Butter Croissant",
    category: "bakery",
    priceCents: 380,
    image: "/images/pastry-counter.jpg",
    width: 800,
    height: 600,
    alt: "Fresh pastries at the bakery counter",
    description: "Flaky, warm, and baked before the first pour.",
    featured: true,
    badge: "fresh daily",
  },
  {
    id: "burnt-honey-cake",
    name: "Burnt Honey Cake",
    category: "bakery",
    priceCents: 625,
    image: "/images/cinnamon-roll.jpg",
    width: 800,
    height: 600,
    alt: "Fresh cinnamon roll with icing",
    description: "Soft crumb, dark honey, and a little sea salt.",
    // BUG (original): a cinnamon-roll photo on a card for Burnt Honey Cake.
    // Documented, not silently re-captioned. See docs/IMAGE_AUDIT.md.
    imageMismatch: true,
  },
  {
    id: "seasonal-danish",
    name: "Seasonal Danish",
    category: "bakery",
    priceCents: 425,
    image: "/images/coffee-pastries-croissant-bakery-breakfa-4.jpg",
    width: 800,
    height: 600,
    alt: "Seasonal danish pastry",
    description: "Buttery pastry with whatever fruit looks best today.",
  },
] as const;

/** Homepage "what's on" grid — four featured items, in the original order. */
export const FEATURED_ITEMS: readonly MenuItem[] = MENU_ITEMS.filter((item) => item.featured);

export function getMenuItemById(id: string): MenuItem | undefined {
  return MENU_ITEMS.find((item) => item.id === id);
}

/** Categories that actually have at least one item, in canonical order. */
export function getAvailableCategories(): readonly MenuItem["category"][] {
  const present = new Set(MENU_ITEMS.map((item) => item.category));
  return (["coffee", "cold", "kitchen", "bakery"] as const).filter((c) => present.has(c));
}
