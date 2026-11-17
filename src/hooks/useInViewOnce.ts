import { useEffect, useRef, useState } from "react";

/**
 * Fires once when the element first scrolls into view.
 *
 * Degrades safely: if IntersectionObserver is missing (old browser, some test
 * environments) it resolves to `true` immediately, so content is *never*
 * stranded at opacity 0. The original site's `initReveal` left every card
 * invisible if its observer callback never ran.
 */
export function useInViewOnce<T extends HTMLElement = HTMLDivElement>(
  options: { threshold?: number; rootMargin?: string } = {},
) {
  const { threshold = 0.12, rootMargin = "0px 0px -40px 0px" } = options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(() => {
    if (typeof window === "undefined") return true;
    if (!("IntersectionObserver" in window)) return true;
    // Respect reduced motion by skipping the animation entirely.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return true;
    return false;
  });

  useEffect(() => {
    if (inView) return;
    const node = ref.current;
    // If the feature is missing, the initialiser above already returned true.
    if (!node || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, threshold, rootMargin]);

  return { ref, inView };
}
