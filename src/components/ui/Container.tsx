import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The original `.container`: width min(1180px, 100% - 40px), 32px gutters on
 * small screens. `width` + `margin-inline` rather than max-width so the side
 * gutter is exact at every viewport.
 */
type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  [key: string]: unknown;
};

export function Container({ children, className, as: Tag = "div", ...rest }: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-[min(1180px,calc(100%-2rem))] sm:w-[min(1180px,calc(100%-2.5rem))]",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** A page section with the original vertical rhythm. */
export function Section({
  children,
  className,
  tone = "paper",
  id,
  as: Tag = "section",
  "aria-labelledby": labelledBy,
}: {
  children: ReactNode;
  className?: string;
  tone?: "paper" | "cream" | "espresso";
  id?: string;
  as?: ElementType;
  "aria-labelledby"?: string;
}) {
  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        "py-[clamp(64px,8vw,108px)]",
        tone === "cream" && "border-y border-line-soft bg-cream-2",
        tone === "espresso" && "bg-espresso text-cream",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
