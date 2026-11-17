import { useCartStore } from "../store/cart.store";
import type { CartLine } from "@/features/menu/types";
import { formatCents, lineTotalCents } from "@/lib/currency";
import { CART_LIMITS } from "@/lib/constants";

/**
 * One basket line with quantity controls.
 *
 * The original had only a remove (×) button — you could not change quantity
 * without re-adding from the menu, and there was no way to add a second of the
 * same item from the basket itself. Quantity steppers are additive to the
 * preserved behaviour, not a replacement for it: the × still removes the line.
 *
 * Stepper buttons carry explicit accessible names that include the product, so
 * a screen-reader user tabbing through a long basket never has to guess which
 * "minus" they are on.
 */
export function CartLineItem({ line, compact = false }: { line: CartLine; compact?: boolean }) {
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const removeItem = useCartStore((state) => state.removeItem);

  const lineCents = lineTotalCents(line.priceCents, line.quantity);

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl bg-cream px-3 py-2.5">
        <div className="min-w-0">
          <b className="block truncate text-[13px] tracking-[-0.02em]">{line.name}</b>
          <span className="text-[11.5px] text-muted-strong">× {line.quantity}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <span className="text-[13px] font-bold text-espresso tabular-nums">
            {formatCents(lineCents)}
          </span>
          <button
            type="button"
            onClick={() => removeItem(line.id)}
            aria-label={`Remove ${line.name} from basket`}
            className="grid size-[22px] place-items-center rounded-full border border-line bg-white text-[13px] leading-none text-muted-strong transition-colors hover:bg-espresso hover:text-cream"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <li className="flex items-start gap-3 rounded-xl bg-cream p-2.5">
      {line.image ? (
        <img
          src={line.image}
          alt=""
          width={48}
          height={48}
          loading="lazy"
          decoding="async"
          className="size-12 shrink-0 rounded-lg bg-cream-2 object-cover"
          // Decorative: the adjacent text already names the product, so an alt
          // here would make a screen reader announce the product twice.
          onError={(event) => {
            event.currentTarget.style.visibility = "hidden";
          }}
        />
      ) : null}

      <div className="min-w-0 flex-1">
        <p className="text-[13px] leading-tight font-semibold tracking-[-0.02em]">{line.name}</p>
        <p className="mt-0.5 text-[11.5px] text-muted-strong tabular-nums">
          {formatCents(line.priceCents)} each
        </p>

        <div className="mt-2 flex items-center gap-1.5">
          <QuantityButton
            label={`Decrease quantity of ${line.name}`}
            disabled={false}
            onClick={() => decrement(line.id)}
            symbol="−"
            hint={line.quantity === 1 ? "removes the item" : undefined}
          />
          <span
            className="min-w-6 text-center text-[12.5px] font-bold tabular-nums"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="sr-only">{line.name} quantity: </span>
            {line.quantity}
          </span>
          <QuantityButton
            label={`Increase quantity of ${line.name}`}
            disabled={line.quantity >= CART_LIMITS.maxQuantityPerLine}
            onClick={() => increment(line.id)}
            symbol="+"
            hint={line.quantity >= CART_LIMITS.maxQuantityPerLine ? "maximum reached" : undefined}
          />
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="text-[13px] font-bold tabular-nums">{formatCents(lineCents)}</span>
        <button
          type="button"
          onClick={() => removeItem(line.id)}
          aria-label={`Remove ${line.name} from basket`}
          className="grid size-[22px] place-items-center rounded-full border border-line bg-white text-[13px] leading-none text-muted-strong transition-colors hover:bg-espresso hover:text-cream"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </li>
  );
}

function QuantityButton({
  label,
  onClick,
  disabled,
  symbol,
  hint,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  symbol: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={hint ? `${label} (${hint})` : label}
      className="grid size-6 place-items-center rounded-full border border-line bg-white text-[13px] leading-none text-espresso transition-colors hover:border-gold disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span aria-hidden="true">{symbol}</span>
    </button>
  );
}
