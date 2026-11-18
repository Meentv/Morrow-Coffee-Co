import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { renderAt } from "@/test/renderWithRouter";
import { resetCartStore, useCartStore } from "@/features/cart/store/cart.store";
import { formatCents } from "@/lib/currency";
import { BEANS, variantPriceCents } from "@/data/beans";

/**
 * The shop is the revenue path now, so it gets behaviour tests rather than
 * snapshot tests: choosing a variant must change what lands in the basket, and
 * the basket must carry the exact weight/grind the customer picked.
 */
function totals() {
  return useCartStore.getState().lines;
}

describe("shop page", () => {
  beforeEach(() => {
    resetCartStore();
  });

  it("renders every coffee with its specs and tasting notes", async () => {
    renderAt("/shop");
    expect(await screen.findByRole("heading", { level: 1, name: /Beans worth/i })).toBeVisible();

    for (const bean of BEANS) {
      expect(screen.getByRole("heading", { name: bean.name })).toBeInTheDocument();
      // Three tasting notes per coffee.
      for (const note of bean.notes) {
        expect(screen.getAllByText(note).length).toBeGreaterThan(0);
      }
    }
  });

  it("adds a 250g whole-bean bag with the base price by default", async () => {
    const user = userEvent.setup();
    renderAt("/shop");

    const card = (await screen.findByRole("heading", { name: "Morrow House" })).closest(
      "article",
    ) as HTMLElement;

    await user.click(within(card).getByRole("button", { name: /Add Morrow House/i }));

    const lines = totals();
    expect(lines).toHaveLength(1);
    expect(lines[0]!.id).toBe("morrow-house__250g__whole-bean");
    expect(lines[0]!.priceCents).toBe(BEANS.find((b) => b.slug === "morrow-house")!.basePriceCents);
    expect(lines[0]!.quantity).toBe(1);
  });

  it("charges the 500g price and names the grind once both are chosen", async () => {
    const user = userEvent.setup();
    renderAt("/shop");

    const card = (await screen.findByRole("heading", { name: "Morrow House" })).closest(
      "article",
    ) as HTMLElement;

    await user.click(within(card).getByRole("radio", { name: "500g" }));
    await user.selectOptions(within(card).getByLabelText(/Grind/i), "Espresso");

    const expected = variantPriceCents(BEANS[0]!.basePriceCents, "500g");
    // The card's own price updates before adding.
    expect(within(card).getAllByText(formatCents(expected)).length).toBeGreaterThan(0);

    await user.click(within(card).getByRole("button", { name: /Add Morrow House/i }));

    const lines = totals();
    expect(lines[0]!.id).toBe("morrow-house__500g__espresso");
    expect(lines[0]!.priceCents).toBe(expected);
    expect(lines[0]!.name).toContain("500g");
    expect(lines[0]!.name).toContain("Espresso");
  });

  it("treats the same bean at two grinds as two separate basket lines", async () => {
    const user = userEvent.setup();
    renderAt("/shop");

    const card = (await screen.findByRole("heading", { name: "Morrow House" })).closest(
      "article",
    ) as HTMLElement;

    await user.click(within(card).getByRole("button", { name: /Add Morrow House/i }));
    await user.selectOptions(within(card).getByLabelText(/Grind/i), "Espresso");
    await user.click(within(card).getByRole("button", { name: /Add Morrow House/i }));

    const lines = totals();
    expect(lines).toHaveLength(2);
    expect(lines[0]!.id).not.toBe(lines[1]!.id);
  });

  it("filters by roast and restores the full list", async () => {
    const user = userEvent.setup();
    renderAt("/shop");
    await screen.findByRole("heading", { name: "Morrow House" });

    await user.click(screen.getByRole("button", { name: "Light" }));

    const lightBeans = BEANS.filter((bean) => bean.roast === "Light");
    expect(screen.getAllByRole("article")).toHaveLength(lightBeans.length);
    for (const bean of lightBeans) {
      expect(screen.getByRole("heading", { name: bean.name })).toBeInTheDocument();
    }

    // aria-pressed reflects the toggle state for assistive tech.
    expect(screen.getByRole("button", { name: "Light" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "All roasts" }));
    await waitFor(() => {
      expect(screen.getAllByRole("article")).toHaveLength(BEANS.length);
    });
  });

  it("keeps the basket panel in sync with what was added", async () => {
    const user = userEvent.setup();
    renderAt("/shop");

    const card = (await screen.findByRole("heading", { name: "Night Shift" })).closest(
      "article",
    ) as HTMLElement;
    await user.click(within(card).getByRole("button", { name: /Add Night Shift/i }));

    // The side panel lists the line, scoped to the basket so the product card
    // above it cannot satisfy the assertion.
    const basket = screen.getByRole("complementary", { name: /A little table for later/i });
    await waitFor(() => {
      // The panel renders the line name and the accessible remove-button label,
      // so allow more than one match — the point is that the line is present.
      expect(within(basket).getAllByText(/Night Shift · 250g · Whole bean/).length).toBeGreaterThan(
        0,
      );
    });
  });
});
