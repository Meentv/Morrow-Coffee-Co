import { Link, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";

import { useCartCount } from "@/features/cart/hooks/useCart";
import { cn } from "@/lib/utils";

/**
 * Cart entry point in the header.
 *
 * Accessibility notes vs the original:
 *  - Was `aria-label="Open order"` with a 🛒 emoji and a bare number; a screen
 *    reader heard "Open order 2" with no context. Now the count is spelled out.
 *  - The emoji is decorative (aria-hidden) and paired with a drawn icon.
 */
export function CartButton({ onNavigate }: { onNavigate?: () => void }) {
  const count = useCartCount();
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const isOnOrderPage = location.pathname === "/order";

  const label =
    count === 0
      ? "Your basket is empty. Go to order page"
      : `Your basket, ${count} item${count === 1 ? "" : "s"}. Go to order page`;

  return (
    <Link
      to="/order"
      onClick={onNavigate}
      aria-label={label}
      aria-current={isOnOrderPage ? "page" : undefined}
      className="group relative inline-flex"
    >
      <span
        className={cn(
          "grid size-10 place-items-center rounded-full border border-line bg-white transition-[border-color,transform] duration-200 group-hover:-translate-y-px group-hover:border-gold",
        )}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-[17px]"
        >
          <path d="M4 7h16l-1.6 10.2a2 2 0 0 1-2 1.8H7.6a2 2 0 0 1-2-1.8L4 7Z" />
          <path d="M9 7V5.6A3 3 0 0 1 12 3a3 3 0 0 1 3 2.6V7" />
        </svg>
      </span>
      {count > 0 ? (
        <motion.span
          key={count}
          initial={reduceMotion ? false : { scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 520, damping: 22 }}
          aria-hidden="true"
          className="absolute -top-[5px] -right-[5px] grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gold px-1 text-[10px] leading-none font-bold text-espresso"
        >
          {count > 99 ? "99+" : count}
        </motion.span>
      ) : null}
    </Link>
  );
}
