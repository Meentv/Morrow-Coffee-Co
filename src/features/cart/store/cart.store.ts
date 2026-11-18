import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { lineTotalCents } from "@/lib/currency";
import { CART_LIMITS, CART_STORAGE_KEY } from "@/lib/constants";
import type { CartLine, CartTotals, Purchasable } from "@/features/menu/types";

/**
 * Cart store.
 *
 * - Money is integer cents throughout (`priceCents`), never a float.
 * - Persisted to localStorage under the *same key the original site used*
 *   ("morrow-cart"), so an existing visitor's basket survives the migration.
 *   The original stored `{ name, price, qty }` floats; `migrate` upgrades those.
 * - Cross-tab sync is handled by a storage listener (see cartSync) because
 *   Zustand's persist middleware only *writes* to storage, it does not listen.
 */

export type CartState = {
  lines: CartLine[];
  /** Bumped on every mutation; used to keep tabs in deterministic order. */
  updatedAt: number;
  lastAddedId: string | null;
  addItem: (item: Purchasable, quantity?: number) => void;
  removeItem: (id: string) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  /** Replace the whole basket — used when another tab broadcasts a change. */
  replaceAll: (lines: CartLine[], updatedAt: number) => void;
};

/** Pure selector: totals for an arbitrary set of lines. Exported for unit tests. */
export function computeTotals(lines: readonly CartLine[]): CartTotals {
  const itemCount = lines.reduce((count, line) => count + line.quantity, 0);
  const subtotalCents = lines.reduce(
    (sum, line) => sum + lineTotalCents(line.priceCents, line.quantity),
    0,
  );
  // No tax/shipping rules exist in the original site, so total === subtotal.
  // Kept as a distinct field so a future delivery fee has an obvious home.
  return { itemCount, subtotalCents, totalCents: subtotalCents };
}

function sanitiseQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  const truncated = Math.trunc(quantity);
  if (truncated < 1) return 0; // signals "remove"
  return Math.min(truncated, CART_LIMITS.maxQuantityPerLine);
}

