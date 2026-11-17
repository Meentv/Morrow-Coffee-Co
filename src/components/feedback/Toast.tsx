import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { useToastStore } from "./toast.store";
import type { Toast, ToastVariant } from "./toast.store";
import { cn } from "@/lib/utils";

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "bg-espresso text-cream",
  error: "bg-danger text-white",
  info: "bg-espresso-2 text-cream",
};

const VARIANT_ICON: Record<ToastVariant, string> = {
  success: "✓",
  error: "!",
  info: "✦",
};

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((state) => state.dismiss);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (toast.duration <= 0) return;
    const timer = window.setTimeout(() => dismiss(toast.id), toast.duration);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.duration, dismiss]);

  return (
    <motion.li
      layout={!reduceMotion}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "pointer-events-auto flex max-w-[min(92vw,26rem)] items-start gap-3 rounded-full py-3 pr-4 pl-4 text-left shadow-card",
        VARIANT_STYLES[toast.variant],
      )}
    >
      <span
        aria-hidden="true"
        className="mt-px grid size-[18px] shrink-0 place-items-center rounded-full bg-white/18 text-[11px] leading-none font-bold"
      >
        {VARIANT_ICON[toast.variant]}
      </span>
      <p className="text-[13.5px] leading-snug font-semibold tracking-[-0.01em]">{toast.message}</p>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        className="-mr-1 ml-auto grid size-6 shrink-0 place-items-center rounded-full text-current/70 transition hover:bg-white/15 hover:text-current"
        aria-label="Dismiss notification"
      >
        <span aria-hidden="true" className="text-[15px] leading-none">
          ×
        </span>
      </button>
    </motion.li>
  );
}

/**
 * Single, polite live region for the whole app. `aria-live="polite"` means a
 * screen reader announces new toasts without interrupting what the user is
 * typing. Errors still land here rather than in a second assertive region,
 * matching the original site's single-toast behaviour without the noise.
 */
export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-5 z-[999] flex flex-col items-center gap-2 px-4 sm:bottom-7"
      aria-live="polite"
      aria-atomic="false"
      role="status"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
