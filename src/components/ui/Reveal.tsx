import type { ElementType, ReactNode } from "react";

import { useInViewOnce } from "@/hooks/useInViewOnce";
import { cn } from "@/lib/utils";

/**
 * Scroll-reveal wrapper.
 *
 * ── BUG FIXED HERE ──────────────────────────────────────────────────────────
 * The original `main.js` called `initReveal()`, which added `.reveal` to every
 * `.menu-card`, and `.reveal.in { transform: none }` then *silently overrode*
 * `.menu-card:hover { transform: translateY(-5px) }`. Both selectors have equal
 * specificity (0,2,0) and `.reveal` is declared later in styles.css, so the
 * hover lift never worked on any card — and it also killed the image zoom's
 * containing-block context.
 *
 * The fix is structural, not a `!important`: the reveal transform now lives on
 * a *wrapper* element and the hover lift lives on the *card* inside it. Two
 * elements, two transforms, no cascade fight — so a card that is revealed on
 * scroll behaves identically to one rendered on first paint.
 * ────────────────────────────────────────────────────────────────────────────
 */
export function Reveal({
  children,
  className,
  delayMs = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  as?: ElementType;
}) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();

  return (
    <Tag
      ref={ref}
      className={cn(
        "transition-[opacity,translate] duration-700 ease-brand motion-reduce:transition-none",
        inView ? "translate-y-0 opacity-100" : "translate-y-[26px] opacity-0",
        className,
      )}
      style={
        delayMs && inView && !prefersReduced() ? { transitionDelay: `${delayMs}ms` } : undefined
      }
    >
      {children}
    </Tag>
  );
}

function prefersReduced(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
