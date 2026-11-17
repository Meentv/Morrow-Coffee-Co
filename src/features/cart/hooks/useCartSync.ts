import { useEffect } from "react";

import { CART_STORAGE_KEY } from "@/lib/constants";
import { sanitiseLines, useCartStore } from "../store/cart.store";

/**
 * Cross-tab cart synchronisation.
 *
 * Zustand's persist middleware writes to localStorage but never listens. The
 * `storage` event fires in *other* tabs when that key changes, which is exactly
 * the signal we want. We re-read the payload and reconcile with a last-write-
 * wins rule driven by `updatedAt` so two rapid clicks in different tabs can't
 * resurrect a removed line.
 */
export function useCartSync(): void {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onStorage = (event: StorageEvent) => {
      if (event.key !== CART_STORAGE_KEY) return;

      // Clearing storage elsewhere (or another tab wiping the key) empties the cart.
      if (event.newValue === null) {
        useCartStore.getState().replaceAll([], Date.now());
        return;
      }

      try {
        const parsed = JSON.parse(event.newValue) as {
          state?: { lines?: unknown; updatedAt?: number };
          lines?: unknown;
          updatedAt?: number;
        };

        const payload = parsed.state ?? parsed;
        const lines = sanitiseLines(payload.lines);
        const updatedAt = typeof payload.updatedAt === "number" ? payload.updatedAt : Date.now();

        useCartStore.getState().replaceAll(lines, updatedAt);
      } catch {
        // Corrupt payload from another tab — ignore rather than clobber good state.
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
}
