import { describe, expect, it } from "vitest";

import {
  BEANS,
  FEATURED_BEANS,
  GRIND_OPTIONS,
  WEIGHT_OPTIONS,
  basketIdFor,
  getBeanBySlug,
  pricePer100g,
  variantPriceCents,
  variantsFor,
} from "./beans";

describe("bean catalogue", () => {
  it("has no duplicate slugs", () => {
    const slugs = BEANS.map((bean) => bean.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("prices are positive integer cents, never floats", () => {
    for (const bean of BEANS) {
      expect(Number.isInteger(bean.basePriceCents)).toBe(true);
      expect(bean.basePriceCents).toBeGreaterThan(0);
    }
  });

  it("every bean has exactly three tasting notes", () => {
    for (const bean of BEANS) {
      expect(bean.notes).toHaveLength(3);
    }
  });

  it("exposes a featured subset that is genuinely part of the catalogue", () => {
    expect(FEATURED_BEANS.length).toBeGreaterThan(0);
    for (const bean of FEATURED_BEANS) {
      expect(BEANS).toContain(bean);
    }
  });

  it("looks up a bean by slug and returns undefined for an unknown one", () => {
    expect(getBeanBySlug("morrow-house")?.name).toBe("Morrow House");
    expect(getBeanBySlug("not-a-coffee")).toBeUndefined();
  });
});

describe("variant pricing", () => {
  it("charges the base price for 250g", () => {
    expect(variantPriceCents(1900, "250g")).toBe(1900);
  });

  it("gives a genuine per-gram saving on bigger bags", () => {
    const perGram250 = variantPriceCents(1900, "250g") / 250;
    const perGram500 = variantPriceCents(1900, "500g") / 500;
    const perGram1kg = variantPriceCents(1900, "1kg") / 1000;
    expect(perGram500).toBeLessThan(perGram250);
    expect(perGram1kg).toBeLessThan(perGram500);
  });

  it("always produces integer cents", () => {
    for (const bean of BEANS) {
      for (const weight of WEIGHT_OPTIONS) {
        expect(Number.isInteger(variantPriceCents(bean.basePriceCents, weight))).toBe(true);
      }
    }
  });

  it("builds one variant per weight option", () => {
    const variants = variantsFor(BEANS[0]!);
    expect(variants).toHaveLength(WEIGHT_OPTIONS.length);
    expect(variants.map((v) => v.weight)).toEqual([...WEIGHT_OPTIONS]);
  });
});

describe("basket identity", () => {
  it("gives each weight and grind combination a distinct basket id", () => {
    const bean = BEANS[0]!;
    const ids = new Set<string>();
    for (const weight of WEIGHT_OPTIONS) {
      for (const grind of GRIND_OPTIONS) {
        ids.add(basketIdFor(bean, weight, grind));
      }
    }
    expect(ids.size).toBe(WEIGHT_OPTIONS.length * GRIND_OPTIONS.length);
  });

  it("is stable for the same bean, weight and grind", () => {
    const bean = BEANS[0]!;
    expect(basketIdFor(bean, "500g", "Espresso")).toBe(basketIdFor(bean, "500g", "Espresso"));
  });

  it("slugifies a grind with a slash so it is safe in an id", () => {
    const id = basketIdFor(BEANS[0]!, "250g", "Filter / pour-over");
    expect(id).not.toMatch(/[^a-z0-9_-]/);
  });
});

describe("pricePer100g", () => {
  it("computes an integer cents-per-100g figure", () => {
    expect(pricePer100g(1900, 250)).toBe(760); // $19 for 250g → $7.60/100g
  });

  it("drops as the bag gets bigger", () => {
    const small = pricePer100g(variantPriceCents(1900, "250g"), 250);
    const large = pricePer100g(variantPriceCents(1900, "1kg"), 1000);
    expect(large).toBeLessThan(small);
  });
});
