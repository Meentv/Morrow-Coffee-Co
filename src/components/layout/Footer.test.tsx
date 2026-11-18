import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { Footer } from "./Footer";

/**
 * The gooey footer is the one component where a regression is invisible in a
 * screenshot — bubbles that stop animating, or a Pause button that doesn't
 * actually pause, look fine in a still. So the behaviour is pinned here.
 */

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );
}

/** Overrides matchMedia so the component sees a chosen reduced-motion setting. */
function setReducedMotion(reduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("prefers-reduced-motion") ? reduce : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("footer", () => {
  it("renders the oversized headline as a real heading", () => {
    setReducedMotion(false);
    renderFooter();

    expect(screen.getByRole("heading", { level: 2, name: /Stay for another cup/i })).toBeVisible();
  });

  it("gives every bubble a decorative role, never an accessible one", () => {
    setReducedMotion(false);
    const { container } = renderFooter();

    const goo = container.querySelector(".goo-bubbles");
    expect(goo).not.toBeNull();
    // 24 bubbles, all hidden from assistive tech — they carry no information.
    expect(goo?.querySelectorAll(".morrow-bubble")).toHaveLength(24);
    expect(goo?.getAttribute("aria-hidden")).toBe("true");
  });

  it("defines the goo filter once, outside the element it filters", () => {
    setReducedMotion(false);
    const { container } = renderFooter();

    const filter = container.querySelector("#morrow-blob");
    expect(filter).not.toBeNull();
    // The classic mistake: an SVG filter inside its own target is not reliably
    // applied, so assert it is NOT a descendant of .goo-bubbles.
    expect(container.querySelector(".goo-bubbles #morrow-blob")).toBeNull();
  });

  it("pauses the bubbles when the visitor presses Pause motion", async () => {
    setReducedMotion(false);
    const user = userEvent.setup();
    const { container } = renderFooter();

    const control = screen.getByRole("button", { name: /pause motion/i });
    expect(control).toHaveAttribute("aria-pressed", "false");
    expect(control).toHaveTextContent("Pause motion");

    // Animating to begin with.
    const bubble = container.querySelector<HTMLElement>(".morrow-bubble");
    expect(bubble?.style.animationPlayState).toBe("");

    await user.click(control);

    // Now paused: the label flips, aria-pressed flips, and every bubble is
    // actually paused rather than just looking paused.
    expect(control).toHaveAttribute("aria-pressed", "true");
    expect(control).toHaveTextContent("Play motion");
    const bubbles = container.querySelectorAll<HTMLElement>(".morrow-bubble");
    expect(bubbles.length).toBe(24);
    for (const node of bubbles) {
      expect(node.style.animationPlayState).toBe("paused");
    }

    await user.click(control);
    expect(control).toHaveAttribute("aria-pressed", "false");
    expect(container.querySelector<HTMLElement>(".morrow-bubble")?.style.animationPlayState).toBe(
      "",
    );
  });

  it("starts paused for visitors who prefer reduced motion", () => {
    setReducedMotion(true);
    const { container } = renderFooter();

    // The control must not claim motion is running when the OS asked it not to be.
    const control = screen.getByRole("button", { name: /play motion/i });
    expect(control).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector<HTMLElement>(".morrow-bubble")?.style.animationPlayState).toBe(
      "paused",
    );
  });

  it("keeps the newsletter honest about demo mode", () => {
    setReducedMotion(false);
    renderFooter();

    // No EmailJS keys are configured in the test environment, so the form must
    // say so rather than implying a list was joined.
    expect(screen.getByRole("textbox", { name: /email address/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /join the letter/i })).toBeInTheDocument();
    expect(screen.getByText(/demo — no mailing list connected/i)).toBeInTheDocument();
  });

  it("exposes every directory column as a landmark with a heading", () => {
    setReducedMotion(false);
    renderFooter();

    const nav = screen.getByRole("navigation", { name: "Footer" });
    const headings = Array.from(nav.querySelectorAll("h3")).map((h) => h.textContent);
    expect(headings).toEqual(["Visit Morrow", "Explore the menu", "Our kitchen", "Say hello"]);
  });

  it("year is computed, never hardcoded", () => {
    setReducedMotion(false);
    renderFooter();
    expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument();
  });
});
