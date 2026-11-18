import { Seo } from "@/components/seo/Seo";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHead } from "@/components/layout/SectionHead";
import { Reveal } from "@/components/ui/Reveal";
import { ProductImage } from "@/features/menu/components/ProductImage";
import { KitchenEnquiryForm } from "@/features/kitchen/components/KitchenEnquiryForm";

const SERVICES = [
  {
    icon: "☕",
    title: "The Coffee Bar",
    body: "One or two baristas, a full espresso setup, and a menu of drinks for your guests.",
    cta: "Request the bar",
  },
  {
    icon: "🍽",
    title: "Breakfast Table",
    body: "A chef-led spread of pastries, toast, seasonal plates, and coffee served to the table.",
    cta: "Request breakfast",
  },
  {
    icon: "✦",
    title: "Full Evening",
    body: "A complete hosted experience with small plates, cocktails, coffee, and a team to make it flow.",
    cta: "Plan the evening",
  },
] as const;

const GALLERY = [
  {
    src: "/images/gallery-first-pour.jpg",
    alt: "Barista pouring milk into a cup at the espresso station",
    caption: "First pour",
  },
  {
    src: "/images/gallery-the-pass.jpg",
    alt: "The service counter, with the pastry case and heat lamps",
    caption: "The pass",
  },
  {
    src: "/images/gallery-milk-and-steam.jpg",
    alt: "Espresso pulling into two small cups on the machine",
    caption: "Milk & steam",
  },
  {
    src: "/images/gallery-service.jpg",
    alt: "Barista grinding coffee and tamping a shot",
    caption: "Service",
  },
  {
    src: "/images/gallery-finishing-touch.jpg",
    alt: "Warm pendant lights over the counter at closing time",
    caption: "Finishing touch",
  },
] as const;

const STATS = [
  { value: "10–300", label: "guests" },
  { value: "3 ways", label: "to gather" },
  { value: "1 team", label: "to care" },
  { value: "0 stress", label: "promised" },
] as const;

