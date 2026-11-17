import { beforeEach, describe, expect, it } from "vitest";

import { computeTotals, resetCartStore, sanitiseLines, useCartStore } from "./cart.store";
import { CART_LIMITS } from "@/lib/constants";
import type { MenuItem } from "@/features/menu/types";

const latte: MenuItem = {
  id: "honey-oat-latte",
  name: "Honey Oat Latte",
  category: "coffee",
  priceCents: 550,
  image: "/images/coffee-hero.jpg",
  width: 800,
  height: 600,
  alt: "Honey oat latte",
  description: "Silky espresso, oat milk, and wildflower honey.",
};

const croissant: MenuItem = {
  id: "butter-croissant",
  name: "Butter Croissant",
  category: "bakery",
  priceCents: 380,
  image: "/images/pastry-counter.jpg",
  width: 800,
  height: 600,
  alt: "Butter croissant",
  description: "Flaky and warm.",
};

const actions = () => useCartStore.getState();

beforeEach(() => {
  resetCartStore();
});

describe("cart: empty state", () => {
  it("starts empty with zero totals", () => {
    const { lines } = actions();
    expect(lines).toEqual([]);
    expect(computeTotals(lines)).toEqual({ itemCount: 0, subtotalCents: 0, totalCents: 0 });
  });

  it("removing the last line returns to the empty state", () => {
    actions().addItem(latte);
    actions().removeItem(latte.id);
    expect(actions().lines).toEqual([]);
    expect(computeTotals(actions().lines).totalCents).toBe(0);
  });
});

describe("cart: adding items", () => {
  it("adds a product with quantity 1", () => {
    actions().addItem(latte);
    expect(actions().lines).toHaveLength(1);
    expect(actions().lines[0]).toMatchObject({
      id: latte.id,
      name: latte.name,
      priceCents: 550,
      quantity: 1,
    });
  });

  it("increments quantity instead of duplicating the line", () => {
    actions().addItem(latte);
    actions().addItem(latte);
    actions().addItem(latte);
    expect(actions().lines).toHaveLength(1);
    expect(actions().lines[0]?.quantity).toBe(3);
  });

  it("keeps separate lines for distinct products", () => {
    actions().addItem(latte);
    actions().addItem(croissant);
    expect(actions().lines).toHaveLength(2);
  });

  it("accepts an explicit initial quantity", () => {
    actions().addItem(croissant, 4);
    expect(actions().lines[0]?.quantity).toBe(4);
  });

  it("caps a line at the maximum quantity", () => {
    actions().addItem(latte, CART_LIMITS.maxQuantityPerLine);
    actions().addItem(latte, 10);
    expect(actions().lines[0]?.quantity).toBe(CART_LIMITS.maxQuantityPerLine);
  });
});

describe("cart: removing and quantity changes", () => {
  beforeEach(() => {
    actions().addItem(latte);
    actions().addItem(croissant);
  });

  it("removes a specific line and leaves the rest intact", () => {
    actions().removeItem(latte.id);
    expect(actions().lines.map((line) => line.id)).toEqual([croissant.id]);
  });

  it("increment raises quantity by one", () => {
    actions().increment(latte.id);
    expect(actions().lines.find((l) => l.id === latte.id)?.quantity).toBe(2);
  });

  it("decrement lowers quantity by one", () => {
    actions().increment(latte.id); // 2
    actions().decrement(latte.id); // 1
    expect(actions().lines.find((l) => l.id === latte.id)?.quantity).toBe(1);
  });

  it("decrementing a quantity of 1 removes the line", () => {
    actions().decrement(croissant.id);
    expect(actions().lines.find((l) => l.id === croissant.id)).toBeUndefined();
    expect(actions().lines).toHaveLength(1);
  });

  it("ignores increment/decrement for an unknown id", () => {
    const before = actions().lines;
    actions().increment("does-not-exist");
    actions().decrement("does-not-exist");
    expect(actions().lines).toEqual(before);
  });

  it("setQuantity rejects invalid values by removing the line", () => {
    actions().setQuantity(latte.id, 0);
    expect(actions().lines.find((l) => l.id === latte.id)).toBeUndefined();
  });

  it("setQuantity clamps to the maximum", () => {
    actions().setQuantity(croissant.id, 500);
    expect(actions().lines.find((l) => l.id === croissant.id)?.quantity).toBe(
      CART_LIMITS.maxQuantityPerLine,
    );
  });
});

