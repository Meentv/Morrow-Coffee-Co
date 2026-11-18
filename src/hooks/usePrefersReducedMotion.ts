import { useCallback, useState, useSyncExternalStore } from "react";

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Reads `prefers-reduced-motion` as an external store.
 *
 * The obvious implementation is `useState(false)` + a `useEffect` that calls
 * `setState(mq.matches)` on mount — but that schedules an extra render after
 * paint, which is exactly the cascading-render pattern React 19's compiler
 * rules reject, and it means the first frame can briefly show motion to someone
 * who asked for none. `useSyncExternalStore` reads the value during render, so
 * there is neither a flash nor a second pass.
 */
function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(MOTION_QUERY).matches;
}

/** No media query exists on the server, so assume motion is welcome there. */
function getServerSnapshot(): boolean {
  return false;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * A visitor-controlled motion switch that *defaults to their OS preference*.
 *
 * `override` is `null` until the visitor presses the button — that's the whole
 * trick. While it's null we derive the value from the OS preference, so a change
 * in that preference is picked up with no state to keep in sync. Once they've
 * made an explicit choice, we keep it instead of yanking the control out from
 * under them.
 */
export function useMotionSwitch(): {
  paused: boolean;
  toggle: () => void;
  systemPrefersReduced: boolean;
} {
  const systemPrefersReduced = usePrefersReducedMotion();
  const [override, setOverride] = useState<boolean | null>(null);

  const paused = override ?? systemPrefersReduced;
  const toggle = useCallback(() => setOverride(!paused), [paused]);

  return { paused, toggle, systemPrefersReduced };
}
