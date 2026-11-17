import { SceneCanvas } from "./SceneCanvas";
import { CoffeeCup } from "../models/CoffeeCup";
import { prefersReducedMotion } from "../lib/useWebGLSupport";

/**
 * Actual R3F tree for the hero. Lives in its own module so `three`,
 * `@react-three/fiber` and `@react-three/drei` are only pulled in by the lazy
 * import in HeroCupScene — never by the HomePage chunk itself.
 */
export function HeroCanvasImpl({ pointer }: { pointer: { x: number; y: number } }) {
  const reduced = prefersReducedMotion();

  return (
    <SceneCanvas
      pointer={pointer}
      label="Interactive 3D espresso cup"
      className="h-full w-full"
      camera={[0, 0.85, 4.6]}
      fov={32}
    >
      <CoffeeCup rotationSpeed={reduced ? 0 : 0.22} pointer={pointer} />
    </SceneCanvas>
  );
}