describe("cart: totals", () => {
  it("sums line totals in integer cents", () => {
    actions().addItem(latte, 2); // 1100
    actions().addItem(croissant, 3); // 1140
    const totals = computeTotals(actions().lines);
    expect(totals.subtotalCents).toBe(2240);
    expect(totals.totalCents).toBe(2240);
    expect(totals.itemCount).toBe(5);
    expect(Number.isInteger(totals.totalCents)).toBe(true);
  });

  it("never returns a fractional cent", () => {
    actions().addItem({ ...latte, priceCents: 333 }, 3);
    const totals = computeTotals(actions().lines);
    expect(totals.subtotalCents % 1).toBe(0);
  });

  it("clear empties the basket", () => {
    actions().addItem(latte);
    actions().clear();
    expect(actions().lines).toEqual([]);
  });
});

describe("cart: defensive parsing of persisted payloads", () => {
  it("migrates the vanilla site's { name, price, qty } shape", () => {
    const migrated = sanitiseLines([
      { name: "Honey Oat Latte", price: 5.5, qty: 2 },
      { name: "Butter Croissant", price: 3.8, qty: 1 },
    ]);

    expect(migrated).toHaveLength(2);
    expect(migrated[0]).toMatchObject({
      id: "honey-oat-latte",
      name: "Honey Oat Latte",
      priceCents: 550,
      quantity: 2,
    });
    expect(migrated[1]?.priceCents).toBe(380);
  });

  it("drops malformed entries instead of throwing", () => {
    const cleaned = sanitiseLines([
      null,
      42,
      { name: "No price" },
      { name: "Negative", priceCents: -100, quantity: 1 },
      { name: "Zero qty", priceCents: 100, quantity: 0 },
      { name: "Good", priceCents: 100, quantity: 1 },
    ]);
    expect(cleaned).toHaveLength(1);
    expect(cleaned[0]?.name).toBe("Good");
  });

  it("returns an empty cart for non-array input", () => {
    expect(sanitiseLines(null)).toEqual([]);
    expect(sanitiseLines({ lines: [] })).toEqual([]);
    expect(sanitiseLines("nope")).toEqual([]);
  });

  it("de-duplicates repeated ids", () => {
    const cleaned = sanitiseLines([
      { id: "a", name: "A", priceCents: 100, quantity: 1 },
      { id: "a", name: "A", priceCents: 100, quantity: 5 },
    ]);
    expect(cleaned).toHaveLength(1);
  });
});

describe("cart: persistence", () => {
  it("writes the basket to localStorage under the legacy key", async () => {
    actions().addItem(latte, 2);
    // persist middleware writes synchronously on set
    const raw = localStorage.getItem("morrow-cart");
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw as string) as {
      state: { lines: Array<{ id: string; quantity: number }> };
    };
    expect(parsed.state.lines[0]).toMatchObject({ id: latte.id, quantity: 2 });
  });

  it("rehydrates a basket persisted by a previous session", async () => {
    localStorage.setItem(
      "morrow-cart",
      JSON.stringify({
        state: {
          lines: [
            {
              id: "morrow-latte",
              name: "Honey Oat Latte",
              priceCents: 550,
              quantity: 2,
              image: "",
            },
          ],
          updatedAt: 1,
        },
        version: 2,
      }),
    );

    await useCartStore.persist.rehydrate();

    expect(actions().lines).toHaveLength(1);
    expect(computeTotals(actions().lines).subtotalCents).toBe(1100);
  });

  it("applies a broadcast from another tab when it is newer", () => {
    actions().addItem(latte);
    const newer = Date.now() + 1000;

    useCartStore
      .getState()
      .replaceAll(
        [{ id: "from-other-tab", name: "Croissant", priceCents: 380, quantity: 2, image: "" }],
        newer,
      );

    expect(actions().lines).toHaveLength(1);
    expect(actions().lines[0]?.id).toBe("from-other-tab");
  });

  it("ignores a stale broadcast so a newer local edit wins", () => {
    actions().addItem(latte);
    const stale = 1;

    useCartStore
      .getState()
      .replaceAll([{ id: "stale", name: "Stale", priceCents: 100, quantity: 1, image: "" }], stale);

    expect(actions().lines[0]?.id).toBe(latte.id);
  });
});
