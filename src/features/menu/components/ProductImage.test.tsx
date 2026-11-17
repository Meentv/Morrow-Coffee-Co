import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { webpVariant } from "@/lib/image";

import { ProductImage } from "./ProductImage";

describe("webpVariant", () => {
  it("swaps a .jpg extension for .webp", () => {
    expect(webpVariant("/images/latte.jpg")).toBe("/images/latte.webp");
  });

  it("returns undefined for formats that have no WebP sibling", () => {
    expect(webpVariant("/images/og-image.png")).toBeUndefined();
    expect(webpVariant("/images/photo.webp")).toBeUndefined();
  });

  it("only rewrites the trailing extension, not a dot in the filename", () => {
    expect(webpVariant("/images/v2.1.latte.jpg")).toBe("/images/v2.1.latte.webp");
  });
});

describe("ProductImage", () => {
  it("offers a WebP source but keeps the JPEG as the img src / fallback", () => {
    const { container } = render(
      <ProductImage src="/images/latte.jpg" alt="Honey oat latte" width={768} height={576} />,
    );
    const source = container.querySelector("source");
    expect(source).not.toBeNull();
    expect(source?.getAttribute("srcset")).toBe("/images/latte.webp");
    expect(source?.getAttribute("type")).toBe("image/webp");

    const img = screen.getByRole("img", { name: "Honey oat latte" });
    expect(img.getAttribute("src")).toBe("/images/latte.jpg");
  });

  it("reserves the layout box with explicit width and height", () => {
    render(<ProductImage src="/images/latte.jpg" alt="Latte" width={768} height={576} />);
    const img = screen.getByRole("img", { name: "Latte" });
    expect(img).toHaveAttribute("width", "768");
    expect(img).toHaveAttribute("height", "576");
  });

  it("lazy-loads by default and becomes eager + high priority only when asked", () => {
    const { unmount } = render(
      <ProductImage src="/images/a.jpg" alt="Lazy photo" width={800} height={600} />,
    );
    expect(screen.getByRole("img", { name: "Lazy photo" })).toHaveAttribute("loading", "lazy");
    unmount();

    render(<ProductImage src="/images/b.jpg" alt="Hero photo" width={800} height={600} priority />);
    const hero = screen.getByRole("img", { name: "Hero photo" });
    expect(hero).toHaveAttribute("loading", "eager");
    expect(hero).toHaveAttribute("fetchpriority", "high");
  });

  it("transitions transform as well as opacity, so hover zooms ease instead of snapping", () => {
    // Regression: the img used to carry only `transition-opacity`, which silently
    // killed every `group-hover:scale-*` zoom on the menu cards and kitchen gallery.
    render(<ProductImage src="/images/latte.jpg" alt="Latte" width={768} height={576} />);
    const cls = screen.getByRole("img", { name: "Latte" }).className;
    expect(cls).toContain("transition-[opacity,transform]");
  });

  it("withholds the caller's hover-zoom class until the photo has loaded", () => {
    render(
      <ProductImage
        src="/images/latte.jpg"
        alt="Latte"
        width={768}
        height={576}
        imgClassName="group-hover:scale-[1.06]"
      />,
    );
    const img = screen.getByRole("img", { name: "Latte" });
    expect(img.className).not.toContain("group-hover:scale-[1.06]");

    act(() => {
      img.dispatchEvent(new Event("load"));
    });
    expect(img.className).toContain("group-hover:scale-[1.06]");
  });

  it("omits the WebP <source> for non-JPEG sources", () => {
    const { container } = render(
      <ProductImage src="/images/og-image.png" alt="Share card" width={1200} height={630} />,
    );
    expect(container.querySelector("source")).toBeNull();
  });

  it("shows the branded placeholder only after the image actually fails", () => {
    render(<ProductImage src="/images/missing.jpg" alt="Missing photo" width={800} height={600} />);
    const img = screen.getByRole("img", { name: "Missing photo" });
    expect(screen.queryByText(/photo coming soon/i)).toBeNull();

    act(() => {
      img.dispatchEvent(new Event("error"));
    });
    expect(screen.getByText(/photo coming soon/i)).toBeInTheDocument();
  });
});
