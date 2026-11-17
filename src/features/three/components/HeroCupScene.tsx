import { Suspense, lazy, useEffect, useState } from "react";

import { usePointerParallax } from "../hooks/usePointerParallax";
import { useWebGLSupport } from "../lib/useWebGLSupport";
import { cn } from "@/lib/utils";

/**
 * The hero 3D experience is loaded as its own chunk only when it is actually
 * going to be used. Three.js never reaches the JS bundle of /menu, /kitchen,
 * /order or /contact (verified by the manualChunks split in vite.config.ts).
 */
const HeroCanvas = lazy(() =>
  import("./HeroCanvasImpl").then((module) => ({ default: module.HeroCanvasImpl })),
);

export function HeroCupScene({ className }: { className?: string }) {
  const { isSupported, state } = useWebGLSupport();
  const { ref, pointer } = usePointerParallax<HTMLDivElement>();
  const [hydrated, setHydrated] = useState(false);

  /* Only begin downloading the 3D chunk after first paint + idle. */
  useEffect(() => {
    if (!isSupported) return;
    const id = window.requestIdleCallback
      ? window.requestIdleCallback(() => setHydrated(true), { timeout: 1800 })
      : window.setTimeout(() => setHydrated(true), 400);
    return () => {
      if (window.cancelIdleCallback && typeof id === "number") window.cancelIdleCallback(id);
      else window.clearTimeout(id as number);
    };
  }, [isSupported]);

  const showCanvas = isSupported && hydrated;

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Static poster: always painted first, and what remains visible if WebGL
          is missing, the chunk fails, or the device is low-end. */}
      <div
        className={cn(
          "absolute inset-0 grid place-items-center transition-opacity duration-700",
          showCanvas ? "opacity-0" : "opacity-100",
        )}
        aria-hidden={showCanvas ? "true" : undefined}
      >
        <StaticCupPoster />
      </div>

      {showCanvas ? (
        <Suspense fallback={null}>
          <div className="absolute inset-0">
            <HeroCanvas pointer={pointer} />
          </div>
        </Suspense>
      ) : null}

      {/* Keyboard & screen-reader equivalent for the decorative 3D object. */}
      <p className="sr-only">
        {state === "unsupported"
          ? "An illustration of a Morrow espresso cup. Interactive 3D is not available on this device, but the illustration and all page content are."
          : "An interactive 3D illustration of a Morrow espresso cup that rotates slowly and responds to your pointer. It is decorative; every menu item, price and booking form on this page is available as text."}
      </p>
    </div>
  );
}

/** Lightweight inline SVG cup — no image request, so it can paint instantly. */
function StaticCupPoster() {
  return (
    <svg
      viewBox="0 0 240 240"
      className="h-full max-h-[420px] w-full drop-shadow-[0_24px_40px_rgba(42,28,21,0.18)]"
      role="presentation"
    >
      <defs>
        <radialGradient id="cupGrad" cx="38%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#fffdfa" />
          <stop offset="70%" stopColor="#f1e7d8" />
          <stop offset="100%" stopColor="#ddceb8" />
        </radialGradient>
        <radialGradient id="coffeeGrad" cx="42%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#6b4327" />
          <stop offset="100%" stopColor="#311c12" />
        </radialGradient>
        <ellipse id="shadow" cx="120" cy="204" rx="74" ry="12" />
        <radialGradient id="shadowGrad">
          <stop offset="0%" stopColor="#2a1c15" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#2a1c15" stopOpacity="0" />
        </radialGradient>
      </defs>

      <use href="#shadow" fill="url(#shadowGrad)" />
      {/* saucer */}
      <ellipse cx="120" cy="192" rx="82" ry="18" fill="#f6efe4" stroke="#e5d8c6" />
      <ellipse cx="120" cy="189" rx="62" ry="12" fill="#fffdf9" />
      {/* body */}
      <path
        d="M70 96h100l-9 82a16 16 0 0 1-16 14H95a16 16 0 0 1-16-14Z"
        fill="url(#cupGrad)"
        stroke="#e0d2be"
      />
      {/* handle */}
      <path
        d="M170 112c18 0 30 10 30 24s-12 24-30 24"
        fill="none"
        stroke="#efe5d6"
        strokeWidth="12"
        strokeLinecap="round"
      />
      {/* rim + coffee */}
      <ellipse cx="120" cy="96" rx="50" ry="14" fill="#f6efe4" stroke="#c98a45" strokeWidth="2" />
      <ellipse cx="120" cy="97" rx="43" ry="11" fill="url(#coffeeGrad)" />
      {/* crema highlight */}
      <ellipse cx="106" cy="94" rx="14" ry="4" fill="#c98a45" opacity="0.35" />
    </svg>
  );
}

export default HeroCupScene;
