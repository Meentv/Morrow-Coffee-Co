# Hero video — encode pipeline

The supplied clip is `public/images/single-origin-coffee-journey-motion-1664x1248.mp4`.
It is kept in the repository **as the source master only** — it is never served.
The files the site actually delivers live in `public/media/`.

## What was wrong with the source

| Property   | Value                                          | Problem                                                   |
| ---------- | ---------------------------------------------- | --------------------------------------------------------- |
| File size  | **22.8 MB**                                    | Larger than the entire rest of the site, for 8 seconds.   |
| Bitrate    | ~22.7 Mbps                                     | 10–20× what web video needs at this size.                 |
| Duration   | 8.06 s                                         | —                                                         |
| Resolution | 1664 × 1248 (4:3)                              | Not a standard rung; 4:3 also crops badly in a wide hero. |
| Audio      | AAC stereo, 130 kb/s                           | A silent hero doesn't need an audio track at all.         |
| **Loop**   | opens on a pour, ends on a plantation hillside | `loop` snapped plantation → pour. Read as a glitch.       |

## Fix 1 — make the loop seamless

The clip is a narrative montage (pour → sky → plantation), so simply looping it
can never be smooth. The seam is closed by **crossfading the tail into the head**:

```
source:  0 ──1.2──────────6.86────8.06
              └── body ─────┘└─ tail ─┘
                     ↑  head (0–1.2) fades out over the tail

output:  body (5.66s) + xfade(tail, head) (1.2s) = 6.88s
```

The output starts and ends on the **same frame**, so the join is invisible. The
side effect is that the plantation ending is traded for a clean loop — worth it,
because a background video is seen dozens of times and the seam is seen every
8 seconds.

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
SRC=public/images/single-origin-coffee-journey-motion-1664x1248.mp4
mkdir -p /tmp/enc public/media

# 1. Seamless 6.88s loop: crossfade the tail into the head, drop audio.
$FF -y -i "$SRC" -filter_complex "\
[0:v]split=3[s1][s2][s3];\
[s1]trim=1.2:6.86,setpts=PTS-STARTPTS[body];\
[s2]trim=6.86:8.06,setpts=PTS-STARTPTS[tail];\
[s3]trim=0:1.2,setpts=PTS-STARTPTS[head];\
[tail][head]xfade=transition=fade:duration=1.2:offset=0[seam];\
[body][seam]concat=n=2:v=1:a=0[out]" \
  -map "[out]" -an -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p \
  -movflags +faststart /tmp/enc/loop.mp4

# 2. H.264 ladder.
for W in 1920 1280 854; do
  $FF -y -i /tmp/enc/loop.mp4 -vf "scale=$W:-2:flags=lanczos" -an \
    -c:v libx264 -profile:v main -crf 26 -preset slow -pix_fmt yuv420p \
    -movflags +faststart "public/media/hero-$W.mp4"
done

# 3. VP9 for the two smaller rungs.
for W in 1280 854; do
  $FF -y -i /tmp/enc/loop.mp4 -vf "scale=$W:-2:flags=lanczos" -an \
    -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 -cpu-used 2 -pix_fmt yuv420p \
    "public/media/hero-$W.webm"
done

# 4. Posters — a real frame from the loop, not a stock stand-in.
$FF -y -ss 0.4 -i /tmp/enc/loop.mp4 -frames:v 1 -vf "scale=1280:-2:flags=lanczos" \
  -q:v 4 public/media/hero-poster-1280.jpg
$FF -y -ss 0.4 -i /tmp/enc/loop.mp4 -frames:v 1 -vf "scale=854:-2:flags=lanczos" \
  -q:v 5 public/media/hero-poster-854.jpg
```

## Runtime behaviour

Handled in `src/features/home/components/VideoHero.tsx`:

- `autoPlay muted loop playsInline` — muted is what makes autoplay legal;
  `playsInline` stops iOS hijacking to fullscreen.
- `preload="metadata"` — the poster is the first paint, not the video.
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

1. **The source is 1664 wide.** The 1920 rung is an upscale, so it is not
   sharper than the 1280 rung — it exists so large screens aren't served an
   upscaled-from-854 image, not because there is more detail. **If a true 2560+
   export is available, re-run step 2 and the desktop hero will visibly improve.**
   Replacing the master means re-running the whole pipeline, since the loop seam
   is baked into `loop.mp4`.
2. **The plantation ending is not in the web cut.** It reads as the end of a
   8-second montage, which is unusable in a loop. If that beat matters, the right
   fix is a longer re-edit with a crossfade designed in, not a `loop` attribute.
3. **The loop is 6.88s, not 8.06s**, for the same reason.
4. The gradient scrim under the headline was tuned by eye against the brightest
   frame (the sky section). It has not been measured with a contrast checker on
   every frame; the darkest and lightest extremes are covered, but a new master
   would need the scrim re-checked.
