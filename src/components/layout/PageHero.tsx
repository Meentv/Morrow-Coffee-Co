import type { ReactNode } from "react";

import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * Inner-page hero (original `.page-hero`): eyebrow, oversized title with an
 * italic accent word, and a supporting paragraph on the right.
 */
export function PageHero({
  eyebrow,
  title,
  lede,
  withDot = true,
}: {
  eyebrow: string;
  title: ReactNode;
  lede: ReactNode;
  withDot?: boolean;
}) {
  return (
    <section
      className="border-b border-line-soft bg-cream pt-[clamp(52px,7vw,88px)] pb-[clamp(40px,5vw,64px)]"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 90% 120% at 80% -20%, rgba(201,138,69,0.16), transparent 60%)",
      }}
    >
      <Container className="grid items-end gap-8 min-[900px]:grid-cols-[1.2fr_0.8fr] min-[900px]:gap-10">
        <div>
          <Eyebrow withDot={withDot}>{eyebrow}</Eyebrow>
          <h1 className="mt-5 text-[clamp(2.875rem,7vw,5.25rem)]">{title}</h1>
        </div>
        <p className="max-w-[400px] pb-2 text-base leading-[1.75] text-muted-strong">{lede}</p>
      </Container>
    </section>
  );
}
