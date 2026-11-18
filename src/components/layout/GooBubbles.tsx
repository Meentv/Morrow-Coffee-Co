import { useMemo } from "react";

/**
 * Gooey bubbles that rise from the footer edge and merge into it.
 *
 * Adapted from Zed Dash's "CSS Gooey footer" (MIT, 2019), supplied as the
 * Sodaworks reference. The trick is one SVG filter rather than any per-bubble
 * JavaScript: blur every circle, then run the alpha channel through a steep
 * colour matrix so the soft blurred edges snap back into a single hard
 * silhouette. Where two bubbles are close, their blurred edges touch before the
 * matrix applies, so they merge — a `border-radius: 50%` can't do that.
 *
 * Deliberate choices, all of which differ from the reference:
 *
 * - **24 bubbles as DOM nodes, zero animation JS.** Each bubble is a pure CSS
 *   animation on `width`/`bottom`. There is no rAF loop, no scroll listener and
 *   no React state involved in the motion, so this costs nothing on the main
 *   thread once mounted. Only two animated properties, both compositor-friendly
 *   enough at this size.
 * - **Seeded distribution, computed once.** The positions are pseudo-random but
 *   deterministic (`useMemo`, no dependency on mount time), so the footer looks
 *   organically scattered while staying identical between reloads and matches
 *   between server and client if this is ever prerendered.
 * - **Two hard stops on motion.** Every bubble pauses under
 *   `prefers-reduced-motion` via CSS, *and* the footer's own Pause control can
 *   pause the group. WCAG 2.2.2 wants a mechanism for anything that moves for
 *   more than five seconds — this loops forever, so a control is not optional.
 * - **Purely decorative.** `aria-hidden`, `pointer-events: none`. If the filter
 *   is unsupported the bubbles still render as plain circles, which is a fine
 *   degradation; if JS never runs, the footer is still complete.
 */

const BUBBLE_COUNT = 24;

/** Deterministic 0..1 PRNG — Lehmer / Park–Miller. Stable across reloads. */
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

type Bubble = {
  size: string;
  distance: string;
  position: string;
  time: string;
  delay: string;
};

function buildBubbles(count: number, seed: number): Bubble[] {
  const rand = createRandom(seed);
  return Array.from({ length: count }, (_, index) => {
    // Even spacing plus jitter, so no stretch of the edge stays flat. Without
    // the jitter you can see the rhythm; with pure random you get bald patches.
    const position = ((index + 0.5) / count) * 100 + (rand() - 0.5) * 4;

    return {
      size: `${(2 + rand() * 4).toFixed(2)}rem`,
      distance: `${(6 + rand() * 4).toFixed(2)}rem`,
      position: `${position.toFixed(2)}%`,
      time: `${(2 + rand() * 2).toFixed(2)}s`,
      // Negative delays start each bubble mid-flight, so the edge is already
      // alive on first paint instead of waiting for a full cycle.
      delay: `${(-1 * (2 + rand() * 2)).toFixed(2)}s`,
    };
  });
}

/**
 * The goo filter, rendered once at the footer root.
 *
 * `color-interpolation-filters` defaults to linearRGB, which washes the merged
 * edge out grey over a warm ground; sRGB keeps the espresso silhouette solid.
 * It must live outside the element it filters — an SVG filter defined inside
 * its own target is not reliably applied.
 */
export function GooFilter() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        <filter id="morrow-blob" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
            result="blob"
          />
        </filter>
      </defs>
    </svg>
  );
}

export function GooBubbles({ paused = false }: { paused?: boolean }) {
  const bubbles = useMemo(() => buildBubbles(BUBBLE_COUNT, 7), []);

  return (
    <div className="goo-bubbles" aria-hidden="true">
      {bubbles.map((bubble, index) => (
        <span
          key={index}
          className="morrow-bubble"
          style={
            {
              "--bubble-size": bubble.size,
              "--bubble-distance": bubble.distance,
              "--bubble-position": bubble.position,
              "--bubble-time": bubble.time,
              "--bubble-delay": bubble.delay,
              left: bubble.position,
              width: bubble.size,
              height: bubble.size,
              borderRadius: "100%",
              position: "absolute",
              background: "var(--goo-color, var(--color-espresso-deep))",
              transform: "translate(-50%, 100%)",
              animation: `morrow-bubble-size ${bubble.time} ease-in infinite ${bubble.delay}, morrow-bubble-move ${bubble.time} ease-in infinite ${bubble.delay}`,
              animationPlayState: paused ? "paused" : undefined,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
