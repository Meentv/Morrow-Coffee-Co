import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";

import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Mobile navigation panel.
 *
 * The original implementation had four real defects, all fixed here:
 *  1. No Escape key handling.
 *  2. No click-outside dismissal.
 *  3. Focus was never moved into the panel, and never returned to the toggle.
 *  4. `aria-controls` was missing (only `aria-expanded` was present).
 *
 * It is now a disclosure (not a modal dialog): the trigger keeps focus, the
 * panel is a <nav>, and tabbing out of the last link closes it.
 */
export function MobileNav({
  id,
  open,
  onClose,
  triggerRef,
}: {
  id: string;
  open: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const panelRef = useRef<HTMLElement>(null);

  /* Escape closes and returns focus to the toggle. */
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      onClose();
      triggerRef.current?.focus();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, triggerRef]);

  /* Pointer outside the panel (and outside the toggle) closes. */
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      onClose();
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, onClose, triggerRef]);

  /**
   * Tabbing forward off the last link closes the panel, so focus never moves to
   * an element hidden behind it. The handler lives on the interactive elements
   * (links), not on the <nav>, so we don't attach key handlers to a
   * non-interactive landmark.
   */
  const closeIfLast = (event: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key !== "Tab" || event.shiftKey) return;
    const focusables = panelRef.current?.querySelectorAll<HTMLAnchorElement>("a[href]");
    if (!focusables || focusables.length === 0) return;
    const last = focusables[focusables.length - 1];
    if (last && event.currentTarget === last) onClose();
  };

  return (
    <nav
      id={id}
      ref={panelRef}
      aria-label="Mobile"
      hidden={!open}
      className={cn(
        "absolute inset-x-0 top-[calc(var(--header-h)-6px)] rounded-2xl border border-line bg-cream p-2 shadow-card",
        open ? "block" : "hidden",
      )}
    >
      <ul className="flex flex-col">
        {NAV_LINKS.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.to === "/"}
              onClick={onClose}
              onKeyDown={closeIfLast}
              className={({ isActive }) =>
                cn(
                  "block rounded-[10px] px-[15px] py-[13px] text-[15px] font-medium transition-colors",
                  isActive
                    ? "bg-espresso/6 font-semibold text-espresso"
                    : "text-muted-strong hover:bg-espresso/6 hover:text-espresso",
                )
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
        <li className="mt-1 border-t border-line-soft pt-2">
          <NavLink
            to="/order"
            onClick={onClose}
            onKeyDown={closeIfLast}
            className="flex items-center justify-between rounded-[10px] bg-espresso px-[15px] py-[13px] text-[15px] font-semibold text-cream transition-colors hover:bg-gold hover:text-espresso"
          >
            Order now <span aria-hidden="true">↗</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
