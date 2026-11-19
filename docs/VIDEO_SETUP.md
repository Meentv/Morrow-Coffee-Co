# Hero video — encode pipeline

The current master is `873909502718799330.mov` (736×414, 16:9, 25.65s, 2.5 MB),
supplied at the repo root and since moved to `assets/source/`. Like every master it
is **not served** — the files the site delivers live in `public/media/`. Masters belong in `assets/source/`, which
`npm run build` enforces via `scripts/check-public-size.mjs`.

> The previous 1664×1248 clip was replaced by this one on request. Its encode
> ladder has been deleted; the pipeline below is what produced the current files.

## What was wrong with the source

| Property   | Value                                 | Verdict                                            |
| ---------- | ------------------------------------- | -------------------------------------------------- |
| File size  | 2.5 MB / 25.65 s                      | Fine as a master, still not as a delivered asset.  |
| Resolution | **736 × 414 (16:9)**                  | **The limiting factor** — see "Known limitations". |
| Audio      | AAC stereo, 64 kb/s                   | Stripped: a muted hero doesn't need a track.       |
| **Loop**   | opens on a bean macro, ends on a face | `loop` snapped face → beans. Read as a glitch.     |
| Format     | `.mov` (QuickTime)                    | Not web-friendly; `.mp4` with `+faststart` is.     |

## Fix 1 — make the loop seamless

The clip is a narrative montage (beans → grinder → pour → crema → steam →
person), so simply looping it can never be smooth. The seam is closed by **crossfading the tail into the head**:

```
source:  0 ──1.2─────────────────24.45────25.65
              └────── body ────────┘└─ tail ─┘
                          ↑  head (0–1.2) fades out over the tail

output:  body (23.25s) + xfade(tail, head) (1.2s) = 24.47s
```

The output starts and ends on the **same frame**, so the join is invisible. The
side effect is that the last 1.2 s — the tail end of the person's close-up — is
traded for a clean join. Worth it: a background video is seen dozens of times,
and the seam would be seen every 24 seconds.

## Fix 2 — encode a ladder

Two codecs, three widths. Nothing is downloaded until a `<source media>` matches.

| File                | Size       | Used when             | Notes                         |
| ------------------- | ---------- | --------------------- | ----------------------------- |
| `hero-854.webm`     | 0.98 MB    | ≤ 700 px, VP9 capable | smallest phone file           |
| `hero-854.mp4`      | 0.98 MB    | ≤ 700 px, Safari      | H.264 fallback                |
| `hero-1280.webm`    | 1.54 MB    | ≤ 1500 px, VP9        | tablet / small laptop         |
| `hero-1280.mp4`     | 1.79 MB    | ≤ 1500 px, Safari     | H.264 fallback                |
| `hero-1920.mp4`     | 3.36 MB    | everything else       | desktop only, never preloaded |
| `hero-poster-*.jpg` | 40 / 77 KB | first paint, always   | real frame at 0.4 s           |

**22.8 MB → 0.98 MB on a phone.** That is a 96% reduction on the device that
feels it most, and the desktop still gets a 1920-wide file.

Ordering in `<source>` matters: WebM is listed before MP4 at each breakpoint
because VP9 came out ~15% smaller here, and the browser takes the first source it
can play.

## Reproducing the encode

Requires `ffmpeg` with libx264 and libvpx-vp9.

```bash
FF=ffmpeg
SRC=assets/source/873909502718799330.mov
mkdir -p /tmp/enc public/media

# 1. Seamless 24.47s loop: crossfade the tail into the head, drop audio.
$FF -y -i "$SRC" -filter_complex "\
[0:v]split=3[s1][s2][s3];\
[s1]trim=1.2:24.45,setpts=PTS-STARTPTS[body];\
[s2]trim=24.45:25.65,setpts=PTS-STARTPTS[tail];\
[s3]trim=0:1.2,setpts=PTS-STARTPTS[head];\
[tail][head]xfade=transition=fade:duration=1.2:offset=0[seam];\
[body][seam]concat=n=2:v=1:a=0[out]" \
  -map "[out]" -an -c:v libx264 -crf 20 -preset slow -pix_fmt yuv420p \
  -movflags +faststart /tmp/enc/loop.mp4

# 2. Desktop rung — native resolution, no scaling.
$FF -y -i /tmp/enc/loop.mp4 -an -c:v libx264 -profile:v high -crf 26 \
  -preset veryslow -pix_fmt yuv420p -movflags +faststart public/media/hero-736.mp4

# 3. Phone rung.
$FF -y -i /tmp/enc/loop.mp4 -vf "scale=480:-2:flags=lanczos" -an \
  -c:v libx264 -profile:v main -crf 28 -preset veryslow -pix_fmt yuv420p \
  -movflags +faststart public/media/hero-480.mp4

# 4. Posters — a real frame from the loop, not a stock stand-in.
#    16 s is the cup-with-steam beauty shot, which reads well at any crop.
$FF -y -ss 16 -i /tmp/enc/loop.mp4 -frames:v 1 -q:v 4 public/media/hero-poster-736.jpg
$FF -y -ss 16 -i /tmp/enc/loop.mp4 -frames:v 1 -vf "scale=480:-2" -q:v 5 \
  public/media/hero-poster-480.jpg
```

## Runtime behaviour

Handled in `src/features/home/components/VideoHero.tsx`:

- `autoPlay muted loop playsInline` — muted is what makes autoplay legal;
  `playsInline` stops iOS hijacking to fullscreen.
- `preload="metadata"` — the poster is the first paint, not the video.
- Two `<source>` entries only: 480 for ≤700px, 736 for everything else.
- **`prefers-reduced-motion`: no `<video>` element is created at all.** The
  poster renders as a still image and no bytes are fetched. This uses a
  `useSyncExternalStore` hook rather than motion's `useReducedMotion`, because
  that one returns `null` on first render and would mount the video, start the
  download, then unmount it.
- **`navigator.connection.saveData` or `2g`/`slow-2g`: same fallback.** An
  explicit "don't spend my data" beats the cinematic default.
- Pauses on `visibilitychange` — a looping video in a hidden tab is wasted
  decode and battery.

## Known limitations

1. **The source is 736 px wide, and that is the real constraint.** The hero
   renders well over 1000 px on a desktop, so the video is being scaled up. It
   survives because the footage is high-contrast and shallow-depth-of-field —
   the softness reads as grain rather than blur — but it is genuinely soft if you
   look for it. **A 1920×1080 export at the same length would be the single
   biggest visual improvement available**, and the ladder would then gain a rung
   at 1280. Re-run the whole pipeline, not just step 2: the loop seam is baked
   into `loop.mp4`.
2. **The last ~1.2 s is not in the web cut**, because it was consumed by the
   crossfade. Nothing visible is lost — it is the tail of the closing close-up.
3. **The loop is 24.47 s, not 25.65 s**, for the same reason.
4. The gradient scrim under the headline was tuned by eye against the lightest
   frame (the window behind the person). It has not been measured with a contrast
   checker on every frame; a new master would need the scrim re-checked.