/** Defensive validation of whatever came out of localStorage. */
export function sanitiseLines(input: unknown): CartLine[] {
  if (!Array.isArray(input)) return [];

  const result: CartLine[] = [];
  const seen = new Set<string>();

  for (const raw of input) {
    if (result.length >= CART_LIMITS.maxLines) break;
    if (typeof raw !== "object" || raw === null) continue;

    const candidate = raw as Partial<CartLine> & { price?: number; qty?: number };

    // Legacy shape from the vanilla site: { name, price (float), qty }.
    const legacyPrice =
      typeof candidate.price === "number" ? Math.round(candidate.price * 100) : undefined;
    const legacyQty = typeof candidate.qty === "number" ? candidate.qty : undefined;

    const priceCents = Number.isSafeInteger(candidate.priceCents)
      ? (candidate.priceCents as number)
      : legacyPrice;

    const quantity = candidate.quantity ?? legacyQty;

    const id =
      typeof candidate.id === "string" && candidate.id
        ? candidate.id
        : typeof candidate.name === "string"
          ? candidate.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
          : undefined;

    const name = typeof candidate.name === "string" ? candidate.name : undefined;

    if (!id || !name || priceCents === undefined || priceCents < 0) continue;
    if (seen.has(id)) continue;

    const safeQty = sanitiseQuantity(Number(quantity));
    if (safeQty < 1) continue;

    seen.add(id);
    result.push({
      id,
      name,
      priceCents,
      quantity: safeQty,
      image: typeof candidate.image === "string" ? candidate.image : "",
    });
  }

  return result;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      updatedAt: 0,
      lastAddedId: null,

      addItem: (item, quantity = 1) =>
        set((state) => {
          const addQty = sanitiseQuantity(quantity) || 1;
          const existing = state.lines.find((line) => line.id === item.id);

          if (existing) {
            return {
              lines: state.lines.map((line) =>
                line.id === item.id
                  ? {
                      ...line,
                      quantity: Math.min(line.quantity + addQty, CART_LIMITS.maxQuantityPerLine),
                      // Refresh snapshot fields in case the menu changed.
                      name: item.name,
                      priceCents: item.priceCents,
                      image: item.image,
                    }
                  : line,
              ),
              updatedAt: Date.now(),
              lastAddedId: item.id,
            };
          }

          if (state.lines.length >= CART_LIMITS.maxLines) {
            return { updatedAt: Date.now() };
          }

          return {
            lines: [
              ...state.lines,
              {
                id: item.id,
                name: item.name,
                priceCents: item.priceCents,
                quantity: addQty,
                image: item.image,
              },
            ],
            updatedAt: Date.now(),
            lastAddedId: item.id,
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          lines: state.lines.filter((line) => line.id !== id),
          updatedAt: Date.now(),
        })),

      increment: (id) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            line.id === id
              ? {
                  ...line,
                  quantity: Math.min(line.quantity + 1, CART_LIMITS.maxQuantityPerLine),
                }
              : line,
          ),
          updatedAt: Date.now(),
        })),

      decrement: (id) =>
        set((state) => {
          const line = state.lines.find((l) => l.id === id);
          if (!line) return { updatedAt: Date.now() };
          // Decrementing past 1 removes the line — matches the original UI intent.
          if (line.quantity <= 1) {
            return {
              lines: state.lines.filter((l) => l.id !== id),
              updatedAt: Date.now(),
            };
          }
          return {
            lines: state.lines.map((l) => (l.id === id ? { ...l, quantity: l.quantity - 1 } : l)),
            updatedAt: Date.now(),
          };
        }),

      setQuantity: (id, quantity) =>
        set((state) => {
          const safe = sanitiseQuantity(quantity);
          if (safe < 1) {
            return {
              lines: state.lines.filter((line) => line.id !== id),
              updatedAt: Date.now(),
            };
          }
          return {
            lines: state.lines.map((line) => (line.id === id ? { ...line, quantity: safe } : line)),
            updatedAt: Date.now(),
          };
        }),

      clear: () => set({ lines: [], updatedAt: Date.now(), lastAddedId: null }),

      replaceAll: (lines, updatedAt) =>
        set((state) => {
          /**
           * Last-write-wins.
           *
           * `>=` rather than `>` on purpose: a `storage` event is only emitted
           * after the other tab's write has already been committed, so an equal
           * timestamp still represents a real remote change (this is what made
           * "other tab emptied the basket" silently no-op). Ties go to the
           * incoming write, and the local clock is bumped so the next local edit
           * is not mistaken for stale.
           */
          if (updatedAt < state.updatedAt) return state;
          return {
            lines: sanitiseLines(lines),
            updatedAt: Math.max(updatedAt, state.updatedAt + 1),
          };
        }),
    }),
    {
      name: CART_STORAGE_KEY,
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lines: state.lines,
        updatedAt: state.updatedAt,
      }),
      migrate: (persisted, version) => {
        const raw = persisted as { lines?: unknown } | undefined;
        if (version < 2) {
          // v1 was the vanilla site's bare array of { name, price, qty }.
          const legacy = Array.isArray(persisted) ? persisted : ((raw?.lines as unknown) ?? []);
          return { lines: sanitiseLines(legacy), updatedAt: Date.now() };
        }
        return {
          lines: sanitiseLines(raw?.lines),
          updatedAt: (persisted as { updatedAt?: number })?.updatedAt ?? Date.now(),
        };
      },
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<CartState>),
        lines: sanitiseLines((persisted as { lines?: unknown })?.lines),
      }),
    },
  ),
);

/* ---------- Precomputed selectors ---------- */

export const selectLines = (state: CartState): CartLine[] => state.lines;
/**
 * WARNING: allocates a new object on every call. Only safe to use with
 * `useMemo` in a component (see useCart), never as a direct store selector —
 * it would defeat the equality check and loop.
 */
export const selectTotals = (state: CartState): CartTotals => computeTotals(state.lines);
export const selectItemCount = (state: CartState): number => computeTotals(state.lines).itemCount;
export const selectIsEmpty = (state: CartState): boolean => state.lines.length === 0;
export const selectQuantityOf =
  (id: string) =>
  (state: CartState): number =>
    state.lines.find((line) => line.id === id)?.quantity ?? 0;

/** Reset helper for tests — restores the pristine, empty store. */
export function resetCartStore(): void {
  useCartStore.setState({ lines: [], updatedAt: 0, lastAddedId: null });
  getCartActions().clear();
}

function getCartActions(): CartState {
  return useCartStore.getState();
}
