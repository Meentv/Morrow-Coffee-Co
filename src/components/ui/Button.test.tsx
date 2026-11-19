import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { Button } from "./Button";

/**
 * Pins the failure the hero shipped with: a `primary` button given
 * `className="bg-cream text-espresso"` emitted BOTH colour sets, and because
 * `cn` concatenates rather than resolving Tailwind conflicts, stylesheet order
 * decided the winner. The result was espresso text on an espresso fill — a
 * button with an unreadable, effectively invisible label.
 *
 * The fix is the `onDark` variant, so the assertion below is that variant
 * classes never contain a self-cancelling pair.
 */

function renderInRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("button", () => {
  it("never emits a conflicting background/text pair by default", () => {
    renderInRouter(<Button variant="primary">Shop</Button>);
    const button = screen.getByRole("button", { name: "Shop" });

    // Exactly one bg-* utility on the element itself.
    const backgrounds = (button.className.match(/(?:^|\s)bg-[^\s]+/g) ?? []).filter(
      (c) => !c.includes("hover:") && !c.includes("active:"),
    );
    expect(backgrounds).toHaveLength(1);
  });

  it("has a dedicated variant for dark grounds instead of a className override", () => {
    renderInRouter(
      <Button to="/menu" variant="onDark" size="lg">
        Explore our menu
      </Button>,
    );
    const button = screen.getByRole("link", { name: "Explore our menu" });

    // Cream fill with espresso text: readable by construction, not by cascade.
    expect(button.className).toMatch(/\bbg-cream\b/);
    expect(button.className).toMatch(/\btext-espresso\b/);
    // And it must not also carry the espresso fill it replaced.
    expect(button.className).not.toMatch(/\bbg-espresso\b/);
  });

  it("renders an anchor for router links and a button otherwise", () => {
    const { unmount } = renderInRouter(<Button to="/menu">Menu</Button>);
    expect(screen.getByRole("link", { name: "Menu" })).toHaveAttribute("href", "/menu");
    unmount();

    renderInRouter(<Button type="submit">Send</Button>);
    expect(screen.getByRole("button", { name: "Send" })).toHaveAttribute("type", "submit");
  });

  it("marks decorative glyphs as hidden from assistive tech", () => {
    renderInRouter(<Button trailing="→">Continue</Button>);
    const button = screen.getByRole("button", { name: "Continue" });
    // The arrow must not be part of the accessible name.
    expect(button.textContent).toBe("Continue→");
    expect(button.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it("exposes the disabled state to pointer and keyboard alike", () => {
    renderInRouter(<Button disabled>Send</Button>);
    const button = screen.getByRole("button", { name: "Send" });
    expect(button).toBeDisabled();
    expect(button.className).toMatch(/disabled:/);
  });
});
