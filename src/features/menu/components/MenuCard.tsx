import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { lazy, Suspense } from "react";

import { ProductImage } from "./ProductImage";
import { useAddedFeedback } from "../hooks/useAddedFeedback";
import { useCartStore } from "@/features/cart/store/cart.store";
import { toast } from "@/components/feedback/toast.store";
import { formatCents } from "@/lib/currency";
import { CATEGORY_LABELS, type MenuItem } from "../types";
import { cn } from "@/lib/utils";

/**
 * A single menu product.
 *
 * ── BUG FIXED: hover lift on revealed cards ─────────────────────────────────
 * Originally the same element carried both the `.reveal` transition
 * (`transform: translateY(26px)` → `none`) and the `:hover` lift
 * (`transform: translateY(-5px)`). Equal specificity + cascade order meant the
 * draw-in rule won and the hover lift was dead on every card.
 *
 * Here the reveal transform is owned by the ancestor <Reveal> wrapper and the
 * hover lift is owned by this element, via Motion's `whileHover`. CSS and
 * Motion never write `transform` to the same node, so there is no competing
 * rule to lose to. Behaviour is now identical for cards present on first paint
 * and cards revealed by filtering/search.
 * ────────────────────────────────────────────────────────────────────────────
 */
/**
 * Lazily loaded: the "View in 3D" trigger only appears for featured items, and
 * its chunk is only requested when such a card mounts.
 */
const ProductPreviewButton = lazy(() =>
  import("@/features/three/components/ProductPreview").then((module) => ({
    default: module.ProductPreviewButton,
  })),
);

/** Featured items that have a 3D model defined. */
const PREVIEW_KINDS: Record<string, "cup" | "croissant"> = {
  "honey-oat-latte": "cup",
  "butter-croissant": "croissant",
};

export function MenuCard({
  item,
  /** `list` = menu page (compact, no description clamp); `grid` = homepage. */
  layout = "grid",
  index = 0,
  showPreview = false,
}: {
  item: MenuItem;
  layout?: "grid" | "list";
  index?: number;
  /** Render the 3D preview trigger (featured cards only). */
  showPreview?: boolean;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const { added, confirm } = useAddedFeedback(item.id);
  const reduceMotion = useReducedMotion();
  const previewKind = showPreview ? PREVIEW_KINDS[item.id] : undefined;

  const handleAdd = () => {
    addItem(item);
    confirm();
    toast.success(`${item.name} added to your basket`);
  };

  return (
    <motion.article
      whileHover={reduceMotion ? undefined : { y: -5 }}
      transition={{ type: "spring", stiffness: 340, damping: 26, mass: 0.7 }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-card border border-line bg-white",
        "transition-[border-color,box-shadow] duration-300 hover:border-gold/45 hover:shadow-card",
      )}
      aria-labelledby={`item-${item.id}-name`}
    >
      <div className="relative">
        <ProductImage
          src={item.image}
          alt={item.alt}
          width={item.width}
          height={item.height}
          className="aspect-[4/3] w-full"
          imgClassName="group-hover:scale-[1.06] duration-[600ms] ease-brand motion-reduce:transform-none"
          // First four cards are above the fold on the menu page.
          priority={index < 2 && layout === "list"}
          sizes={
            layout === "list"
              ? "(max-width: 640px) 92vw, (max-width: 1060px) 46vw, 44vw"
              : "(max-width: 640px) 92vw, (max-width: 1060px) 46vw, 23vw"
          }
        />

        {item.badge ? (
          <span className="absolute top-[11px] left-[11px] rounded-full bg-cream/94 px-[11px] py-[5px] text-[10px] font-bold tracking-[0.08em] text-espresso uppercase backdrop-blur-sm">
            {item.badge}
          </span>
        ) : null}

        {/* Honest flag for the two cards whose only available photo is the wrong
            product. Visible in the UI rather than hidden — see docs/IMAGE_AUDIT.md. */}
        {item.imageMismatch ? (
          <span
            className="absolute right-[11px] bottom-[11px] rounded-full border border-dashed border-cream/60 bg-white/92 px-2.5 py-1 text-[9.5px] font-bold tracking-[0.08em] text-espresso uppercase backdrop-blur-sm"
            title="The photo for this item does not match the product yet — a correct photo has been requested."
          >
            photo pending
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-[18px] pt-[18px] pb-4">
        <span className="text-[10px] font-bold tracking-[0.16em] text-gold-ink uppercase">
          {CATEGORY_LABELS[item.category]}
        </span>
        <h3
          id={`item-${item.id}-name`}
          className="mt-2 mb-[7px] text-[19px] leading-tight tracking-[-0.04em]"
        >
          {item.name}
        </h3>
        <p className="flex-1 text-[13px] leading-[1.65] text-muted-strong">{item.description}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-[17px] font-bold tracking-[-0.03em] tabular-nums">
            {formatCents(item.priceCents)}
          </span>

          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Add ${item.name} to basket, ${formatCents(item.priceCents)}`}
            className={cn(
              "relative grid size-9 place-items-center rounded-full transition-[background-color,color] duration-250",
              added
                ? "bg-success text-white"
                : "bg-espresso text-cream hover:bg-gold hover:text-espresso",
            )}
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={added ? "added" : "add"}
                initial={reduceMotion ? false : { scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.14 }}
                aria-hidden="true"
                className="text-[18px] leading-none font-medium"
              >
                {added ? "✓" : "+"}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>

        {previewKind ? (
          <Suspense fallback={null}>
            <ProductPreviewButton itemName={item.name} kind={previewKind} />
          </Suspense>
        ) : null}
      </div>
    </motion.article>
  );
}
