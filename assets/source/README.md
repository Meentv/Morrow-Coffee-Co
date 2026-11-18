# Source masters — NOT SERVED

Files here are the originals supplied by the business. They are **never
published**: `public/` is copied verbatim into `dist/` at build time, so a 22.8 MB
master kept there would be deployed and downloadable even though nothing
references it.

- `single-origin-coffee-journey-motion-1664x1248.mp4` — the hero footage master
  (22.8 MB, 1664×1248, 8.06 s). The web versions in `public/media/` are derived
  from it. See `docs/VIDEO_SETUP.md` for the exact `ffmpeg` pipeline.

If you re-export the footage, drop the new master here and re-run the pipeline.
Do not put masters in `public/`.
