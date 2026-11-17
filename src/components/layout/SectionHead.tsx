import type { ReactNode } from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/utils";

/**
 * Section heading block: eyebrow + h2 on the left, supporting copy on the
 * right, collapsing to a stack below 900px. Mirrors the original `.section-head`.
 */
export function SectionHead({
  eyebrow,
  title,
  children,
  className,
  align = "row",
  id,
}: {
  eyebrow: string;
  title: ReactNode;
  /** Supporting paragraph or meta element. */
  children?: ReactNode;
  className?: string;
  /** `row` = split layout, `stack` = heading only, left aligned. */
  align?: "row" | "stack";
  id?: string;
}) {
  return (
    <div
      className={cn(
        "mb-[clamp(30px,4vw,48px)] flex gap-4",
        align === "row"
          ? "flex-col items-start min-[900px]:flex-row min-[900px]:items-end min-[900px]:justify-between min-[900px]:gap-8"
          : "flex-col items-start",
        className,
      )}
    >
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 id={id} className="mt-3.5">
          {title}
        </h2>
      </div>
      {children ? (
        <div className="max-w-[520px] text-[14.5px] leading-[1.75] text-muted-strong min-[900px]:max-w-[360px]">
          {children}
        </div>
      ) : null}
    </div>
  );
}
