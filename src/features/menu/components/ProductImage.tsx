import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Product photography with explicit intrinsic dimensions.
 *
 * The image files themselves are not in the repo (see docs/IMAGE_AUDIT.md), so
 * this component is deliberately defensive:
 *  - width/height are always set, so the layout box is reserved and CLS is 0
 *    whether or not the file resolves;
 *  - if the source 404s we render a warm, branded placeholder instead of a
 *    broken-image icon;
 *  - alt text is always meaningful and describes the *product*, never "image".
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

  return (
    <div className={cn("relative overflow-hidden bg-cream-2", className)}>
      {state !== "error" ? (
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
            "h-full w-full object-cover transition-opacity duration-500",
            state === "loaded" ? "opacity-100" : "opacity-0",
            imgClassName,
          )}
        />
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
