import { useMemo } from "react";

import { useCartStore, selectLines, selectItemCount, computeTotals } from "../store/cart.store";
import type { CartLine, CartTotals } from "@/features/menu/types";

type CartApi = {
  lines: CartLine[];
  totals: CartTotals;
  addItem: ReturnType<typeof useCartStore.getState>["addItem"];
  removeItem: ReturnType<typeof useCartStore.getState>["removeItem"];
  increment: ReturnType<typeof useCartStore.getState>["increment"];
  decrement: ReturnType<typeof useCartStore.getState>["decrement"];
  clear: ReturnType<typeof useCartStore.getState>["clear"];
};

/**
 * One hook for components that need the basket.
 *
 * IMPORTANT: subscribe to `lines` (a stable array reference) and derive totals
 * with `useMemo` — do *not* return a freshly-built totals object from the
 * selector. A selector that allocates on every call makes the store's
 * equality check fail forever, which is an infinite render loop (this actually
 * happened during development; the integration tests caught it).
 */
export function useCart(): CartApi {
  const lines = useCartStore(selectLines);

  // Action references are stable for the lifetime of the store.
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const clear = useCartStore((state) => state.clear);

  const totals = useMemo(() => computeTotals(lines), [lines]);

  return { lines, totals, addItem, removeItem, increment, decrement, clear };
}

/** Just the badge number, so the header re-renders in isolation from the cart body. */
export function useCartCount(): number {
  return useCartStore(selectItemCount);
}
