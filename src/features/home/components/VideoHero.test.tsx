import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { VideoHero } from "./VideoHero";

/**
 * The hero video has three failure modes that a screenshot can't catch:
 * a phone downloading the 1920 file, motion starting for someone who asked for
 * reduced motion, and a `<video>` that silently fails leaving a black box.
 * All three are pinned below.
 */

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

function renderHero() {
  return render(
    <MemoryRouter>
      <VideoHero />
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("video hero", () => {
  it("autoplays muted, looped and inline — the only combination browsers allow", () => {
    setReducedMotion(false);
    const { container } = renderHero();

    const video = container.querySelector("video");
    expect(video).not.toBeNull();
    expect(video).toHaveAttribute("autoplay");
    expect(video).toHaveAttribute("loop");
    expect(video).toHaveAttribute("playsinline");
    // `muted` is a property, not reliably an attribute in jsdom.
    expect(video?.muted).toBe(true);
    // Audio in a decorative background video would be hostile; the source file
    // has its audio track stripped, and nothing here unmutes it.
    expect(video?.hasAttribute("controls")).toBe(false);
  });

  it("serves a resolution ladder so phones never fetch the 1920 file", () => {
    setReducedMotion(false);
    const { container } = renderHero();

    const sources = Array.from(container.querySelectorAll("video source"));
    expect(sources).toHaveLength(2);

    // Every source except the fallback must be gated by a media query, or a
    // phone would fetch the large file as well as its own.
    const finalSource = sources[sources.length - 1];
    for (const source of sources.slice(0, -1)) {
      expect(source.getAttribute("media")).toBeTruthy();
    }
    expect(finalSource?.getAttribute("src")).toBe("/media/hero-736.mp4");
    expect(finalSource?.hasAttribute("media")).toBe(false);

    // Phones get the small rung. The source is only 736px wide, so there is no
    // larger rung to fall back to — upscaling would add bytes and no detail.
    const phone = sources.find((s) => s.getAttribute("media") === "(max-width: 700px)");
    expect(phone?.getAttribute("src")).toBe("/media/hero-480.mp4");

    // Nothing is preloaded eagerly: the poster is the first paint.
    expect(container.querySelector("video")?.getAttribute("preload")).toBe("metadata");
  });

  it("never starts the download for a reduced-motion visitor", () => {
    setReducedMotion(true);
    const { container } = renderHero();

    // No <video> at all — a still image instead. Showing the poster but leaving
    // the element autoplaying would still download every byte.
    expect(container.querySelector("video")).toBeNull();

    const poster = container.querySelector("img");
    expect(poster).not.toBeNull();
    expect(poster?.getAttribute("src")).toBe("/media/hero-poster-736.jpg");
    expect(poster?.getAttribute("fetchpriority")).toBe("high");
  });

  it("keeps the headline and both calls to action in every motion mode", () => {
    for (const reduce of [false, true]) {
      setReducedMotion(reduce);
      const { unmount } = renderHero();

      expect(screen.getByRole("heading", { level: 1, name: /A better kind/i })).toBeVisible();
      expect(screen.getByRole("link", { name: /explore our menu/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /discover morrow/i })).toBeInTheDocument();

      unmount();
    }
  });

  it("skips the video entirely when the browser asks to save data", () => {
    setReducedMotion(false);
    vi.stubGlobal("navigator", {
      ...navigator,
      connection: { saveData: true, effectiveType: "4g" },
    });

    const { container } = renderHero();

    // An explicit "don't spend my data" must win over the cinematic default.
    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("img")).not.toBeNull();
  });

  it("skips the video on a 2g connection", () => {
    setReducedMotion(false);
    vi.stubGlobal("navigator", {
      ...navigator,
      connection: { saveData: false, effectiveType: "2g" },
    });

    const { container } = renderHero();
    expect(container.querySelector("video")).toBeNull();
  });

  it("plays the video on a normal connection", () => {
    setReducedMotion(false);
    vi.stubGlobal("navigator", {
      ...navigator,
      connection: { saveData: false, effectiveType: "4g" },
    });

    const { container } = renderHero();
    expect(container.querySelector("video")).not.toBeNull();
  });

  it("marks the video decorative and unfocusable", () => {
    setReducedMotion(false);
    const { container } = renderHero();

    const video = container.querySelector("video");
    // A background video is not content; it must not be a tab stop or announced.
    expect(video).toHaveAttribute("aria-hidden", "true");
    expect(video?.getAttribute("tabindex")).toBe("-1");
  });

  it("survives a refused autoplay without crashing the hero", async () => {
    setReducedMotion(false);
    // Model the real refusal: play() rejects (iOS low-power mode does this).
    const play = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockRejectedValue(new DOMException("NotAllowedError"));

    renderHero();

    // The rejection is handled, so the thrown error never reaches the test.
    await Promise.resolve();
    expect(play).toHaveBeenCalled();
    expect(screen.getByRole("heading", { level: 1, name: /A better kind/i })).toBeVisible();
  });
});
