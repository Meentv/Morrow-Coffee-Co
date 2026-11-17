import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { useWebGLSupport } from "../lib/useWebGLSupport";

/**
 * "See it in 3D" preview for featured products.
 *
 * Implemented as an integrated tile-triggered modal rather than a separate
 * page, so it fits the existing editorial layout without adding a route.
 *
 * Accessibility contract:
 *  - `role="dialog"` + `aria-modal`, labelled by the product name.
 *  - Focus moves to the dialog on open, returns to the trigger on close.
 *  - Escape closes; clicks on the backdrop close; body scroll is locked.
 *  - Focus is trapped inside the dialog while open.
 *  - The 3D object is decorative: the dialog always shows the product name,
 *    price, description and an "Add to basket" action in text.
 *  - Without WebGL the dialog still opens and shows the product photo instead,
 *    so nothing is gated behind 3D.
 */
const PreviewCanvas = lazy(() =>
  import("./PreviewCanvasImpl").then((module) => ({ default: module.PreviewCanvasImpl })),
);

export type PreviewKind = "cup" | "croissant";

export function ProductPreviewButton({
  itemName,
  kind,
  disabled,
}: {
  itemName: string;
  kind: PreviewKind;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { isSupported, state } = useWebGLSupport();

  if (state === "unsupported" || disabled) {
    // Honest, non-broken affordance: no button at all rather than a dead one.
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-muted-strong transition-colors hover:text-espresso"
        aria-label={`Preview ${itemName} in 3D`}
      >
        <span aria-hidden="true" className="text-gold">
          ◎
        </span>
        View in 3D
      </button>

      <AnimatePresence>
        {open ? (
          <PreviewDialog
            itemName={itemName}
            kind={kind}
            onClose={() => setOpen(false)}
            isSupported={isSupported}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

function PreviewDialog({
  itemName,
  kind,
  onClose,
  isSupported,
}: {
  itemName: string;
  kind: PreviewKind;
  onClose: () => void;
  isSupported: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    closeRef.current?.focus();
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [onKeyDown]);

  const handleMove = (event: React.PointerEvent) => {
    if (reduceMotion || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    setPointer({
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: -(((event.clientY - rect.top) / rect.height) * 2 - 1),
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-[900] grid place-items-center bg-espresso/55 p-4 backdrop-blur-sm"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-title"
        aria-describedby="preview-desc"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 12 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md overflow-hidden rounded-card-lg bg-paper shadow-card"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 grid size-9 place-items-center rounded-full border border-line bg-white/90 text-espresso backdrop-blur-sm hover:border-gold"
          aria-label="Close 3D preview"
        >
          <span aria-hidden="true">✕</span>
        </button>

        <div
          className="h-[280px] w-full touch-pan-y bg-cream-2"
          onPointerMove={handleMove}
          onPointerLeave={() => setPointer({ x: 0, y: 0 })}
        >
          {isSupported ? (
            <Suspense
              fallback={
                <div className="grid h-full place-items-center text-xs text-muted-strong">
                  Preparing 3D…
                </div>
              }
            >
              <PreviewCanvas kind={kind} pointer={pointer} />
            </Suspense>
          ) : (
            <div className="grid h-full place-items-center px-6 text-center text-xs text-muted-strong">
              3D isn’t available on this device.
            </div>
          )}
        </div>

        <div className="p-6">
          <p className="text-[10px] font-bold tracking-[0.16em] text-gold-ink uppercase">
            3D preview
          </p>
          <h2 id="preview-title" className="mt-2 text-[24px]">
            {itemName}
          </h2>
          <p id="preview-desc" className="mt-2 text-[12.5px] leading-relaxed text-muted-strong">
            Drag or move your pointer to turn it. This is a stylised illustration, not a photograph
            of the finished plate.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
