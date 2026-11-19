import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

/**
 * Cinematic video hero.
 *
 * ── About the footage ───────────────────────────────────────────────────────
 * The current clip is `873909502718799330.mov`: 736×414, 16:9, 25.65s, and it
 * tells a full bean-to-cup story — beans → grinder → pour → crema → steam →
 * a person enjoying the cup.
 *
 * Two problems, both fixed in the file rather than papered over in CSS:
 *
 * 1. **Hard loop seam.** The clip opens on a coffee-bean macro and ends on a
 *    person's face, so `loop` snapped face → beans and read as a glitch.
 *    Rebuilt from 1.2s→25.65s with the tail crossfaded into the head, so the
 *    output starts and ends on the *same* frame. 24.47s.
 * 2. **Source is only 736px wide.** Upscaling it to 1280 or 1920 would invent
 *    pixels and add bytes for nothing, so the ladder tops out at the native
 *    size: 480 for phones, 736 for everything else.
 *
 * Delivery is H.264 only. VP9 was tried and came out *larger* than x264 at this
 * size and duration, so shipping a second codec would have doubled the encode
 * time and the repo for no gain. Two sources, one rung each side of 700px.
 *
 * ── Known limitation, stated plainly ────────────────────────────────────────
 * At 736px wide this footage is soft on a large desktop screen, where the hero
 * renders well over 1000px. It reads as film grain rather than blur at this
 * contrast, so it holds up — but **a 1920+ export would visibly improve it**,
 * and this ladder would then gain a rung. See docs/VIDEO_SETUP.md.
 *
 * ── Behaviour ───────────────────────────────────────────────────────────────
 * - Autoplay, muted, loop, playsInline. Muted is what makes autoplay legal in
 *   every browser; playsInline stops iOS hijacking into fullscreen.
 * - The poster is a real frame from the loop, so there's never a black box
 *   while the first bytes arrive.
 * - **Reduced motion**: no video at all. The poster is shown as a plain image
 *   and the download never starts. That's the honest reading of the pref — a
 *   slow-moving cinematic pan is exactly what it's asking us not to run.
 * - If the file can't play (codec, network), the `<video>` fails silently to
 *   the poster and the hero is still complete and readable.
 */

const POSTER = "/media/hero-poster-736.jpg";

/**
 * Data-saver and very slow connections get the poster, not the video.
 *
 * `saveData` is an explicit request ("don't spend my data"), and `2g`/`slow-2g`
 * mean a 1 MB clip would take longer to arrive than most people will wait. Both
 * are advisory and absent in many browsers, so the check is deliberately
 * conservative: only an explicit "no" skips the video.
 */
function shouldSkipVideoForNetwork(): boolean {
  if (typeof navigator === "undefined") return false;
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  if (!connection) return false;
  if (connection.saveData) return true;
  return connection.effectiveType === "slow-2g" || connection.effectiveType === "2g";
}

export function VideoHero() {
  /**
   * Deliberately NOT motion's `useReducedMotion()`: that hook returns `null` on
   * the first render and fills in after mount, which would mount a `<video>`
   * (and start a 1–3.4 MB download) for a reduced-motion visitor, then remove
   * it. This hook reads the media query during render, so the element is never
   * created in the first place.
   */
  const reduceMotion = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [adopted, setAdopted] = useState(false);

  // Computed once per mount: a connection type that changes mid-scroll should
  // not yank the video out from under someone who is already watching it.
  const [networkOk] = useState(() => !shouldSkipVideoForNetwork());
  const showVideo = !reduceMotion && networkOk;

  useEffect(() => {
    if (!showVideo) return;
    const video = videoRef.current;
    if (!video) return;

    // Some mobile browsers need an explicit nudge even with muted+autoplay.
    const attempt = video.play();
    if (attempt) {
      attempt.then(
        () => setAdopted(true),
        () => {
          /* Autoplay refused — poster stays, hero still works. */
        },
      );
    }

    /* Pause when the tab is hidden: a looping background video is wasted
       decode + battery on a tab nobody is looking at. */
    const onVisibility = () => {
      if (document.hidden) video.pause();
      else void video.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [showVideo]);

  return (
    <section className="relative isolate flex min-h-[min(88svh,760px)] items-end overflow-hidden bg-espresso-deep text-cream">
      {/* ---- Media layer ---- */}
      <div className="absolute inset-0 -z-10">
        {showVideo ? (
          <video
            ref={videoRef}
            className={cn(
              "size-full object-cover transition-opacity duration-1000",
              adopted ? "opacity-100" : "opacity-0",
            )}
            poster={POSTER}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            tabIndex={-1}
            disablePictureInPicture
          >
            <source src="/media/hero-480.mp4" type="video/mp4" media="(max-width: 700px)" />
            <source src="/media/hero-736.mp4" type="video/mp4" />
          </video>
        ) : (
          /* Reduced motion, or the one frame before we know the pref: a still. */
          <img
            src={POSTER}
            alt=""
            width={736}
            height={414}
            fetchPriority="high"
            decoding="async"
            className="size-full object-cover"
          />
        )}

        {/*
          Legibility scrim. The footage is warm and mid-key with a bright sky in
          the middle third, so plain white text over it fails contrast in places.
          This is a two-stop gradient: heavier at the bottom where the headline
          sits, a light espresso wash overall to pull the whole frame down.
          Measured against the brightest frame in the clip.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_top,rgba(23,17,14,0.92)_0%,rgba(23,17,14,0.55)_38%,rgba(23,17,14,0.28)_65%,rgba(23,17,14,0.42)_100%)]"
        />
        {/* Extra bottom fade so the hero melts into the cream page below it. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(to_top,var(--color-cream),transparent)] max-[900px]:h-20"
        />
      </div>

      {/* ---- Content ---- */}
      <Container className="relative w-full pb-[clamp(48px,7vw,84px)]">
        <div className="max-w-[min(100%,52rem)]">
          <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.16em] text-cream/75 uppercase">
            <span aria-hidden="true" className="block h-px w-8 bg-gold" />
            Single origin · roasted in-house
          </p>

          <h1 className="mt-5 text-[clamp(2.9rem,8.5vw,7rem)] display-tight">
            A better kind
            <br />
            of <span className="font-display text-gold italic">everyday.</span>
          </h1>

          <p className="mt-6 max-w-[46ch] text-[clamp(15px,1.4vw,17.5px)] leading-[1.65] text-cream/80">
            Small-batch coffee, a kitchen that runs all day, and a room worth staying in. Grown with
            care, roasted weekly, poured like it matters.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {/* `onDark`, not a className override — see the note in Button.tsx
                about why overriding variant colours produced an unlabelled
                button here. */}
            <Button to="/menu" size="lg" variant="onDark" trailing="→">
              Explore our menu
            </Button>
            <Link
              to="/contact"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-cream/35 px-6 text-[15px] font-semibold text-cream transition-colors hover:border-cream/80 hover:bg-cream/8"
            >
              Discover Morrow
            </Link>
          </div>
        </div>

        {/* Scroll cue — decorative, and it stops for reduced-motion users. */}
        <div className="mt-12 flex items-center gap-3 text-[10.5px] font-semibold tracking-[0.16em] text-cream/55 uppercase">
          <span aria-hidden="true" className="relative block h-9 w-px overflow-hidden bg-cream/25">
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-x-0 top-0 block h-3 bg-gold",
                !reduceMotion && "animate-[hero-cue_2.2s_ease-in-out_infinite]",
              )}
            />
          </span>
          Scroll
        </div>
      </Container>
    </section>
  );
}
