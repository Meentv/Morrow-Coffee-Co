import { useEffect, useRef, useState } from "react";

/**
 * Pointer parallax in normalised space (-1 … 1), throttled to one update per
 * animation frame.
 *
 * Attach `ref` to the hover region. Updates are ignored entirely when the user
 * prefers reduced motion, and mouse-only (no touch scroll hijacking).
 */
export function usePointerParallax<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const frame = useRef<number | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      typeof window !== "undefined" &&
      Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

    const node = ref.current;
    if (!node) return;

    const onMove = (event: PointerEvent) => {
      if (reduced.current) return;
      if (event.pointerType === "touch") return;
      if (frame.current !== null) return;

      frame.current = window.requestAnimationFrame(() => {
        frame.current = null;
        const rect = node.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
        setPointer({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, -y)) });
      });
    };

    const onLeave = () => {
      if (frame.current !== null) {
        window.cancelAnimationFrame(frame.current);
        frame.current = null;
      }
      setPointer({ x: 0, y: 0 });
    };

    node.addEventListener("pointermove", onMove, { passive: true });
    node.addEventListener("pointerleave", onLeave, { passive: true });

    return () => {
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, []);

  return { ref, pointer };
}
