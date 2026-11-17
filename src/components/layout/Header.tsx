import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Brand } from "./Brand";
import { CartButton } from "@/components/navigation/CartButton";
import { MobileNav } from "@/components/navigation/MobileNav";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const MOBILE_NAV_ID = "mobile-navigation";

/**
 * Sticky, translucent header — same visual behaviour as the original.
 * Desktop shows inline links; below 900px the disclosure panel takes over,
 * matching the original breakpoint.
 */
export function Header() {
  const toggleRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  /**
   * Any navigation closes the mobile panel — and this happens *without* an
   * effect and without setting state during render.
   *
   * We store the URL the panel was opened on rather than a boolean, then derive
   * "is it open" by comparison. When the route changes the comparison simply
   * stops matching, so the panel closes on the same render as the new page —
   * no extra paint with the overlay still showing, no cascading re-render.
   */
  const currentLocation = `${location.pathname}${location.search}`;
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const mobileOpen = openedOn !== null && openedOn === currentLocation;

  const closeMobile = () => setOpenedOn(null);

  /* Close if the viewport grows past the breakpoint while the panel is open. */
  useEffect(() => {
    if (!mobileOpen) return;
    const mq = window.matchMedia("(min-width: 900px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpenedOn(null);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-60 border-b border-line-soft bg-cream/88 backdrop-blur-[14px] backdrop-saturate-150">
      <div className="relative">
        <Container className="flex h-[var(--header-h)] items-center justify-between gap-6">
          <Brand />

          {/* Desktop navigation */}
          <nav aria-label="Main" className="hidden min-[900px]:block">
            <ul className="flex items-center gap-[clamp(18px,3vw,34px)]">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === "/"}
                    className={({ isActive }) =>
                      cn(
                        "text-[14px] font-medium transition-colors",
                        isActive
                          ? "border-b-[1.5px] border-gold pb-1.5 font-semibold text-espresso"
                          : "pb-1.5 text-muted-strong hover:text-espresso",
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2.5">
            <Button
              to="/order"
              variant="primary"
              trailing="↗"
              className="hidden max-[899px]:hidden min-[640px]:inline-flex"
            >
              Order now
            </Button>
            <CartButton onNavigate={closeMobile} />
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpenedOn(mobileOpen ? null : currentLocation)}
              aria-expanded={mobileOpen}
              aria-controls={MOBILE_NAV_ID}
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              className="grid size-10 place-items-center rounded-full border border-line bg-white min-[900px]:hidden"
            >
              <AnimatePresence initial={false} mode="wait">
                <motion.span
                  key={mobileOpen ? "close" : "open"}
                  initial={reduceMotion ? false : { rotate: -45, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { rotate: 45, opacity: 0 }}
                  transition={{ duration: 0.16 }}
                  aria-hidden="true"
                  className="block text-[16px] leading-none"
                >
                  {mobileOpen ? "✕" : "☰"}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </Container>

        <MobileNav
          id={MOBILE_NAV_ID}
          open={mobileOpen}
          onClose={closeMobile}
          triggerRef={toggleRef}
        />
      </div>
    </header>
  );
}
