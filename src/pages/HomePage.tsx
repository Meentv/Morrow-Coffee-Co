import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";

import { Seo } from "@/components/seo/Seo";
import { Button } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHead } from "@/components/layout/SectionHead";
import { MenuGrid } from "@/features/menu/components/MenuGrid";
import { NewsletterForm } from "@/features/contact/components/NewsletterForm";
import { Marquee } from "@/features/home/components/Marquee";
import { FEATURED_ITEMS } from "@/data/menu";
import { CONTACT } from "@/lib/constants";
import { ProductImage } from "@/features/menu/components/ProductImage";

/**
 * Hero 3D is a separate chunk, downloaded only after first paint and only if
 * WebGL is available. If the chunk fails, the static SVG poster underneath
 * remains — so the hero never looks broken.
 */
const HeroCupScene = lazy(() => import("@/features/three/components/HeroCupScene"));

/* ---------- Content preserved verbatim from the original index.html ---------- */

const QUOTES = [
  {
    quote: "The kind of place where a coffee becomes a whole morning.",
    author: "Amara, weekend regular",
  },
  {
    quote: "We ordered the private coffee bar for our launch. Every detail was beautiful.",
    author: "Tobi, North Studio",
  },
  {
    quote: "The honey oat latte is quietly the best thing in the city.",
    author: "Jide, first-time guest",
  },
] as const;

const STORY_STATS = [
  { value: "07am", label: "first pour" },
  { value: "08pm", label: "last call" },
  { value: "12", label: "seats outside" },
  { value: "100%", label: "made with care" },
] as const;

