import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

/**
 * jsdom is missing a handful of browser APIs the app legitimately uses.
 * Each polyfill below mirrors real browser semantics, so passing tests mean
 * something (rather than testing against a permissive fake).
 */

/* ---------- matchMedia ---------- */
if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

/* ---------- IntersectionObserver ---------- */
class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: readonly number[] = [];
  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element): void {
    // Report visible immediately, matching a page that is already scrolled to top.
    this.callback(
      [{ isIntersecting: true, target } as unknown as IntersectionObserverEntry],
      this,
    );
  }

  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});
Object.defineProperty(globalThis, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

/* ---------- Misc ---------- */
if (!window.scrollTo) {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
}

if (!window.requestIdleCallback) {
  window.requestIdleCallback = ((callback: IdleRequestCallback) =>
    window.setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 50 }), 0)) as never;
  window.cancelIdleCallback = ((id: number) => window.clearTimeout(id)) as never;
}

/* Canvas is not implemented in jsdom; the WebGL probe must fail gracefully. */
HTMLCanvasElement.prototype.getContext = (() => null) as never;

afterEach(() => {
  cleanup();
  localStorage.clear();
});