export default function KitchenPage() {
  return (
    <>
      <Seo
        title="Kitchen & Chefs"
        description="Order a chef from the Morrow kitchen — private coffee bars, breakfast tables, and full evening service."
        path="/kitchen"
      />

      <PageHero
        eyebrow="the Morrow kitchen"
        title={
          <>
            Order a chef.
            <br />
            <em className="display-em">Make it a moment.</em>
          </>
        }
        lede="Our coffee chefs bring a little theatre, a lot of care, and food people talk about after the plates are gone."
      />

      {/* ---------- Intro ---------- */}
      <Section>
        <Container className="grid items-center gap-[clamp(34px,5vw,70px)] min-[900px]:grid-cols-2">
          <Reveal>
            <div className="overflow-hidden rounded-card shadow-card-soft">
              <ProductImage
                src="/images/chef-portrait-eli.jpg"
                alt="Morrow chef plating a dish in the open kitchen"
                width={900}
                height={700}
                className="h-full max-h-[480px] min-h-[340px] w-full"
                sizes="(max-width: 900px) 92vw, 46vw"
              />
            </div>
          </Reveal>

          <div>
            <Eyebrow>private coffee service</Eyebrow>
            <h2 className="mt-[15px] mb-[18px]">
              The room can be
              <br />
              <em className="display-em">anywhere.</em>
            </h2>
            <p className="max-w-[460px] text-[15px] leading-[1.8] text-muted-strong">
              Bring Morrow to your office, home, studio, or event. We&rsquo;ll tailor a menu around
              your people and take care of the details from first pour to last plate.
            </p>

            <ul className="mt-[26px] mb-[28px] grid grid-cols-2 gap-3">
              {STATS.map((stat) => (
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
          </div>
        </Container>
      </Section>

      {/* ---------- Wide banner ---------- */}
      <div className="container-page mb-[clamp(64px,8vw,108px)]">
        <Reveal>
          <div className="h-[clamp(260px,38vw,380px)] overflow-hidden rounded-card">
            <ProductImage
              src="/images/kitchen-banner.jpg"
              alt="Guests at the marble tables while a barista works the espresso bar"
              width={1400}
              height={560}
              className="h-full w-full"
              sizes="(max-width: 1180px) 92vw, 1180px"
            />
          </div>
        </Reveal>
      </div>

      {/* ---------- Services ---------- */}
      <Section tone="cream">
        <Container>
          <SectionHead
            eyebrow="choose your service"
            title={
              <>
                Pick your
                <br />
                <em className="display-em">kind of good.</em>
              </>
            }
          >
            <p>Simple packages for small moments and big ones.</p>
          </SectionHead>

          <ul className="grid gap-5 min-[900px]:grid-cols-3">
            {SERVICES.map((service, index) => (
              <li key={service.title}>
                <Reveal delayMs={index * 70} className="h-full">
                  <article className="h-full rounded-card border border-line bg-white p-[clamp(24px,3vw,32px)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-soft">
                    <div
                      aria-hidden="true"
                      className="mb-5 grid size-[54px] place-items-center rounded-2xl bg-cream-2 text-[22px]"
                    >
                      {service.icon}
                    </div>
                    <h3 className="mb-2.5 text-[22px]">{service.title}</h3>
                    <p className="text-[13.5px] leading-[1.7] text-muted-strong">{service.body}</p>
                    <a
                      href="#booking"
                      className="mt-5 inline-block border-b border-line pb-0.5 text-sm font-semibold text-espresso transition-colors hover:border-gold-ink hover:text-gold-ink"
                    >
                      {service.cta} →
                    </a>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ---------- Team gallery ---------- */}
      <Section>
        <Container>
          <SectionHead
            eyebrow="behind the pass"
            title={
              <>
                The people
                <br />
                <em className="display-em">making it.</em>
              </>
            }
          >
            <p>
              Baristas, chefs, and bakers — the team that turns a request into a morning worth
              remembering.
            </p>
          </SectionHead>

          <ul className="grid grid-cols-2 gap-3.5 min-[640px]:grid-cols-3 min-[1061px]:grid-cols-5">
            {GALLERY.map((entry, index) => (
              <li key={entry.src}>
                <Reveal delayMs={index * 60}>
                  <figure className="group relative m-0 aspect-[3/4] overflow-hidden rounded-tile bg-cream-2">
                    <ProductImage
                      src={entry.src}
                      alt={entry.alt}
                      width={480}
                      height={640}
                      className="h-full w-full"
                      imgClassName="group-hover:scale-[1.07] duration-[550ms] ease-brand motion-reduce:transform-none"
                      sizes="(max-width: 640px) 46vw, (max-width: 1060px) 30vw, 18vw"
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgba(26,16,11,0.85),transparent)] px-3 pt-[34px] pb-[11px] text-[10.5px] font-semibold tracking-[0.1em] text-cream uppercase">
                      {entry.caption}
                    </figcaption>
                  </figure>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ---------- Booking form ---------- */}
      <Section id="booking" className="pb-[clamp(64px,8vw,108px)]">
        <Container className="grid items-start gap-[clamp(34px,5vw,70px)] min-[900px]:grid-cols-[0.8fr_1.2fr]">
          <div className="min-[900px]:sticky min-[900px]:top-[calc(var(--header-h)+24px)]">
            <Eyebrow>start a kitchen request</Eyebrow>
            <h2 className="mt-[15px] mb-[18px]">
              Tell us what
              <br />
              you&rsquo;re <em className="display-em">gathering for.</em>
            </h2>
            <p className="text-sm leading-[1.8] text-muted-strong">
              We&rsquo;ll reply with availability, a menu direction, and a simple estimate. The more
              context, the better.
            </p>
          </div>

          <KitchenEnquiryForm />
        </Container>
      </Section>
    </>
  );
}
