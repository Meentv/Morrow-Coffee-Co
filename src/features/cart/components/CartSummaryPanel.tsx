import { Link } from "react-router-dom";

import { CartLineItem } from "./CartLineItem";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { formatCents } from "@/lib/currency";
import type { CartLine, CartTotals } from "@/features/menu/types";
import { cn } from "@/lib/utils";

/**
 * The "your order" side panel used on the menu page (original `.order-side`).
 * On the order page a variant of this content sits above the form.
 */
export function CartSummaryPanel({
  lines,
  totals,
  className,
  compact = false,
  children,
}: {
  lines: CartLine[];
  totals: CartTotals;
  className?: string;
  /** Compact rows (no images/steppers) — used where space is tight. */
  compact?: boolean;
  /** Slot for the primary action, so the panel owns layout not behaviour. */
  children?: React.ReactNode;
}) {
  return (
    <aside
      className={cn("rounded-card border border-line bg-white p-6 sm:p-[26px_24px]", className)}
      aria-labelledby="basket-heading"
    >
      <Eyebrow>your order</Eyebrow>
      <h2 id="basket-heading" className="mt-3 mb-1 text-[29px] leading-[1.05]">
        A little table
        <br />
        for later.
      </h2>

      {lines.length === 0 ? (
        <div className="py-5">
          <p className="text-[12.5px] leading-relaxed text-muted-strong italic">
            Your basket is empty — add something good from the menu.
          </p>
          <Link
            to="/menu"
            className="mt-4 inline-block border-b border-line pb-0.5 text-[13px] font-semibold text-espresso transition-colors hover:border-gold-ink hover:text-gold-ink"
          >
            Browse the menu →
          </Link>
        </div>
      ) : (
        <ul className={cn("my-[18px] flex flex-col gap-2.5", compact && "gap-2")}>
          {lines.map((line) => (
            <CartLineItem key={line.id} line={line} compact={compact} />
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between border-t border-line pt-[15px] text-sm">
        <span>
          Total
          <span className="ml-1.5 text-[11px] text-muted-strong">
            ({totals.itemCount} item{totals.itemCount === 1 ? "" : "s"})
          </span>
        </span>
        <b
          className="text-[21px] tracking-[-0.04em] tabular-nums"
          aria-describedby="basket-total-note"
        >
          {formatCents(totals.totalCents)}
        </b>
      </div>

      {children}

      <p className="mt-5 text-[11px] leading-[1.7] text-muted-strong">
        Pickup and delivery options available at checkout.
      </p>
    </aside>
  );
}
