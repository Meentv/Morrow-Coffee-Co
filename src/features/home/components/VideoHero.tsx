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
 * The supplied clip (1664×1248, 8.06s, 22.8 MB) is genuinely beautiful but was
 * never web-ready, and it had a hard loop seam: it opens pouring coffee into a
 * cup and ends on a hillside plantation, so `loop` snapped from the plantation
 * back to the pour and read as a glitch.
 *
 * Two fixes, both applied to the file itself rather than papered over in CSS:
 *
 * 1. **Re-timed for a seamless loop.** The clip is rebuilt from 1.2s→8.06s and
 *    then crossfades the tail (6.86s→8.06s) into the head (0s→1.2s). The result
 *    starts and ends on the *same* frame, so `loop` is invisible. 6.88s long.
 * 2. **Encoded as a ladder.** 22.8 MB → a 0.98 MB mobile file. Delivery is
 *    WebM first (VP9, ~15% smaller here), then H.264 for Safari, and the phone
 *    never downloads the 1920 version.
 *
 * `hero-1920.mp4` is deliberately NOT preloaded and NOT the default source — a
 * phone that fetches it wastes ~3.4 MB on a screen that can't resolve it. The
 * `<source media>` ladder means the browser only ever fetches one file.
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

const POSTER = "/media/hero-poster-1280.jpg";

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
            {/* Phone first. 854 is plenty for a portrait phone at DPR 2 once
                object-cover crops to the middle third of a 4:3 frame. */}
            <source src="/media/hero-854.webm" type="video/webm" media="(max-width: 700px)" />
            <source src="/media/hero-854.mp4" type="video/mp4" media="(max-width: 700px)" />
            <source src="/media/hero-1280.webm" type="video/webm" media="(max-width: 1500px)" />
            <source src="/media/hero-1280.mp4" type="video/mp4" media="(max-width: 1500px)" />
            <source src="/media/hero-1920.mp4" type="video/mp4" />
          </video>
        ) : (
          /* Reduced motion, or the one frame before we know the pref: a still. */
          <img
            src={POSTER}
            alt=""
            width={1280}
            height={960}
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
            <Button
              to="/menu"
              size="lg"
              className="bg-cream text-espresso hover:bg-gold"
              trailing="→"
            >
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
