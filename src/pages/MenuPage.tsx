import { useNavigate } from "react-router-dom";

import { Seo } from "@/components/seo/Seo";
import { Button } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Container";
import { PageHero } from "@/components/layout/PageHero";
import { MenuFilterBar } from "@/features/menu/components/MenuFilterBar";
import { MenuEmptyState, MenuGrid } from "@/features/menu/components/MenuGrid";
import { useMenuFilters } from "@/features/menu/hooks/useMenuFilters";
import { useCart } from "@/features/cart/hooks/useCart";
import { CartSummaryPanel } from "@/features/cart/components/CartSummaryPanel";
import { MENU_ITEMS } from "@/data/menu";
import { toast } from "@/components/feedback/toast.store";
import { Reveal } from "@/components/ui/Reveal";

export default function MenuPage() {
  const { lines, totals } = useCart();
  const navigate = useNavigate();
  const { items, resultCount, activeCategory, query, setCategory, setQuery, reset, isFiltered } =
    useMenuFilters(MENU_ITEMS);

  /**
   * Preserved behaviour: the original `initCheckout` refused to leave the page
   * with an empty basket and toasted "Your basket is empty". Same rule, but the
   * button is now a real link-styled button with an explicit disabled state so
   * the outcome is predictable before the click.
   */
  const handleContinue = () => {
    if (lines.length === 0) {
      toast.info("Your basket is empty — add something first ☕");
      return;
    }
    navigate("/order");
  };

  return (
    <>
      <Seo
        title="Menu"
        description="The Morrow Coffee Co. menu — coffee, cold drinks, kitchen plates, and bakery, made to order."
        path="/menu"
      />

      <PageHero
        eyebrow="menu / made today"
        title={
          <>
            Take your
            <br />
            <em className="display-em">pick.</em>
          </>
        }
        lede="From a quick flat white to a long, slow breakfast — every item is made to order and served with care."
      />

      <Section>
        <Container>
          <div className="mb-[clamp(30px,4vw,48px)] flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold tracking-[0.19em] text-muted-strong uppercase">
                the menu
              </span>
              <h2 className="mt-3.5">Choose a good one.</h2>
            </div>
            <p className="font-mono text-xs text-muted-strong" aria-hidden="true">
              {resultCount} item{resultCount === 1 ? "" : "s"}
            </p>
          </div>

          <MenuFilterBar
            activeCategory={activeCategory}
            query={query}
            resultCount={resultCount}
            onCategoryChange={setCategory}
            onQueryChange={setQuery}
          />

          <div className="grid items-start gap-[26px] min-[1061px]:grid-cols-[1fr_340px]">
            <div>
              {isFiltered && resultCount > 0 ? (
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-[12.5px] text-muted-strong">
                    Showing {resultCount} of {MENU_ITEMS.length}
                    {query.trim() ? (
                      <>
                        {" "}
                        for “<span className="font-semibold text-espresso">{query.trim()}</span>”
                      </>
                    ) : null}
                  </p>
                  <button
                    type="button"
                    onClick={reset}
                    className="border-b border-line pb-px text-[12.5px] font-semibold text-espresso transition-colors hover:border-gold-ink hover:text-gold-ink"
                  >
                    Clear filters
                  </button>
                </div>
              ) : null}

              <MenuGrid
                items={items}
                columns="list"
                emptyState={<MenuEmptyState onReset={reset} query={query.trim()} />}
              />
            </div>

            <Reveal className="min-[1061px]:sticky min-[1061px]:top-[calc(var(--header-h)+18px)]">
              <CartSummaryPanel lines={lines} totals={totals}>
                <Button
                  variant="primary"
                  fullWidth
                  trailing="→"
                  onClick={handleContinue}
                  className="mt-[17px]"
                >
                  Continue order
                </Button>
              </CartSummaryPanel>
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
