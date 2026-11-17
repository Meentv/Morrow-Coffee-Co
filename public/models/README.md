# 3D models

**This folder is intentionally empty of binaries.** The current 3D scenes are
built procedurally with Three.js `LatheGeometry` / `SphereGeometry` (see
`src/features/three/models/`), so the site ships **zero** model downloads and
there are no licensing questions to answer.

Nothing here is required for the site to work.

## Optional: swap in real GLB models

If you want photographed-quality models instead of the procedural ones, drop
files at **exactly** these paths and set the `model` field on the matching menu
item in `src/data/menu.ts`:

| Path                              | Used by                          | Budget   |
| --------------------------------- | -------------------------------- | -------- |
| `public/models/morrow-cup.glb`    | Homepage hero (`CoffeeCup.tsx`)  | ≤ 1.5 MB |
| `public/models/morrow-croissant.glb` | Menu 3D preview (`Croissant.tsx`) | ≤ 1.5 MB |

Requirements for any model you supply:

- **Licence**: CC0 / public domain, or a licence that explicitly permits commercial
  use. Record the source and licence next to the file (or in the table above).
  Do **not** drop in a Sketchfab "free download" that is NC-only.
- **Compression**: Draco or Meshopt (`gltf-transform optimize in.glb out.glb
  --compress draco`). Anything over 1.5 MB will be rejected in review.
- **Orientation**: +Y up, facing −Z, roughly 1 unit tall, origin at the base so
  the existing camera and contact shadow probe still line up.
- **Materials**: glTF PBR with baked or simple materials. No embedded HDR
  environments (the scene provides its own lighting and never downloads an HDR).
- **Texture sizes**: 1024² maximum, WebP/JPEG, not PNG.

## Files referenced but not present

Nothing at present. The `public/images/` audit is separate — see
`docs/IMAGE_AUDIT.md`.
