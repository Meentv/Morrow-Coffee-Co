import { describe, expect, it, beforeEach } from "vitest";
import { act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";

import { useCartSync } from "./useCartSync";
import { resetCartStore, useCartStore } from "../store/cart.store";
import { CART_STORAGE_KEY } from "@/lib/constants";

beforeEach(() => {
  resetCartStore();
});

/** Simulate the `storage` event another tab would fire. */
function broadcast(payload: unknown) {
  act(() => {
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: CART_STORAGE_KEY,
        newValue: JSON.stringify(payload),
      }),
    );
  });
}

describe("cross-tab cart synchronisation", () => {
  it("adopts a newer basket broadcast from another tab", () => {
    renderHook(() => useCartSync());

    broadcast({
      state: {
        lines: [{ id: "latte", name: "Honey Oat Latte", priceCents: 550, quantity: 3, image: "" }],
        updatedAt: Date.now() + 5_000,
      },
    });

    expect(useCartStore.getState().lines).toHaveLength(1);
    expect(useCartStore.getState().lines[0]?.quantity).toBe(3);
  });

  it("ignores a stale broadcast so newer local state survives", () => {
    renderHook(() => useCartSync());

    act(() => {
      useCartStore.getState().addItem({
        id: "croissant",
        name: "Butter Croissant",
        category: "bakery",
        priceCents: 380,
        image: "",
        width: 800,
        height: 600,
        alt: "",
        description: "",
      });
    });

    broadcast({
      state: {
        lines: [{ id: "old", name: "Old", priceCents: 100, quantity: 1, image: "" }],
        updatedAt: 1,
      },
    });

    expect(useCartStore.getState().lines[0]?.id).toBe("croissant");
  });

  it("empties the basket when another tab clears storage", () => {
    renderHook(() => useCartSync());

    act(() => {
      useCartStore.getState().addItem({
        id: "latte",
        name: "Latte",
        category: "coffee",
        priceCents: 550,
        image: "",
        width: 800,
        height: 600,
        alt: "",
        description: "",
      });
    });

    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: CART_STORAGE_KEY, newValue: null }));
    });

    expect(useCartStore.getState().lines).toHaveLength(0);
  });

  it("ignores unrelated storage keys and corrupt payloads", () => {
    renderHook(() => useCartSync());

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: "something-else", newValue: '{"a":1}' }),
      );
      window.dispatchEvent(
        new StorageEvent("storage", { key: CART_STORAGE_KEY, newValue: "not json{{" }),
      );
    });

    expect(useCartStore.getState().lines).toEqual([]);
  });
});
