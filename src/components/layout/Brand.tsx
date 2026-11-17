import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

/** The "M" monogram + wordmark, exactly as in the original header/footer. */
export function Brand({
  tone = "dark",
  className,
  onClick,
}: {
  tone?: "dark" | "light";
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2.5 text-[19px] font-bold tracking-[-0.05em]",
        tone === "light" ? "text-cream" : "text-espresso",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-[34px] place-items-center rounded-[10px] text-[15px] font-bold tracking-normal",
          tone === "light" ? "bg-gold text-espresso" : "bg-espresso text-cream",
        )}
      >
        M
      </span>
      <span>
        Morrow<span className="text-gold">.</span>
      </span>
      <span className="sr-only">— home</span>
    </Link>
  );
}
