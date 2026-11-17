import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, PerspectiveCamera } from "@react-three/drei";

import { cn } from "@/lib/utils";

/**
 * Shared canvas wrapper for every 3D scene.
 *
 * Performance contract (from the brief):
 *  - DPR capped at 2 — set once here, so no scene can accidentally ship at 3x.
 *  - Rendering is *paused* when the canvas scrolls out of view (`frameloop`
 *    flips to "never"), which is what actually saves battery; visibility alone
 *    would keep the GPU busy on a hidden tab.
 *  - Transparency on, so the warm page background shows through.
 *  - No post-processing, one shadow-casting light rig, no environment HDR
 *    download (drei's `Environment preset` fetches from a CDN — avoided).
 */
export function SceneCanvas({
  children,
  pointer,
  className,
  label,
  camera = [0, 0.9, 4.4],
  fov = 34,
}: {
  children: React.ReactNode;
  pointer: { x: number; y: number };
  className?: string;
  /** Accessible name for the canvas region. */
  label: string;
  camera?: [number, number, number];
  fov?: number;
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const node = wrapper.current;
    if (!node || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting)),
      { threshold: 0.01, rootMargin: "120px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Also stop rendering when the tab is hidden.
  const [tabVisible, setTabVisible] = useState(true);
  useEffect(() => {
    const onVisibility = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <div
      ref={wrapper}
      className={cn("relative touch-pan-y", className)}
      role="img"
      aria-label={label}
    >
      <Canvas
        frameloop={visible && tabVisible ? "always" : "never"}
        dpr={[1, 2]}
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <PerspectiveCamera makeDefault position={camera} fov={fov} />
        <ambientLight intensity={0.85} color="#fff6e9" />
        <directionalLight
          position={[3.5, 5.5, 3]}
          intensity={2.1}
          color="#ffe6c4"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0004}
        />
        <directionalLight position={[-3, 1.5, -2.5]} intensity={0.5} color="#e3aa63" />
        <pointLight position={[0, 2.6, 1.4]} intensity={0.55} color="#fff" />
        <group>{children}</group>

        <ContactShadows
          position={[0, -0.62, 0]}
          opacity={0.34}
          scale={7}
          blur={2.6}
          far={4}
          resolution={256}
          color="#2a1c15"
        />
      </Canvas>
      {/* Pointer is tracked by the parent; declared here to keep the canvas dumb. */}
      <span hidden aria-hidden="true" data-pointer-x={pointer.x} data-pointer-y={pointer.y} />
    </div>
  );
}
