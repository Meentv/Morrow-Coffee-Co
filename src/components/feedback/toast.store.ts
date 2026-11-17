import { create } from "zustand";

import { TOAST_DURATION_MS } from "@/lib/constants";
import { createReference } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info";

export type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
  /** ms; 0 = sticky until dismissed. */
  duration: number;
};

type ToastState = {
  toasts: Toast[];
  push: (message: string, variant?: ToastVariant, duration?: number) => string;
  dismiss: (id: string) => void;
  clear: () => void;
};

/**
 * Toast store. Kept outside React so services and stores can raise a toast
 * without a hook. The viewport (ToastViewport) is the single aria-live region,
 * so there is no risk of duplicate announcements.
 */
export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],

  push: (message, variant = "info", duration = TOAST_DURATION_MS) => {
    const id = createReference("toast");
    set((state) => {
      // Avoid stacked duplicates of the exact same message (e.g. double-click add).
      const duplicate = state.toasts.find(
        (toast) => toast.message === message && toast.variant === variant,
      );
      const withoutDuplicate = duplicate
        ? state.toasts.filter((toast) => toast.id !== duplicate.id)
        : state.toasts;

      // Cap the stack so a burst of errors can't cover the page.
      const trimmed = withoutDuplicate.slice(-2);
      return { toasts: [...trimmed, { id, message, variant, duration }] };
    });
    return id;
  },

  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),

  clear: () => set({ toasts: [] }),
}));

/** Imperative helpers for use in stores/services/callbacks. */
export const toast = {
  success: (message: string, duration?: number) =>
    useToastStore.getState().push(message, "success", duration),
  error: (message: string, duration?: number) =>
    useToastStore.getState().push(message, "error", duration),
  info: (message: string, duration?: number) =>
    useToastStore.getState().push(message, "info", duration),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
  clear: () => useToastStore.getState().clear(),
};
