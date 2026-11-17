import { beforeEach, describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MenuPage from "@/pages/MenuPage";
import { renderWithRouter } from "@/test/renderWithRouter";
import { resetCartStore, useCartStore } from "@/features/cart/store/cart.store";
import { useToastStore } from "@/components/feedback/toast.store";
import { MENU_ITEMS } from "@/data/menu";

beforeEach(() => {
  resetCartStore();
  useToastStore.getState().clear();
});

const productCards = () => screen.queryAllByRole("article");

describe("menu page: rendering", () => {
  it("renders every menu item from typed data", () => {
    renderWithRouter(<MenuPage />, { route: "/menu" });
    expect(productCards()).toHaveLength(MENU_ITEMS.length);
    expect(screen.getByRole("heading", { name: "Honey Oat Latte" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Seasonal Danish" })).toBeInTheDocument();
  });

  it("shows prices formatted from integer cents", () => {
    renderWithRouter(<MenuPage />, { route: "/menu" });
    expect(screen.getAllByText("$5.50").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$3.25").length).toBeGreaterThan(0);
  });
});

describe("menu page: category filtering", () => {
  it("exposes aria-pressed on the active filter only", async () => {
    const user = userEvent.setup();
    renderWithRouter(<MenuPage />, { route: "/menu" });

    const everything = screen.getByRole("button", { name: "Everything" });
    const coffee = screen.getByRole("button", { name: "Coffee" });

    expect(everything).toHaveAttribute("aria-pressed", "true");
    expect(coffee).toHaveAttribute("aria-pressed", "false");

    await user.click(coffee);

    expect(coffee).toHaveAttribute("aria-pressed", "true");
    expect(everything).toHaveAttribute("aria-pressed", "false");
  });

  it("filters to a single category", async () => {
    const user = userEvent.setup();
    renderWithRouter(<MenuPage />, { route: "/menu" });

    await user.click(screen.getByRole("button", { name: "Bakery" }));

    const expected = MENU_ITEMS.filter((item) => item.category === "bakery");
    expect(productCards()).toHaveLength(expected.length);
    for (const item of expected) {
      expect(screen.getByRole("heading", { name: item.name })).toBeInTheDocument();
    }
  });

  it("supports deep linking with ?cat=", () => {
    renderWithRouter(<MenuPage />, { route: "/menu?cat=cold" });

    expect(screen.getByRole("button", { name: "Cold drinks" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    const expected = MENU_ITEMS.filter((item) => item.category === "cold");
    expect(productCards()).toHaveLength(expected.length);
  });

  it("ignores an unknown ?cat= value and shows everything", () => {
    renderWithRouter(<MenuPage />, { route: "/menu?cat=unicorns" });
    expect(productCards()).toHaveLength(MENU_ITEMS.length);
  });
});

describe("menu page: search", () => {
  it("narrows results as the user types", async () => {
    const user = userEvent.setup();
    renderWithRouter(<MenuPage />, { route: "/menu" });

    await user.type(screen.getByRole("searchbox", { name: "Search the menu" }), "latte");

    expect(productCards()).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Honey Oat Latte" })).toBeInTheDocument();
  });

  it("matches on description text", async () => {
    const user = userEvent.setup();
    renderWithRouter(<MenuPage />, { route: "/menu" });

    await user.type(screen.getByRole("searchbox", { name: "Search the menu" }), "ricotta");

    expect(productCards()).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Morning Toast" })).toBeInTheDocument();
  });

  it("keeps search and category in sync", async () => {
    const user = userEvent.setup();
    renderWithRouter(<MenuPage />, { route: "/menu" });

    await user.click(screen.getByRole("button", { name: "Bakery" }));
    await user.type(screen.getByRole("searchbox", { name: "Search the menu" }), "croissant");

    expect(productCards()).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Butter Croissant" })).toBeInTheDocument();
  });

  it("shows an empty state with a working reset", async () => {
    const user = userEvent.setup();
    renderWithRouter(<MenuPage />, { route: "/menu" });

    await user.type(screen.getByRole("searchbox", { name: "Search the menu" }), "zzzzz");

    expect(productCards()).toHaveLength(0);
    expect(screen.getByText(/Nothing on the menu matches that/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Show everything" }));
    expect(productCards()).toHaveLength(MENU_ITEMS.length);
  });
});

describe("menu page: cart interactions", () => {
  it("adds an item to the basket and updates the total", async () => {
    const user = userEvent.setup();
    renderWithRouter(<MenuPage />, { route: "/menu" });

    await user.click(screen.getByRole("button", { name: /Add Honey Oat Latte to basket/i }));

    const state = useCartStore.getState();
    expect(state.lines).toHaveLength(1);
    expect(state.lines[0]?.quantity).toBe(1);

    const basket = screen.getByRole("complementary");
    // The line shows the unit price ("$5.50 each") and the panel shows the total.
    expect(within(basket).getByText("$5.50 each")).toBeInTheDocument();
    expect(within(basket).getByText("$5.50", { selector: "b" })).toBeInTheDocument();
  });

  it("accumulates quantity when the same item is added twice", async () => {
    const user = userEvent.setup();
    renderWithRouter(<MenuPage />, { route: "/menu" });

    const addButton = screen.getByRole("button", { name: /Add Honey Oat Latte to basket/i });
    await user.click(addButton);
    await user.click(addButton);

    expect(useCartStore.getState().lines[0]?.quantity).toBe(2);
  });

  it("raises a toast when an item is added", async () => {
    const user = userEvent.setup();
    renderWithRouter(<MenuPage />, { route: "/menu" });

    await user.click(screen.getByRole("button", { name: /Add Butter Croissant to basket/i }));

    const messages = useToastStore.getState().toasts.map((toast) => toast.message);
    expect(messages).toContain("Butter Croissant added to your basket");
  });

  it("removes a line from the basket panel", async () => {
    const user = userEvent.setup();
    renderWithRouter(<MenuPage />, { route: "/menu" });

    await user.click(screen.getByRole("button", { name: /Add Honey Oat Latte to basket/i }));
    await user.click(screen.getByRole("button", { name: /Remove Honey Oat Latte from basket/i }));

    expect(useCartStore.getState().lines).toHaveLength(0);
    expect(screen.getByText(/Your basket is empty/i)).toBeInTheDocument();
  });

  it("increments and decrements from the basket panel", async () => {
    const user = userEvent.setup();
    renderWithRouter(<MenuPage />, { route: "/menu" });

    await user.click(screen.getByRole("button", { name: /Add Honey Oat Latte to basket/i }));
    await user.click(screen.getByRole("button", { name: /Increase quantity of Honey Oat Latte/i }));
    expect(useCartStore.getState().lines[0]?.quantity).toBe(2);

    await user.click(screen.getByRole("button", { name: /Decrease quantity of Honey Oat Latte/i }));
    expect(useCartStore.getState().lines[0]?.quantity).toBe(1);
  });

  it("refuses to continue to checkout with an empty basket", async () => {
    const user = userEvent.setup();
    renderWithRouter(<MenuPage />, { route: "/menu" });

    await user.click(screen.getByRole("button", { name: /Continue order/i }));

    const messages = useToastStore.getState().toasts.map((toast) => toast.message);
    expect(messages).toContain("Your basket is empty — add something first ☕");
  });
});