export default function HomePage() {
  return (
    <>
      <Seo
        title="Good coffee, made human"
        description="Morrow Coffee Co. — warm coffee, thoughtful food, and a kitchen worth gathering around. Small-batch coffee, fresh kitchen plates, and private chef bookings."
        path="/"
      />

      {/* ---------- Hero ---------- */}
      <section className="overflow-hidden pt-[clamp(48px,6vw,84px)] pb-[clamp(56px,7vw,96px)]">
        <Container className="grid items-center gap-[clamp(36px,5vw,70px)] min-[900px]:grid-cols-[1.02fr_0.98fr]">
          <div>
            <Eyebrow withDot>coffee · food · good company</Eyebrow>
            <h1 className="mt-5 mb-[22px] text-[clamp(3.25rem,8vw,5.75rem)]">
              Good mornings
              <br />
              start <em className="display-em">here.</em>
            </h1>
            <p className="max-w-[440px] text-[clamp(15px,1.4vw,17px)] leading-[1.75] text-muted-strong">
              Small-batch coffee, fresh kitchen plates, and a warm place to land. Made slowly.
              Served generously.
            </p>

            <div className="mt-[30px] flex flex-wrap gap-3">
              <Button to="/menu" variant="primary" trailing="↓">
                Explore the menu
              </Button>
              <Button to="/kitchen" variant="soft" trailing="↗">
                Order a chef
              </Button>
            </div>

            <div className="mt-[34px] flex flex-wrap items-center gap-x-[22px] gap-y-3.5 text-[12.5px] text-muted-strong">
              <span className="text-[13px] tracking-[3px] text-gold" aria-hidden="true">
                ★★★★★
              </span>
              <span>
                <b className="text-espresso">4.9 / 5</b> · loved by regulars
                <span className="sr-only"> out of 5 stars</span>
              </span>
              <span>{CONTACT.hoursShort}</span>
            </div>
          </div>

          {/* Visual column: the original photo treatment is preserved, with the
              3D cup layered into the frame rather than replacing the layout. */}
          <div className="relative">
            <div className="relative">
              <figure className="relative m-0 aspect-[4/4.6] overflow-hidden rounded-card-lg shadow-card max-[899px]:aspect-[4/3.4]">
                <ProductImage
                  src="/images/coffee-hero.jpg"
                  alt="Honey oat latte in a cream cup on a warm coffee shop table"
                  width={768}
                  height={883}
                  priority
                  className="h-full w-full"
                  sizes="(max-width: 900px) 92vw, 46vw"
                />

                {/* 3D layer. The photo already contains a latte in the lower
                    half, so a second cup sitting on top of it reads as a
                    mistake. Instead the 3D cup sits in the blurred upper-right
                    corner and deliberately breaks the frame edge, which keeps
                    the composition legible and still complements the hero.
                    It is hidden on narrow screens where it would crowd the
                    photo, and the still-photo treatment carries the hero. */}
                <Suspense fallback={null}>
                  <HeroCupScene className="pointer-events-none absolute -top-[4%] -right-[9%] hidden h-[42%] w-[52%] min-[900px]:block [&>div]:pointer-events-auto" />
                </Suspense>
              </figure>

              <div className="absolute -top-[22px] -left-5 z-2 grid size-28 -rotate-[14deg] place-items-center rounded-full bg-espresso text-center text-[10px] leading-[1.55] font-bold tracking-[0.16em] text-cream shadow-card-soft max-[899px]:-top-4 max-[899px]:-left-1.5 max-[899px]:size-24 max-[899px]:text-[9px]">
                <span aria-hidden="true">
                  ROASTED
                  <br />
                  WITH CARE
                  <br />✦
                </span>
                <span className="sr-only">Roasted with care</span>
              </div>

              <div className="absolute bottom-[34px] -left-[26px] z-2 rounded-2xl border border-line bg-white px-[18px] py-[13px] shadow-card max-[899px]:bottom-4 max-[899px]:left-3.5">
                <b className="mb-[3px] block text-[10px] tracking-[0.16em] text-gold-ink uppercase">
                  Today&rsquo;s pour
                </b>
                <span className="text-[14px] font-semibold">Honey oat latte · $5.50</span>
              </div>

              <span
                aria-hidden="true"
                className="absolute top-[14%] -right-3.5 size-3.5 rounded-full bg-gold shadow-[0_0_0_7px_rgba(201,138,69,0.18)]"
              />
            </div>
          </div>
        </Container>
      </section>

      <Marquee />

      {/* ---------- Featured menu ---------- */}
      <Section aria-labelledby="featured-heading">
        <Container>
          <SectionHead
            id="featured-heading"
            eyebrow="what's on"
            title={
              <>
                Made for
                <br />
                the <span className="gradient-text">first sip.</span>
              </>
            }
          >
            <p>
              Our everyday favourites — the things we make again and again because they make the day
              feel better.
            </p>
          </SectionHead>

          <MenuGrid items={FEATURED_ITEMS} />

          <div className="mt-[38px] flex justify-center">
            <Link
              to="/menu"
              className="border-b border-line pb-[3px] text-[15px] font-semibold text-espresso transition-colors hover:border-gold-ink hover:text-gold-ink"
            >
              See the full menu →
            </Link>
          </div>
        </Container>
      </Section>

      {/* ---------- Story ---------- */}
      <Section tone="cream" aria-labelledby="story-heading">
        <Container className="grid items-center gap-[clamp(34px,5vw,70px)] min-[900px]:grid-cols-2">
          <Reveal>
            <div className="overflow-hidden rounded-card shadow-card-soft">
              <ProductImage
                src="/images/open-kitchen-evening.jpg"
                alt="Sunlit Morrow Coffee Co. room with brass pendant lights, plants and a full pastry counter"
                width={1000}
                height={750}
                className="h-full max-h-[480px] min-h-[340px] w-full"
                sizes="(max-width: 900px) 92vw, 46vw"
              />
            </div>
          </Reveal>

          <div>
            <Eyebrow>our little corner</Eyebrow>
            <h2 id="story-heading" className="mt-[15px] mb-[18px]">
              A room for
              <br />
              the <span className="gradient-text">in-between.</span>
            </h2>
            <p className="max-w-[460px] text-[15px] leading-[1.8] text-muted-strong">
              Morrow was made for the minutes between things — before work, after school, in the
              middle of a long walk. Come for the coffee, stay because the chair is comfortable.
            </p>

            <ul className="my-[26px] grid grid-cols-2 gap-3 max-[639px]:grid-cols-2">
              {STORY_STATS.map((stat) => (
                <li
                  key={stat.label}
                  className="rounded-tile border border-line bg-white px-4 py-3.5 text-[12.5px] text-muted-strong"
                >
                  <b className="mb-0.5 block text-[21px] font-bold tracking-[-0.04em] text-espresso">
                    {stat.value}
                  </b>
                  {stat.label}
                </li>
              ))}
            </ul>

            <Button to="/contact" variant="soft" trailing="↗">
              Plan a visit
            </Button>
          </div>
        </Container>
      </Section>

      {/* ---------- Kitchen promo ---------- */}
      <Section aria-labelledby="kitchen-heading">
        <Container>
          <SectionHead
            id="kitchen-heading"
            eyebrow="the kitchen"
            title={
              <>
                More than
                <br />
                <span className="gradient-text">coffee.</span>
              </>
            }
          >
            <p>
              For dinners, launches, birthdays, and the days that deserve a little extra attention.
            </p>
          </SectionHead>

          <div className="grid gap-[22px] min-[900px]:grid-cols-[1.35fr_0.9fr]">
            <Reveal>
              <article className="relative min-h-[470px] overflow-hidden rounded-card shadow-card-soft max-[899px]:min-h-[420px]">
                <ProductImage
                  src="/images/chef-portrait-aya.jpg"
                  alt="Morrow barista pouring latte art at the espresso machine"
                  width={1000}
                  height={750}
                  className="absolute inset-0 h-full w-full"
                  sizes="(max-width: 900px) 92vw, 55vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgba(26,16,11,0.94)_20%,rgba(26,16,11,0))] px-[30px] pt-[90px] pb-[30px] text-cream">
                  <Eyebrow tone="gold">Morrow kitchen</Eyebrow>
                  <h3 className="mt-2.5 mb-2.5 text-[clamp(26px,3vw,38px)] text-white">
                    Order a chef for your table.
                  </h3>
                  <p className="max-w-[460px] text-[13.5px] leading-[1.7] text-cream/72">
                    Bring the Morrow feeling to your next gathering with a private coffee bar, a
                    chef-led breakfast, or a full evening menu.
                  </p>
                </div>
              </article>
            </Reveal>

            <aside className="flex flex-col rounded-card bg-espresso p-[clamp(26px,3vw,36px)] text-cream">
              <Eyebrow tone="gold">private service</Eyebrow>
              <h3 className="mt-3.5 mb-3 text-[clamp(24px,2.4vw,31px)] text-white">
                We bring the good part to you.
              </h3>
              <p className="text-[13.5px] leading-[1.75] text-cream/68">
                Tell us the occasion and we&rsquo;ll shape a warm, thoughtful food-and-coffee
                experience around it.
              </p>

              <ul className="my-[22px] mb-[26px] flex flex-1 flex-col gap-2.5">
                {["Coffee bar for events", "Private chef bookings", "Office breakfast drops"].map(
                  (feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-[11px] rounded-xl border border-white/8 bg-white/6 px-[15px] py-[13px] text-[13.5px]"
                    >
                      <i aria-hidden="true" className="font-normal text-gold not-italic">
                        ✦
                      </i>
                      {feature}
                    </li>
                  ),
                )}
              </ul>

              <Button to="/kitchen" variant="gold" trailing="↗" className="self-start">
                Explore kitchen services
              </Button>
            </aside>
          </div>
        </Container>
      </Section>

      {/* ---------- Testimonials ---------- */}
      <Section tone="cream" aria-labelledby="quotes-heading">
        <Container>
          <SectionHead
            id="quotes-heading"
            eyebrow="kind words"
            title={
              <>
                Good company
                <br />
                <span className="gradient-text">keeps coming back.</span>
              </>
            }
          />
          <ul className="grid gap-5 min-[900px]:grid-cols-3">
            {QUOTES.map((entry, index) => (
              <li key={entry.author}>
                <Reveal delayMs={index * 70}>
                  <figure className="h-full rounded-card border border-line bg-white px-[26px] py-[27px] transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-card-soft">
                    <span aria-hidden="true" className="text-[13px] tracking-[3px] text-gold">
                      ★★★★★
                    </span>
                    <blockquote className="mt-3.5 mb-[18px] text-[17px] leading-[1.5] font-semibold tracking-[-0.03em]">
                      &ldquo;{entry.quote}&rdquo;
                    </blockquote>
                    <figcaption className="text-[12.5px] text-muted-strong">
                      — {entry.author}
                    </figcaption>
                  </figure>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ---------- Newsletter CTA ---------- */}
      <Section aria-labelledby="newsletter-heading">
        <Container>
          <div className="rounded-card-lg bg-[linear-gradient(135deg,var(--color-espresso)_0%,#4a3426_70%,#5b4030_100%)] px-[clamp(24px,5vw,64px)] py-[clamp(48px,7vw,84px)] text-center text-cream">
            <Eyebrow tone="cream">stay in the loop</Eyebrow>
            <h2 id="newsletter-heading" className="mt-4 mb-3.5 text-white">
              Your next favourite
              <br />
              cup is waiting.
            </h2>
            <p className="mx-auto max-w-[430px] text-[15px] text-cream/70">
              Get new menu drops, kitchen stories, and a little good news in your inbox.
            </p>
            <NewsletterForm />
          </div>
        </Container>
      </Section>
    </>
  );
}
