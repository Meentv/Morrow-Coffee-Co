import { useState } from "react";

import { webpVariant } from "@/lib/image";
import { cn } from "@/lib/utils";

/**
 * Product photography with explicit intrinsic dimensions.
 *
 * Every photo shipped in `public/images/` is present twice: a `.jpg` and a
 * `.webp` derivative of the same crop (see docs/IMAGE_AUDIT.md). This renders a
 * `<picture>` so browsers that accept WebP take the lighter file — typically
 * 40–70% fewer bytes — while everything else falls back to the JPEG. The `src`
 * prop therefore stays the canonical `.jpg` path and the WebP is derived, so no
 * caller has to know or care about the second file.
 *
 * Guarantees kept deliberately:
 *  - width/height are always set, so the layout box is reserved and CLS is 0
 *    whether or not the file resolves;
 *  - if the source 404s we render a warm, branded placeholder instead of a
 *    broken-image icon;
 *  - alt text is always meaningful and describes the *product*, never "image";
 *  - `priority` is the only thing that makes an image eager, and only the hero
 *    and first row ever pass it, so offscreen photos stay lazy.
 */

export function ProductImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  imgClassName,
  sizes = "(max-width: 640px) 92vw, (max-width: 1060px) 46vw, 30vw",
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Above-the-fold hero imagery: eager + high fetchpriority. */
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  sizes?: string;
}) {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  const webp = webpVariant(src);

  return (
    <div className={cn("relative overflow-hidden bg-cream-2", className)}>
      {/* `<picture>` must be sized like the <img> it wraps, otherwise the
          img's `h-full`/`w-full` resolve against an inline, shrink-to-fit box
          and the photo collapses. */}
      {state !== "error" ? (
        <picture className="block h-full w-full">
          {webp ? <source srcSet={webp} type="image/webp" sizes={sizes} /> : null}
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            fetchPriority={priority ? "high" : "auto"}
            onLoad={() => setState("loaded")}
            onError={() => setState("error")}
            className={cn(
              "h-full w-full object-cover transition-[opacity,transform] duration-500",
              state === "loaded" ? "opacity-100" : "opacity-0",
              // Hold the hover zoom back until the photo has loaded, otherwise the
              // fade-in and the scale animate together and read as a glitch.
              state === "loaded" ? imgClassName : "scale-100",
            )}
          />
        </picture>
      ) : null}

      {state !== "loaded" ? (
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 grid place-items-center",
            state === "error"
              ? "bg-[radial-gradient(120%_120%_at_30%_20%,#f3ebdf_0%,#e8dcc9_60%,#ddceb8_100%)]"
              : "bg-cream-2",
          )}
        >
          {state === "error" ? (
            <span className="flex flex-col items-center gap-1.5 px-3 text-center text-espresso/35">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                className="size-7"
              >
                <path d="M4 17.5 9 12l4 4 3-2.5 4 4" />
                <rect x="2.5" y="4.5" width="19" height="15" rx="3" />
                <circle cx="8.5" cy="9" r="1.4" />
              </svg>
              <span className="text-[9.5px] font-semibold tracking-[0.14em] uppercase">
                Photo coming soon
              </span>
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
