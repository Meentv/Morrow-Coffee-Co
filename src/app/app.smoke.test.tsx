import { describe, expect, it, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";

import { renderAt } from "@/test/renderWithRouter";
import { resetCartStore } from "@/features/cart/store/cart.store";
import { useToastStore } from "@/components/feedback/toast.store";

/**
 * Whole-app smoke test.
 *
 * Mounts the *real* route table (`routes` from app/router.tsx) at each path, so
 * this exercises the actual shell, page, store and Suspense wiring, including
 * every lazily-loaded page.
 *
 * This is the "does the built app render" proof that does not need a browser.
 */
beforeEach(() => {
  resetCartStore();
  useToastStore.getState().clear();
});

describe("every route mounts and renders its content", () => {
  it("/ — home", async () => {
    renderAt("/");
    expect(await screen.findByRole("heading", { level: 1, name: /Good mornings/i })).toBeVisible();
    expect(screen.getByRole("heading", { name: /Made for/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /keeps coming back/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
  });

  it("/menu — menu", async () => {
    renderAt("/menu");
    expect(await screen.findByRole("heading", { level: 1, name: /Take your/i })).toBeVisible();
    expect(screen.getByRole("searchbox", { name: "Search the menu" })).toBeInTheDocument();
    expect(screen.getAllByRole("article").length).toBe(12);
  });

  it("/shop — bean shop", async () => {
    renderAt("/shop");
    expect(await screen.findByRole("heading", { level: 1, name: /Beans worth/i })).toBeVisible();
    // Six coffees, each rendered as an article with its own add button.
    expect(screen.getAllByRole("article").length).toBe(6);
    expect(screen.getAllByRole("button", { name: /Add .* to basket/i }).length).toBe(6);
  });

  it("/kitchen — kitchen", async () => {
    renderAt("/kitchen");
    expect(await screen.findByRole("heading", { level: 1, name: /Order a chef/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /Send kitchen request/i })).toBeInTheDocument();
  });

  it("/order — order", async () => {
    renderAt("/order");
    expect(await screen.findByRole("heading", { level: 1, name: /Let us make/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /Place request/i })).toBeInTheDocument();
  });

  it("/contact — contact", async () => {
    renderAt("/contact");
    expect(await screen.findByRole("heading", { level: 1, name: /There’s always/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /Send enquiry/i })).toBeInTheDocument();
  });

  it("/nope — 404 for unknown paths", async () => {
    renderAt("/nope");
    expect(await screen.findByRole("heading", { level: 1, name: /on the menu/i })).toBeVisible();
  });
});

describe("document structure on every page", () => {
  const paths = ["/", "/menu", "/shop", "/kitchen", "/order", "/contact"];

  for (const path of paths) {
    it(`${path} has one h1, one main, a banner and a contentinfo`, async () => {
      renderAt(path);

      await waitFor(() => expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1));
      expect(screen.getAllByRole("main")).toHaveLength(1);
      expect(screen.getByRole("banner")).toBeInTheDocument();
      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
      expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    });
  }
});

describe("metadata", () => {
  it("sets a page-specific document title", async () => {
    renderAt("/menu");
    await waitFor(() => expect(document.title).toBe("Menu — Morrow Coffee Co."));
  });

  it("writes a page-specific meta description", async () => {
    renderAt("/contact");
    await waitFor(() => {
      const meta = document.querySelector('meta[name="description"][data-seo]');
      expect(meta?.getAttribute("content")).toMatch(/Contact Morrow Coffee Co/i);
    });
  });

  it("marks the 404 page noindex", async () => {
    renderAt("/nope");
    await waitFor(() => {
      const robots = document.querySelector('meta[name="robots"][data-seo]');
      expect(robots?.getAttribute("content")).toContain("noindex");
    });
  });

  it("omits a canonical URL while VITE_SITE_URL is unset", async () => {
    renderAt("/menu");
    await waitFor(() => expect(document.title).toMatch(/Menu/));
    // The brief forbids inventing a domain; no canonical should be emitted.
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  });
});
