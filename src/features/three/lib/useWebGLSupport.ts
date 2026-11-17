import { useEffect, useState } from "react";

type WebGLState = "checking" | "supported" | "unsupported";

/**
 * One-shot WebGL capability probe.
 *
 * Checks for a real context rather than trusting `window.WebGLRenderingContext`
 * to exist — some locked-down browsers expose the constructor and still refuse
 * `getContext("webgl2")`. Also treats a software renderer as unsupported, since
 * a 3D cup is decoration and should never cost a low-end device 30fps.
 */
export function useWebGLSupport(): { state: WebGLState; isSupported: boolean } {
  const [state, setState] = useState<WebGLState>("checking");

  useEffect(() => {
    let cancelled = false;

    const probe = () => {
      try {
        const canvas = document.createElement("canvas");
        const context =
          canvas.getContext("webgl2") ??
          canvas.getContext("webgl") ??
          canvas.getContext("experimental-webgl");

        if (!context) {
          if (!cancelled) setState("unsupported");
          return;
        }

        // Release the probe context immediately.
        const loseContext = (context as WebGLRenderingContext).getExtension?.("WEBGL_lose_context");
        loseContext?.loseContext();

        const debugInfo = (context as WebGLRenderingContext).getExtension(
          "WEBGL_debug_renderer_info",
        );
        const renderer =
          debugInfo &&
          (context as WebGLRenderingContext).getParameter(
            (debugInfo as { UNMASKED_RENDERER_WEBGL: number }).UNMASKED_RENDERER_WEBGL,
          );

        const softwareRenderer =
          typeof renderer === "string" && /swiftshader|software|basic render/i.test(renderer);

        if (!cancelled) setState(softwareRenderer ? "unsupported" : "supported");
      } catch {
        if (!cancelled) setState("unsupported");
      }
    };

    // Defer out of the critical render path so the probe never blocks first paint.
    const id = window.requestIdleCallback
      ? window.requestIdleCallback(probe, { timeout: 1200 })
      : window.setTimeout(probe, 200);

    return () => {
      cancelled = true;
      if (window.cancelIdleCallback && typeof id === "number") window.cancelIdleCallback(id);
      else window.clearTimeout(id as number);
    };
  }, []);

  return { state, isSupported: state === "supported" };
}

/** True when the user asked for reduced motion — disables auto-rotation. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
