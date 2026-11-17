import { Link } from "react-router-dom";

import { Brand } from "./Brand";
import { Container } from "@/components/ui/Container";

/**
 * Site footer. The original each page carried its own copy of this markup with
 * slightly different link columns; those are merged into one shared footer that
 * uses the full 4-column layout the homepage had, keeping every link that
 * appeared anywhere in the original.
 */

type FooterColumn = {
  heading: string;
  links: Array<{ label: string; to: string }>;
};

const COLUMNS: readonly FooterColumn[] = [
  {
    heading: "Explore",
    links: [
      { label: "Home", to: "/" },
      { label: "Menu", to: "/menu" },
      { label: "Kitchen", to: "/kitchen" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    heading: "Visit",
    links: [
      { label: "Hours & location", to: "/contact" },
      { label: "Private events", to: "/kitchen" },
      { label: "Enquiries", to: "/contact" },
    ],
  },
  {
    heading: "Order",
    links: [
      { label: "Start an order", to: "/order" },
      { label: "Order a chef", to: "/kitchen" },
      { label: "Wholesale", to: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-espresso pt-[clamp(52px,7vw,78px)] pb-7 text-cream">
      <Container>
        <div className="grid grid-cols-1 gap-8 min-[640px]:grid-cols-2 min-[1060px]:grid-cols-[1.5fr_1fr_1fr_1fr] min-[1060px]:gap-9">
          <div className="min-[1060px]:col-auto">
            <Brand tone="light" />
            <p className="mt-4 max-w-[250px] text-[13.5px] leading-[1.7] text-cream/60">
              Good coffee, thoughtful food, and a room worth returning to.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.heading} aria-labelledby={`footer-${column.heading}`}>
              <h2
                id={`footer-${column.heading}`}
                className="mb-2.5 text-[11px] font-bold tracking-[0.17em] text-gold uppercase"
              >
                {column.heading}
              </h2>
              <ul className="flex flex-col gap-[11px]">
                {column.links.map((link) => (
                  <li key={`${column.heading}-${link.label}`}>
                    <Link
                      to={link.to}
                      className="w-fit text-sm text-cream/66 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-13 flex flex-col items-start justify-between gap-4 border-t border-cream/14 pt-5.5 text-[12.5px] text-cream/50 sm:flex-row sm:items-center">
          <span>© 2025 Morrow Coffee Co.</span>
          <span>Made slowly. Served warmly.</span>
        </div>
      </Container>
    </footer>
  );
}
