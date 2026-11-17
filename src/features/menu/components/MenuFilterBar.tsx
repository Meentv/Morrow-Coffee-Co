import { useEffect, useRef } from "react";

import { CATEGORY_LABELS, MENU_CATEGORIES } from "../types";
import { ALL_CATEGORIES, type CategoryFilter } from "../hooks/useMenuFilters";
import { cn } from "@/lib/utils";

/**
 * Category pills + search field.
 *
 * Accessibility notes:
 *  - Pills use `aria-pressed` (per the brief) inside a labelled group, so the
 *    active filter is announced as "pressed" rather than relying on colour.
 *  - The search input has a real <label> (visually hidden) — the original only
 *    had an aria-label and no associated label element.
 *  - A visually hidden live region announces the result count, so filtering is
 *    perceivable without sight, matching the visible "N items" counter.
 */
export function MenuFilterBar({
  activeCategory,
  query,
  resultCount,
  onCategoryChange,
  onQueryChange,
}: {
  activeCategory: CategoryFilter;
  query: string;
  resultCount: number;
  onCategoryChange: (category: CategoryFilter) => void;
  onQueryChange: (value: string) => void;
}) {
  const searchRef = useRef<HTMLInputElement>(null);

  /* "/" focuses search — a small power-user affordance, skipped while typing. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;
      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="mb-[30px] flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <div role="group" aria-label="Filter menu by category" className="flex flex-wrap gap-2.5">
          <FilterPill
            label="Everything"
            active={activeCategory === ALL_CATEGORIES}
            onClick={() => onCategoryChange(ALL_CATEGORIES)}
          />
          {MENU_CATEGORIES.map((category) => (
            <FilterPill
              key={category}
              label={CATEGORY_LABELS[category]}
              active={activeCategory === category}
              onClick={() => onCategoryChange(category)}
            />
          ))}
        </div>

        <div className="relative ml-auto w-full sm:w-auto">
          <label htmlFor="menu-search" className="sr-only">
            Search the menu
          </label>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-strong"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            ref={searchRef}
            id="menu-search"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search the menu"
            autoComplete="off"
            className="w-full min-w-[220px] rounded-full border border-line bg-white py-2.5 pr-4 pl-10 text-[13px] text-espresso transition-colors outline-none placeholder:text-espresso/65 focus:border-gold focus:ring-[3px] focus:ring-gold/15 sm:w-auto"
          />
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {resultCount} item{resultCount === 1 ? "" : "s"} match your selection
      </p>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-[17px] py-[9px] text-[13px] font-semibold transition-[background-color,color,border-color] duration-200",
        active
          ? "border-espresso bg-espresso text-cream"
          : "border-line bg-white text-espresso hover:border-gold",
      )}
    >
      {label}
    </button>
  );
}
