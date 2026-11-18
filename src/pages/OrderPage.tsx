import { Link } from "react-router-dom";

import { Seo } from "@/components/seo/Seo";
import { Button } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHead } from "@/components/layout/SectionHead";
import { OrderForm } from "@/features/order/components/OrderForm";
import { useCart } from "@/features/cart/hooks/useCart";
import { CartLineItem } from "@/features/cart/components/CartLineItem";
import { formatCents } from "@/lib/currency";

export default function OrderPage() {
  const { lines, totals } = useCart();

  return (
    <>
      <Seo
        title="Order"
        description="Order from Morrow Coffee Co. — pickup or local delivery, made fresh to request."
        path="/order"
      />

      <PageHero
        eyebrow="pickup · delivery · made now"
        title={
          <>
            Let us make
            <br />
            you <em className="display-em">something.</em>
          </>
        }
        lede="Choose pickup or delivery, tell us when you want it, and we’ll get the kitchen moving."
      />

      <Section id="details">
        <Container className="grid items-start gap-6 min-[900px]:grid-cols-[1fr_0.75fr]">
          <OrderForm />

          <div className="min-[900px]:sticky min-[900px]:top-[calc(var(--header-h)+18px)]">
            <aside
              className="rounded-card border border-line bg-white p-6 sm:p-[26px_24px]"
              aria-labelledby="basket-heading"
            >
              <Eyebrow>your basket</Eyebrow>
              <h2 id="basket-heading" className="mt-3 mb-1 text-[29px] leading-[1.05]">
                Ready when
                <br />
                you are.
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
                <ul className="my-[18px] flex flex-col gap-2.5">
                  {lines.map((line) => (
                    <CartLineItem key={line.id} line={line} />
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

              <Button to="/menu" variant="soft" fullWidth trailing="+" className="mt-[17px]">
                Add more from menu
              </Button>

              <p className="mt-[22px] text-[12px] leading-[1.7] text-muted-strong">
                Orders are prepared fresh. We’ll confirm the final timing by phone or email.
              </p>
            </aside>
          </div>
        </Container>
      </Section>

      {/* ---------- Kitchen cross-sell ---------- */}
      <Section tone="cream">
        <Container>
          <SectionHead
            eyebrow="make it a gathering"
            title={
              <>
                Need a chef
                <br />
                <em className="display-em">with that?</em>
              </>
            }
          >
            <p>
              For office breakfasts, birthdays, launches, or any table you want to make memorable.
            </p>
          </SectionHead>

          <div className="flex flex-wrap items-center justify-between gap-6 rounded-card bg-espresso p-[clamp(24px,4vw,34px)] text-cream">
            <div>
              <Eyebrow tone="gold">Morrow kitchen</Eyebrow>
              <h3 className="mt-2.5 mb-[7px] text-[clamp(24px,3vw,30px)] text-cream">
                Order a private coffee chef.
              </h3>
              <p className="text-[13.5px] text-cream/65">
                We bring the bar, the menu, and the calm.
              </p>
            </div>
            <Button to="/kitchen" variant="secondary" trailing="↗">
              Book the kitchen
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
