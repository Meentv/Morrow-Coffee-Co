import { beforeEach, describe, expect, it } from "vitest";
import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import { AppLayout } from "@/app/AppLayout";
import { resetCartStore, useCartStore } from "@/features/cart/store/cart.store";
import { MENU_ITEMS } from "@/data/menu";
import { useToastStore } from "@/components/feedback/toast.store";

function renderApp(route = "/menu") {
  const router = createMemoryRouter(
    [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <p>Home content</p> },
          { path: "menu", element: <p>Menu content</p> },
          { path: "kitchen", element: <p>Kitchen content</p> },
          { path: "order", element: <p>Order content</p> },
          { path: "contact", element: <p>Contact content</p> },
        ],
      },
    ],
    { initialEntries: [route] },
  );
  return render(<RouterProvider router={router} />);
}

beforeEach(() => {
  resetCartStore();
  useToastStore.getState().clear();
});

describe("header: structure and landmarks", () => {
  it("exposes a main landmark, a primary nav, and a skip link", () => {
    renderApp();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Skip to main content/i })).toHaveAttribute(
      "href",
      "#main-content",
    );
  });

  it("marks the current page in the desktop nav", () => {
    renderApp("/menu");
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getByRole("link", { name: "Menu" })).toHaveAttribute("aria-current", "page");
  });
});

describe("header: mobile navigation", () => {
  const openTrigger = () => screen.getByRole("button", { name: /Open navigation menu/i });

  it("is collapsed by default and exposes aria-expanded + aria-controls", () => {
    renderApp();
    const trigger = openTrigger();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-controls", "mobile-navigation");
  });

  it("opens on click and reveals the mobile nav", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(openTrigger());

    const trigger = screen.getByRole("button", { name: /Close navigation menu/i });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("navigation", { name: "Mobile" })).toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the toggle", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(openTrigger());
    await user.keyboard("{Escape}");

    const trigger = screen.getByRole("button", { name: /Open navigation menu/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("closes when clicking outside the panel", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(openTrigger());
    await user.click(screen.getByText("Menu content"));

    expect(screen.getByRole("button", { name: /Open navigation menu/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("closes as soon as the route changes, without an extra paint", async () => {
    const user = userEvent.setup();
    renderApp("/");

    await user.click(openTrigger());
    const mobileNav = screen.getByRole("navigation", { name: "Mobile" });
    await user.click(within(mobileNav).getByRole("link", { name: "Menu" }));

    // After navigation the trigger is already in its collapsed state.
    expect(screen.getByRole("button", { name: /Open navigation menu/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("closes after following a link", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(openTrigger());
    const mobileNav = screen.getByRole("navigation", { name: "Mobile" });
    await user.click(within(mobileNav).getByRole("link", { name: "Kitchen" }));

    expect(await screen.findByText("Kitchen content")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Open navigation menu/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});

describe("header: cart badge", () => {
  it("describes an empty basket explicitly", () => {
    renderApp();
    expect(screen.getByRole("link", { name: /basket is empty/i })).toBeInTheDocument();
  });

  it("announces the item count and pluralises correctly", async () => {
    useCartStore.getState().addItem(MENU_ITEMS[0]!);
    renderApp();
    expect(screen.getByRole("link", { name: /basket, 1 item\b/i })).toBeInTheDocument();

    act(() => {
      useCartStore.getState().addItem(MENU_ITEMS[0]!);
    });

    await waitFor(() =>
      expect(screen.getByRole("link", { name: /basket, 2 items/i })).toBeInTheDocument(),
    );
  });
});
