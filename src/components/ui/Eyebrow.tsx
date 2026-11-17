import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Small uppercase label with a gold dot — used above every section heading. */
export function Eyebrow({
  children,
  tone = "default",
  withDot = false,
  className,
}: {
  children: ReactNode;
  tone?: "default" | "gold" | "cream";
  withDot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[9px] text-[11px] font-semibold tracking-[0.19em] uppercase",
        tone === "default" && "text-muted-strong",
        tone === "gold" && "text-gold-ink",
        tone === "cream" && "text-cream/75",
        className,
      )}
    >
      {withDot ? (
        <i aria-hidden="true" className="size-[7px] shrink-0 rounded-full bg-gold" />
      ) : null}
      {children}
    </span>
  );
}
