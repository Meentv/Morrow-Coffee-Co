import type { MenuItem } from "@/features/menu/types";

/**
 * The Morrow Coffee Co. menu — migrated verbatim from the original
 * menu.html (12 items) plus the 2 extra featured cards on the homepage.
 *
 * Prices were floats in the original (`data-price="5.50"`); they are now
 * integer cents (`550`) so all arithmetic stays exact.
 *
 * IMAGE NOTE — every `image` path below resolves to a real file in
 * `public/images/`. `width`/`height` are the true pixel dimensions of that
 * file, so the browser reserves the exact layout box and CLS stays at 0.
 * Files are 4:3 for menu cards except where noted. Provenance, cropping and
 * the two remaining product mismatches are documented in docs/IMAGE_AUDIT.md.
 */
export const MENU_ITEMS: readonly MenuItem[] = [
  {
    id: "honey-oat-latte",
    name: "Honey Oat Latte",
    category: "coffee",
    priceCents: 550,
    image: "/images/honey-oat-latte.jpg",
    width: 768,
    height: 576,
    alt: "Honey oat latte with swirled latte art in a cream ceramic cup",
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
    width: 560,
    height: 420,
    alt: "House filter coffee in a white cup, seen from above, beside a croissant",
    description: "Clean, bright, and brewed for the long conversation.",
    featured: true,
  },
  {
    id: "cardamom-cortado",
    name: "Cardamom Cortado",
    category: "coffee",
    priceCents: 475,
    image: "/images/cardamom-cortado.jpg",
    width: 800,
    height: 600,
    alt: "Cardamom cortado in a warm ceramic cup on a marble counter",
    description: "Short, silky, and finished with a warm spice note.",
  },
  {
    id: "maple-cappuccino",
    name: "Maple Cappuccino",
    category: "coffee",
    priceCents: 500,
    image: "/images/maple-cappuccino.jpg",
    width: 600,
    height: 450,
    alt: "Maple cappuccino with latte art in a cream cup",
    description: "Double espresso, steamed milk, and a soft maple finish.",
  },
  {
    id: "orange-cold-brew",
    name: "Orange Cold Brew",
    category: "cold",
    priceCents: 525,
    image: "/images/orange-cold-brew.jpg",
    width: 768,
    height: 576,
    alt: "Iced coffee with caramel-coloured foam in a tall glass",
    description: "Slow-steeped coffee, orange peel, and a clean finish.",
  },
  {
    id: "vanilla-cloud",
    name: "Vanilla Cloud",
    category: "cold",
    priceCents: 500,
    image: "/images/vanilla-cloud.jpg",
    width: 768,
    height: 576,
    alt: "Iced matcha latte in a tall glass",
    description: "Cold milk, vanilla bean, and a light espresso float.",
    // STILL MISMATCHED: the only cold-drink photo supplied is a green matcha
    // latte, which is not this product. The alt text now describes the photo
    // honestly instead of the product, and the card shows a "photo pending"
    // badge. Replacement needed — see docs/IMAGE_AUDIT.md.
    imageMismatch: true,
  },
  {
    id: "salted-caramel-cold-brew",
    name: "Salted Caramel Cold Brew",
    category: "cold",
    priceCents: 575,
    image: "/images/salted-caramel-cold-brew.jpg",
    width: 768,
    height: 576,
    alt: "Salted caramel cold brew with soft cream and a caramel drizzle",
    description: "Slow coffee, soft cream, and a little sea salt.",
  },
  {
    id: "morning-toast",
    name: "Morning Toast",
    category: "kitchen",
    priceCents: 850,
    image: "/images/morning-toast.jpg",
    width: 1000,
    height: 750,
    alt: "Avocado toast and poached eggs on a brunch plate by the window",
    description: "Sourdough, whipped ricotta, jam, and cracked pepper.",
    featured: true,
    badge: "new",
  },
  {
    id: "kitchen-breakfast",
    name: "Kitchen Breakfast",
    category: "kitchen",
    priceCents: 1200,
    image: "/images/kitchen-breakfast.jpg",
    width: 1000,
    height: 750,
    alt: "Chef plating a seasonal breakfast dish in the Morrow kitchen",
    description: "Eggs, greens, sourdough, and today's seasonal extra.",
  },
  {
    id: "butter-croissant",
    name: "Butter Croissant",
    category: "bakery",
    priceCents: 380,
    image: "/images/butter-croissant.jpg",
    width: 520,
    height: 390,
    alt: "Butter croissant beside a cup of coffee on a grey plate",
    description: "Flaky, warm, and baked before the first pour.",
    featured: true,
    badge: "fresh daily",
  },
  {
    id: "burnt-honey-cake",
    name: "Burnt Honey Cake",
    category: "bakery",
    priceCents: 625,
    image: "/images/burnt-honey-cake.jpg",
    width: 588,
    height: 441,
    alt: "Pastries cooling on a bakery rack",
    description: "Soft crumb, dark honey, and a little sea salt.",
    // STILL MISMATCHED: the closest supplied photo is a tray of pastries, not a
    // slice of burnt honey cake. Flagged rather than silently re-captioned.
    // See docs/IMAGE_AUDIT.md.
    imageMismatch: true,
  },
  {
    id: "seasonal-danish",
    name: "Seasonal Danish",
    category: "bakery",
    priceCents: 425,
    image: "/images/seasonal-danish.jpg",
    width: 328,
    height: 240,
    alt: "Seasonal danish pastries on a bakery tray",
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
