import { useState } from "react";
import { Link } from "react-router-dom";

import { Seo } from "@/components/seo/Seo";
import { Container, Section } from "@/components/ui/Container";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { BeanCard } from "@/features/shop/components/BeanCard";
import { CartSummaryPanel } from "@/features/cart/components/CartSummaryPanel";
import { useCart } from "@/features/cart/hooks/useCart";
import { BEANS, ROAST_LEVELS, type RoastLevel } from "@/data/beans";
import { cn } from "@/lib/utils";

/**
 * The retail coffee shop.
 *
 * Kept as its own route rather than folding beans into /menu, because a bag of
 * beans and a flat white are different purchases: one is posted, one is handed
 * over the counter. Both still land in the same persisted basket.
 *
 * The roast filter is local state only — there are six coffees, so a deep-link
 * URL would be ceremony for nothing. Search still lives on /menu.
 */

const FILTERS = ["All roasts", ...ROAST_LEVELS] as const;
type Filter = (typeof FILTERS)[number];

export default function ShopPage() {
  const [filter, setFilter] = useState<Filter>("All roasts");
  const { lines, totals } = useCart();

  const visible =
    filter === "All roasts" ? BEANS : BEANS.filter((bean) => bean.roast === (filter as RoastLevel));

  return (
    <>
      <Seo
        title="Shop coffee beans"
        description="Buy Morrow Coffee Co. beans — single origins and house blends, roasted to order in 250g, 500g and 1kg bags, ground the way you brew."
        path="/shop"
      />

      <PageHero
        eyebrow="the roastery"
        title={
          <>
            Beans worth
            <br />
            <em className="display-em">taking home.</em>
          </>
        }
        lede="Roasted in small batches, packed within a day, and ground to order. Choose a bag, tell us how you brew, and we will do the rest."
      />

      <Section>
        <Container>
          {/* Editorial intro + filter, on one baseline */}
          <div className="mb-9 flex flex-col justify-between gap-6 border-b border-line-soft pb-6 min-[860px]:flex-row min-[860px]:items-end">
            <div>
              <p className="spec-label">Roasted to order</p>
              <h2 className="mt-2 text-[clamp(1.75rem,3vw,2.5rem)] display-tight">
                Six coffees, and the reason each one exists.
              </h2>
            </div>

            <div role="group" aria-label="Filter by roast level" className="flex flex-wrap gap-1.5">
              {FILTERS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  aria-pressed={filter === option}
                  className={cn(
                    "min-h-[38px] rounded-full border px-3.5 text-[12.5px] font-semibold transition-colors",
                    filter === option
                      ? "border-espresso bg-espresso text-cream"
                      : "border-line bg-paper text-espresso hover:border-espresso/30 hover:bg-cream",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="grid items-start gap-8 min-[1060px]:grid-cols-[1fr_320px]">
            <div>
              <p aria-live="polite" className="sr-only">
                {visible.length} coffees shown
              </p>

              <ul className="grid grid-cols-1 gap-5 min-[640px]:grid-cols-2">
                {visible.map((bean, index) => (
                  <li key={bean.slug} className="flex">
                    <Reveal className="flex w-full" delayMs={Math.min(index, 3) * 60}>
                      <BeanCard bean={bean} index={index} />
                    </Reveal>
                  </li>
                ))}
              </ul>

              {visible.length === 0 ? (
                <div className="rounded-card border border-dashed border-line bg-cream/60 p-10 text-center">
                  <p className="text-[15px] font-semibold">No coffees at that roast right now.</p>
                  <p className="mt-1 text-[13.5px] text-muted-strong">
                    Everything on the roaster is listed under one of the other roasts.
                  </p>
                  <button
                    type="button"
                    onClick={() => setFilter("All roasts")}
                    className="mt-4 rounded-full border border-espresso px-4 py-2 text-[13px] font-semibold transition-colors hover:bg-espresso hover:text-cream"
                  >
                    Show all roasts
                  </button>
                </div>
              ) : null}
            </div>

            {/* Side rail: basket + the practical facts people ask about.
                A plain div, not an <aside> — CartSummaryPanel already renders
                the complementary landmark, and nesting landmarks makes the
                screen-reader outline confusing. */}
            <div className="flex flex-col gap-5 min-[1060px]:sticky min-[1060px]:top-[calc(var(--header-h)+24px)]">
              <CartSummaryPanel lines={lines} totals={totals} />
              <div className="rounded-card border border-line bg-cream p-5">
                <h3 className="text-[15px] font-semibold">How it ships</h3>
                <ul className="mt-3 flex flex-col gap-2.5 text-[12.5px] leading-relaxed text-muted-strong">
                  <li className="flex gap-2">
                    <span aria-hidden="true" className="text-gold-ink">
                      ✦
                    </span>
                    Roasted the week you order, never sitting on a shelf.
                  </li>
                  <li className="flex gap-2">
                    <span aria-hidden="true" className="text-gold-ink">
                      ✦
                    </span>
                    Whole bean keeps longest; we grind to order if you ask.
                  </li>
                  <li className="flex gap-2">
                    <span aria-hidden="true" className="text-gold-ink">
                      ✦
                    </span>
                    Ordered with a drink? Collect both at the counter.
                  </li>
                </ul>
                <p className="mt-4 border-t border-line pt-3.5 text-[11.5px] leading-relaxed text-muted-strong">
                  Checkout opens your basket with the beans in it — no card details are taken on
                  this site, we confirm payment when we reply.
                </p>
              </div>
            </div>
          </div>

          {totals.itemCount > 0 ? (
            <p className="mt-8 text-[13px] text-muted-strong">
              Basket holds {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}.{" "}
              <Link
                to="/order"
                className="font-semibold text-espresso underline decoration-line underline-offset-4 hover:decoration-gold-ink"
              >
                Go to checkout
              </Link>
            </p>
          ) : null}
        </Container>
      </Section>
    </>
  );
}
