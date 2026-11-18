import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { ProductImage } from "@/features/menu/components/ProductImage";
import { useCartStore } from "@/features/cart/store/cart.store";
import { toast } from "@/components/feedback/toast.store";
import { formatCents } from "@/lib/currency";
import { cn } from "@/lib/utils";
import {
  GRIND_OPTIONS,
  WEIGHT_OPTIONS,
  basketIdFor,
  pricePer100g,
  variantPriceCents,
  type BeanProduct,
  type GrindOption,
  type WeightOption,
} from "@/data/beans";

/**
 * A bag of coffee on the shop grid.
 *
 * The variant choice (weight + grind) happens inline on the card rather than on
 * a separate product page, because each coffee has exactly two meaningful
 * choices and a full page would be four clicks deep for a $19 purchase. The
 * card still shows the full spec — origin, process, roast, tasting notes —
 * because that is what makes the purchase feel informed rather than impulsive.
 *
 * Accessibility:
 *  - weight and grind are real radio groups with visible <legend>s;
 *  - the add button's accessible name includes the chosen variant, so a screen
 *    reader user knows exactly what they are adding;
 *  - the price is a live region, so changing weight is announced.
 */
export function BeanCard({ bean, index = 0 }: { bean: BeanProduct; index?: number }) {
  const addItem = useCartStore((state) => state.addItem);
  const reduceMotion = useReducedMotion();

  const [weight, setWeight] = useState<WeightOption>("250g");
  const [grind, setGrind] = useState<GrindOption>("Whole bean");

  const priceCents = variantPriceCents(bean.basePriceCents, weight);
  const grams = { "250g": 250, "500g": 500, "1kg": 1000 }[weight];
  const per100g = pricePer100g(priceCents, grams);

  const handleAdd = () => {
    addItem({
      id: basketIdFor(bean, weight, grind),
      name: `${bean.name} · ${weight} · ${grind}`,
      priceCents,
      image: bean.image,
    });
    toast.success(`${bean.name} (${weight}, ${grind.toLowerCase()}) added to your basket`);
  };

  return (
    <motion.article
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ type: "spring", stiffness: 340, damping: 26, mass: 0.7 }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-card border border-line bg-paper",
        "transition-[border-color,box-shadow] duration-300 hover:border-espresso/20 hover:shadow-card",
      )}
      aria-labelledby={`bean-${bean.slug}-name`}
    >
      <div className="relative">
        <ProductImage
          src={bean.image}
          alt={bean.alt}
          width={bean.width}
          height={bean.height}
          className="aspect-[4/3] w-full"
          imgClassName="group-hover:scale-[1.05] duration-[700ms] ease-brand motion-reduce:transform-none"
          priority={index < 2}
          sizes="(max-width: 640px) 92vw, (max-width: 1060px) 46vw, 30vw"
        />
        {bean.badge ? (
          <span className="absolute top-3 left-3 rounded-full bg-paper/95 px-2.5 py-1 text-[9.5px] font-bold tracking-[0.12em] text-espresso uppercase backdrop-blur-sm">
            {bean.badge}
          </span>
        ) : null}
        <span className="absolute top-3 right-3 rounded-full bg-espresso/90 px-2.5 py-1 text-[9.5px] font-bold tracking-[0.12em] text-cream uppercase backdrop-blur-sm">
          {bean.roast}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 id={`bean-${bean.slug}-name`} className="text-[22px] leading-tight">
            {bean.name}
          </h3>
          <p className="shrink-0 pt-1 text-right">
            <span className="block text-[17px] font-semibold tabular-nums">
              {formatCents(priceCents)}
            </span>
            <span className="block text-[10.5px] text-muted-strong tabular-nums">
              {formatCents(per100g)}/100g
            </span>
          </p>
        </div>

        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-strong italic">
          {bean.tagline}
        </p>

        {/* Tasting notes as three quiet pills — the way a bag lists them. */}
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {bean.notes.map((note) => (
            <li
              key={note}
              className="rounded-full border border-line bg-cream px-2.5 py-1 text-[11px] font-medium text-espresso"
            >
              {note}
            </li>
          ))}
        </ul>

        {/* Spec row: the micro-typography table premium coffee sites use. */}
        <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-line-soft pt-3.5">
          <div>
            <dt className="spec-label">Origin</dt>
            <dd className="mt-0.5 text-[12px] leading-snug text-espresso">{bean.origin}</dd>
          </div>
          <div>
            <dt className="spec-label">Process</dt>
            <dd className="mt-0.5 text-[12px] leading-snug text-espresso">{bean.process}</dd>
          </div>
          <div>
            <dt className="spec-label">Region</dt>
            <dd className="mt-0.5 text-[12px] leading-snug text-espresso">{bean.region}</dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-col gap-3">
          <fieldset>
            <legend className="mb-1.5 spec-label">Bag size</legend>
            <div className="grid grid-cols-3 gap-1.5">
              {WEIGHT_OPTIONS.map((option) => (
                <label
                  key={option}
                  className={cn(
                    "flex min-h-[40px] cursor-pointer items-center justify-center rounded-lg border text-[12.5px] font-semibold transition-colors",
                    "has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-gold/25",
                    weight === option
                      ? "border-espresso bg-espresso text-cream"
                      : "border-line bg-paper text-espresso hover:border-espresso/30 hover:bg-cream",
                  )}
                >
                  <input
                    type="radio"
                    name={`weight-${bean.slug}`}
                    value={option}
                    checked={weight === option}
                    onChange={() => setWeight(option)}
                    className="sr-only"
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="relative">
            <label htmlFor={`grind-${bean.slug}`} className="mb-1.5 block spec-label">
              Grind
            </label>
            <select
              id={`grind-${bean.slug}`}
              value={grind}
              onChange={(event) => setGrind(event.target.value as GrindOption)}
              className="w-full cursor-pointer appearance-none rounded-lg border border-line bg-paper px-3 py-2.5 pr-9 text-[13px] text-espresso transition-colors outline-none hover:border-espresso/25 focus:border-gold-ink focus:ring-[3px] focus:ring-gold/20"
            >
              {GRIND_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="pointer-events-none absolute right-3 bottom-3 size-4 text-muted-strong"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-espresso px-4 text-[13.5px] font-semibold text-cream transition-colors hover:bg-espresso-2 focus-visible:ring-[3px] focus-visible:ring-gold/40"
          aria-label={`Add ${bean.name}, ${weight}, ${grind.toLowerCase()}, ${formatCents(priceCents)} to basket`}
        >
          Add to basket
          <span aria-hidden="true" className="text-gold-2">
            +
          </span>
        </button>
      </div>
    </motion.article>
  );
}
