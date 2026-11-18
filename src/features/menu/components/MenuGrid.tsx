import { MenuCard } from "./MenuCard";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import type { MenuItem } from "../types";

/**
 * Responsive product grid.
 *
 * 4 columns on desktop → 2 on tablet → 1 on phones, exactly the original
 * breakpoints (1060px / 640px). Each card is wrapped in its own <Reveal> so the
 * reveal transform and the card's hover transform live on different nodes.
 */
export function MenuGrid({
  items,
  emptyState,
  columns = "featured",
}: {
  items: readonly MenuItem[];
  emptyState?: React.ReactNode;
  columns?: "featured" | "list";
}) {
  if (items.length === 0 && emptyState) return <>{emptyState}</>;

  return (
    <ul
      className={
        columns === "featured"
          ? "grid grid-cols-1 gap-5 min-[640px]:grid-cols-2 min-[1060px]:grid-cols-4"
          : "grid grid-cols-1 gap-5 min-[640px]:grid-cols-2"
      }
    >
      {items.map((item, index) => (
        <li key={item.id} className="flex">
          <Reveal className="flex w-full" delayMs={Math.min(index, 3) * 70}>
            <MenuCard item={item} layout={columns === "list" ? "list" : "grid"} index={index} />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

/** Empty state for filtered/searched results — the original had none. */
export function MenuEmptyState({ onReset, query }: { onReset: () => void; query: string }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-cream-2/60 px-6 py-14 text-center">
      <p aria-hidden="true" className="text-2xl text-gold">
        ✦
      </p>
      <h3 className="mt-3 text-[22px]">Nothing on the menu matches that.</h3>
      <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-relaxed text-muted-strong">
        {query ? (
          <>
            We couldn’t find anything for “<span className="font-semibold">{query}</span>”. Try a
            different word, or browse everything we make.
          </>
        ) : (
          <>Try a different category, or browse everything we make.</>
        )}
      </p>
      <Button variant="soft" className="mt-6" onClick={onReset}>
        Show everything
      </Button>
    </div>
  );
}
