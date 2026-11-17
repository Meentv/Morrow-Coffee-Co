import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { MenuCard } from "./MenuCard";
import { Reveal } from "@/components/ui/Reveal";
import { MENU_ITEMS } from "@/data/menu";

const item = MENU_ITEMS[0]!;

/**
 * Regression guard for the original hover-lift bug.
 *
 * The vanilla site put `.reveal` and `.menu-card:hover` on the same element.
 * Both are specificity (0,2,0), `.reveal` came later in the stylesheet, so
 * `transform: none` from the reveal won and the lift never happened.
 *
 * The structural fix is: reveal transform on an ancestor wrapper, hover lift on
 * the card. These assertions encode that structure so a future refactor cannot
 * quietly merge the two back onto one node.
 */
describe("MenuCard — reveal/hover transform separation", () => {
  it("keeps the reveal transform on a different element from the card", () => {
    render(
      <MemoryRouter>
        <Reveal>
          <MenuCard item={item} />
        </Reveal>
      </MemoryRouter>,
    );

    const card = screen.getByRole("article");
    const wrapper = card.parentElement;

    expect(wrapper).not.toBe(card);

    // The wrapper owns opacity/translate for the scroll reveal...
    expect(wrapper?.className).toContain("transition-[opacity,translate]");
    // ...and the card itself carries no reveal transition class.
    expect(card.className).not.toContain("transition-[opacity,translate]");
    expect(card.className).not.toMatch(/\breveal\b/);
  });

  it("never applies a CSS transform class to the card alongside the hover lift", () => {
    render(
      <MemoryRouter>
        <MenuCard item={item} />
      </MemoryRouter>,
    );

    const card = screen.getByRole("article");
    // The lift is delivered by Motion's whileHover (a style), not a competing
    // Tailwind translate/hover:translate utility.
    expect(card.className).not.toMatch(/hover:translate-y/);
    expect(card.className).not.toMatch(/\btranslate-y-/);
  });

  it("renders an accessible add-to-basket control with the price in its name", () => {
    render(
      <MemoryRouter>
        <MenuCard item={item} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("button", { name: `Add ${item.name} to basket, $5.50` }),
    ).toBeInTheDocument();
  });

  it("gives the image meaningful alt text and explicit dimensions", () => {
    render(
      <MemoryRouter>
        <MenuCard item={item} />
      </MemoryRouter>,
    );

    const image = screen.getByRole("img", { name: item.alt });
    expect(image).toHaveAttribute("width", String(item.width));
    expect(image).toHaveAttribute("height", String(item.height));
    expect(image).toHaveAttribute("loading", "lazy");
  });
});
