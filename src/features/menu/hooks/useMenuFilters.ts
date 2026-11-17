import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { MENU_ITEMS } from "@/data/menu";
import { MENU_CATEGORIES, type MenuCategory, type MenuItem } from "../types";

export const ALL_CATEGORIES = "all" as const;
export type CategoryFilter = MenuCategory | typeof ALL_CATEGORIES;

const SEARCH_PARAM = "cat";
const QUERY_PARAM = "q";

function isCategory(value: string | null): value is MenuCategory {
  return value !== null && (MENU_CATEGORIES as readonly string[]).includes(value);
}

/**
 * Category filtering + text search in one hook, backed by the URL.
 *
 * - `?cat=coffee` deep-links straight to a filtered menu (required by the
 *   brief) and survives a refresh, a share, and the back button.
 * - `?q=latte` does the same for search, so a shared link reproduces results.
 * - Both are driven off `useSearchParams`, so the browser's back button
 *   naturally undoes a filter change instead of desynchronising state.
 */
export function useMenuFilters(items: readonly MenuItem[] = MENU_ITEMS) {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawCategory = searchParams.get(SEARCH_PARAM);
  const activeCategory: CategoryFilter = isCategory(rawCategory) ? rawCategory : ALL_CATEGORIES;
  const query = searchParams.get(QUERY_PARAM) ?? "";

  const setCategory = useCallback(
    (category: CategoryFilter) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          if (category === ALL_CATEGORIES) next.delete(SEARCH_PARAM);
          else next.set(SEARCH_PARAM, category);
          return next;
        },
        { replace: false, preventScrollReset: true },
      );
    },
    [setSearchParams],
  );

  const setQuery = useCallback(
    (value: string) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          if (value.trim()) next.set(QUERY_PARAM, value);
          else next.delete(QUERY_PARAM);
          return next;
        },
        // Search keystrokes replace rather than push, so typing doesn't flood
        // the history stack with one entry per character.
        { replace: true, preventScrollReset: true },
      );
    },
    [setSearchParams],
  );

  const reset = useCallback(() => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete(SEARCH_PARAM);
        next.delete(QUERY_PARAM);
        return next;
      },
      { preventScrollReset: true },
    );
  }, [setSearchParams]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory = activeCategory === ALL_CATEGORIES || item.category === activeCategory;
      if (!matchesCategory) return false;
      if (!needle) return true;

      // Search name + description + category label, matching the original
      // behaviour of matching against the card's full text content.
      const haystack = `${item.name} ${item.description} ${item.category}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [items, activeCategory, query]);

  return {
    items: filtered,
    total: items.length,
    resultCount: filtered.length,
    activeCategory,
    query,
    setCategory,
    setQuery,
    reset,
    isFiltered: activeCategory !== ALL_CATEGORIES || query.trim().length > 0,
  };
}
