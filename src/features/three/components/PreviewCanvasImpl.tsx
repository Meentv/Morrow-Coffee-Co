import { SceneCanvas } from "./SceneCanvas";
import { CoffeeCup } from "../models/CoffeeCup";
import { Croissant } from "../models/Croissant";
import { prefersReducedMotion } from "../lib/useWebGLSupport";
import type { PreviewKind } from "./ProductPreview";

/**
 * R3F tree for the product preview modal — kept in its own module so the Three
 * chunk is only fetched when a preview is actually opened, never on page load.
 */
export function PreviewCanvasImpl({
  kind,
  pointer,
}: {
  kind: PreviewKind;
  pointer: { x: number; y: number };
}) {
  const reduced = prefersReducedMotion();

  return (
    <SceneCanvas
      pointer={pointer}
      label={kind === "cup" ? "Rotating 3D coffee cup" : "Rotating 3D croissant"}
      className="h-full w-full"
      camera={kind === "cup" ? [0, 0.9, 4.2] : [0, 1.4, 4.6]}
      fov={34}
    >
      {kind === "cup" ? (
        <CoffeeCup rotationSpeed={reduced ? 0 : 0.3} pointer={pointer} />
      ) : (
        <Croissant rotationSpeed={reduced ? 0 : 0.28} pointer={pointer} />
      )}
    </SceneCanvas>
  );
}
