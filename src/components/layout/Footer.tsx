import { Link } from "react-router-dom";

import { Brand } from "./Brand";
import { GooBubbles, GooFilter } from "./GooBubbles";
import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "@/features/contact/components/NewsletterForm";
import { useMotionSwitch } from "@/hooks/usePrefersReducedMotion";
import { CONTACT, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Site footer — rebuilt around the Sodaworks gooey-footer reference.
 *
 * Structure follows the reference's four-part rhythm because it's a good one:
 * a masthead (brand + back to top), an oversized headline paired with the
 * signup, a ruled directory of columns, then a legal bar. Adapted, not copied:
 * the colours are Morrow's espresso/cream/caramel rather than electric blue and
 * lime, the type is Fraunces/Inter rather than Space Grotesk, and every column
 * is real Morrow navigation instead of placeholder `#` links.
 *
 * Two things the reference does that I kept because they're genuinely correct:
 *
 * 1. **The motion toggle lives in the legal bar** and drives `aria-pressed`. The
 *    goo animation loops forever, so WCAG 2.2.2 requires a pause mechanism. Note
 *    it pauses the *bubbles only* — it does not claim to stop the whole page.
 * 2. **The signup uses the real newsletter form**, not a fake submit that always
 *    says "You're in". This one shows demo mode honestly and surfaces real
 *    failures.
 */

type FooterColumn = {
  heading: string;
  links: ReadonlyArray<{ label: string; to: string; external?: boolean }>;
};

const DIRECTORY: readonly FooterColumn[] = [
  {
    heading: "Explore the menu",
    links: [
      { label: "Coffee & filter", to: "/menu?cat=coffee" },
      { label: "Bakes & pastries", to: "/menu?cat=bakes" },
      { label: "All-day kitchen", to: "/menu?cat=kitchen" },
      { label: "Retail beans", to: "/shop" },
    ],
  },
  {
    heading: "Our kitchen",
    links: [
      { label: "Breakfast table", to: "/kitchen#booking" },
      { label: "Open kitchen evenings", to: "/kitchen#booking" },
      { label: "Private chef", to: "/kitchen#booking" },
      { label: "Start an order", to: "/order" },
    ],
  },
  {
    heading: "Say hello",
    links: [
      { label: CONTACT.email, to: CONTACT.emailHref, external: true },
      { label: CONTACT.phone, to: CONTACT.phoneHref, external: true },
      { label: "Enquiries", to: "/contact" },
      { label: "Visit & hours", to: "/contact#visit" },
    ],
  },
];

export function Footer() {
  /**
   * Motion starts from the visitor's OS preference — if they've asked for
   * reduced motion, the bubbles are already still and the control already reads
   * "Play motion". See useMotionSwitch for why this isn't a useEffect+useState.
   */
  const { paused, toggle } = useMotionSwitch();

  return (
    <footer
      className="relative isolate mt-[var(--space-section)] overflow-x-clip bg-espresso-deep text-cream"
      style={{ "--goo-color": "var(--color-espresso-deep)" } as React.CSSProperties}
      data-motion={paused ? "paused" : "playing"}
    >
      {/* Filter definition lives here, NOT inside the filtered element. */}
      <GooFilter />
      <GooBubbles paused={paused} />

      <Container className="relative z-10">
        {/* 1 — Masthead */}
        <div className="flex items-center justify-between gap-4 pt-[clamp(36px,4vw,48px)]">
          <Brand tone="light" />

          <a
            href="#top"
            className="inline-flex min-h-11 items-center gap-2 text-sm text-cream/70 transition-colors hover:text-cream"
          >
            Back to top
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:-translate-y-0.5"
            >
              <path d="M8 13V3M4 7l4-4 4 4" />
            </svg>
          </a>
        </div>

        {/* 2 — Headline + signup, bottom-aligned on one baseline */}
        <div className="grid gap-8 border-b border-cream/15 py-[clamp(36px,4vw,56px)] min-[820px]:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] min-[820px]:items-end min-[820px]:gap-14">
          <h2 className="m-0 text-[clamp(3.2rem,10vw,8.5rem)] display-tight">
            Stay for
            <span className="block font-display text-gold italic">another cup.</span>
          </h2>

          <div>
            <p className="mb-5 max-w-[38ch] text-[15px] leading-[1.55] text-cream/70">
              <strong className="font-medium text-cream">The Morrow letter.</strong> New lots,
              tasting notes and kitchen dates — roughly once a month, never more.
            </p>
            <NewsletterForm variant="footer" />
          </div>
        </div>

        {/* 3 — Directory */}
        <nav
          aria-label="Footer"
          className="grid grid-cols-1 border-b border-cream/15 min-[1000px]:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] sm:grid-cols-2"
        >
          {/* Visit card — the one column with real business facts in it. */}
          <div className="border-b border-cream/15 py-9 min-[1000px]:col-span-1 min-[1000px]:border-r min-[1000px]:border-b-0 min-[1000px]:pr-8 sm:col-span-2">
            <h3 className="mb-4 text-[11px] font-bold tracking-[0.14em] text-gold uppercase">
              Visit Morrow
            </h3>
            <address className="max-w-[22ch] text-[19px] leading-[1.35] tracking-[-0.01em] not-italic">
              {CONTACT.address}
            </address>
            <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-sm">
              <dt className="text-cream/60">Hours</dt>
              <dd className="tabular-nums">{CONTACT.hours}</dd>
              <dt className="text-cream/60">Groups</dt>
              <dd className="tabular-nums">8+ by enquiry</dd>
            </dl>
            <Link
              to="/kitchen#booking"
              className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-cream/30 px-3.5 py-2 text-sm transition-colors hover:border-cream/70"
            >
              <span aria-hidden="true" className="block size-2 rounded-full bg-gold" />
              Next kitchen evening · book a table
            </Link>
          </div>

          {DIRECTORY.map((column) => (
            <div
              key={column.heading}
              className="border-b border-cream/15 py-9 min-[1000px]:border-l min-[1000px]:border-cream/15 min-[1000px]:px-8 sm:border-b-0"
            >
              <h3 className="mb-4 text-[11px] font-bold tracking-[0.14em] text-gold uppercase">
                {column.heading}
              </h3>
              <ul className="flex flex-wrap gap-x-6 gap-y-1.5 sm:grid sm:gap-y-1.5">
                {column.links.map((link) =>
                  link.external ? (
                    <li key={link.label}>
                      <a
                        href={link.to}
                        className="inline-block py-0.5 text-[15px] text-cream/70 transition-colors hover:text-cream hover:underline hover:underline-offset-4"
                      >
                        {link.label}
                      </a>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="inline-block py-0.5 text-[15px] text-cream/70 transition-colors hover:text-cream hover:underline hover:underline-offset-4"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </nav>

        {/* 4 — Legal bar, including the motion control */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-[18px] pb-7 text-[13px] text-cream/60">
          <span>
            © {new Date().getFullYear()} {SITE.name}
          </span>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link to="/contact" className="transition-colors hover:text-cream">
              Privacy
            </Link>
            <Link to="/contact" className="transition-colors hover:text-cream">
              Terms
            </Link>

            <button
              type="button"
              onClick={toggle}
              aria-pressed={paused}
              className={cn(
                "inline-flex min-h-8 cursor-pointer items-center gap-2 text-cream/60 transition-colors hover:text-cream",
                "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus",
              )}
            >
              {paused ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M5 3.2v9.6a.8.8 0 0 0 1.2.7l7.6-4.8a.8.8 0 0 0 0-1.4L6.2 2.5A.8.8 0 0 0 5 3.2z" />
                </svg>
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <rect x="4" y="3" width="3" height="10" rx="1" />
                  <rect x="9" y="3" width="3" height="10" rx="1" />
                </svg>
              )}
              <span>{paused ? "Play motion" : "Pause motion"}</span>
            </button>
          </div>
        </div>
      </Container>
    </footer>
  );
}
