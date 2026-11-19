# Source masters — NOT SERVED, and not in the build

Files here are the originals supplied by the business. They are **never
published**: `public/` is copied verbatim into `dist/` at build time, so a master
kept there would be deployed and downloadable even though nothing references it.
That is not hypothetical — it happened, and `scripts/check-public-size.mjs` now
fails the build if it happens again.

- `873909502718799330.mov` — the **current** hero footage master (2.55 MB,
  736×414, 25.65 s). The web versions in `public/media/` are derived from it.
  See `docs/VIDEO_SETUP.md` for the exact `ffmpeg` pipeline.

> The previous 1664×1248 master has been removed from the repo; it is no longer
> referenced by any encode.

If you re-export the footage, drop the new master here and re-run the pipeline.
Do not put masters in `public/`.
