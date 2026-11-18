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
import { FEATURED_BEANS } from "@/data/beans";
import { BeanCard } from "@/features/shop/components/BeanCard";
import { ProductImage } from "@/features/menu/components/ProductImage";
import { VideoHero } from "@/features/home/components/VideoHero";

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

      {/* ---------- Cinematic hero ----------
          The supplied coffee-journey clip now carries the hero: pour -> sky ->
          plantation, re-cut to loop seamlessly and encoded as a resolution
          ladder so phones never fetch the 1920 file. See VideoHero for the
          full write-up on the encode and the reduced-motion behaviour. */}
      <VideoHero />

      {/* Practical facts, moved out of the hero. On a video the spec strip
          competed with the footage; on cream beneath it, it reads as a label. */}
      <section aria-label="At a glance" className="border-b border-line">
        <Container>
          <dl className="grid grid-cols-2 gap-y-5 py-6 min-[720px]:grid-cols-4">
            <div>
              <dt className="spec-label">First pour</dt>
              <dd className="mt-1 text-[15px] font-medium">7:00 am, daily</dd>
            </div>
            <div>
              <dt className="spec-label">Last call</dt>
              <dd className="mt-1 text-[15px] font-medium">8:00 pm, daily</dd>
            </div>
            <div>
              <dt className="spec-label">Roasted</dt>
              <dd className="mt-1 text-[15px] font-medium">In-house, weekly</dd>
            </div>
            <div>
              <dt className="spec-label">Rated</dt>
              <dd className="mt-1 text-[15px] font-medium">
                4.9 / 5<span className="ml-1.5 text-[12px] text-muted-strong">by regulars</span>
              </dd>
            </div>
          </dl>
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
                the <em className="display-em">first sip.</em>
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

      {/* ---------- Shop the roastery ----------
          New section: the site now sells beans, so the homepage has to say so.
          Kept to two featured bags rather than a full grid, so it reads as an
          invitation rather than a second menu. */}
      <Section tone="cream" aria-labelledby="beans-heading">
        <Container>
          <div className="flex flex-col justify-between gap-6 min-[860px]:flex-row min-[860px]:items-end">
            <div>
              <Eyebrow>the roastery</Eyebrow>
              <h2 id="beans-heading" className="mt-4 display-tight text-[var(--text-display)]">
                Take the
                <br />
                good part <em className="display-em">home.</em>
              </h2>
            </div>
            <div className="max-w-[380px] min-[860px]:pb-2">
              <p className="text-[14.5px] leading-[1.75] text-muted-strong">
                We roast in small batches and sell it by the bag — whole bean or ground to order, in
                250g, 500g and 1kg.
              </p>
              <Link
                to="/shop"
                className="mt-4 inline-flex items-center gap-2 border-b border-espresso pb-1 text-[14px] font-semibold transition-colors hover:border-gold-ink hover:text-gold-ink"
              >
                Shop all six coffees
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <ul className="mt-10 grid grid-cols-1 gap-5 min-[760px]:grid-cols-2">
            {FEATURED_BEANS.map((bean, index) => (
              <li key={bean.slug} className="flex">
                <Reveal className="flex w-full" delayMs={index * 70}>
                  <BeanCard bean={bean} index={index} />
                </Reveal>
              </li>
            ))}
          </ul>
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
              the <em className="display-em">in-between.</em>
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
                <em className="display-em">coffee.</em>
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
                {/* Glass plate over photography: the panel is a floated surface,
                    which is the case glass is actually for. It also lets the
                    image show through instead of being blacked out by a scrim,
                    and gives the text a defined edge at any image brightness. */}
                <div className="absolute inset-x-3 bottom-3 rounded-card px-[30px] py-[26px] text-cream glass-dark sm:inset-x-4 sm:bottom-4">
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
                <em className="display-em">keeps coming back.</em>
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
