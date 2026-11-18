import { Seo } from "@/components/seo/Seo";
import { Container, Section } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHero } from "@/components/layout/PageHero";
import { SectionHead } from "@/components/layout/SectionHead";
import { FaqAccordion } from "@/features/contact/components/FaqAccordion";
import { EnquiryForm } from "@/features/contact/components/EnquiryForm";
import { FAQ_ENTRIES } from "@/data/faq";
import { CONTACT } from "@/lib/constants";

const DETAILS = [
  { label: "Address", value: CONTACT.address },
  { label: "Hours", value: CONTACT.hours },
  { label: "Phone", value: CONTACT.phone, href: CONTACT.phoneHref },
  { label: "Email", value: CONTACT.email, href: CONTACT.emailHref },
] as const;

export default function ContactPage() {
  return (
    <>
      <Seo
        title="Contact"
        description="Contact Morrow Coffee Co. — visit, enquire, book private events, or ask about wholesale."
        path="/contact"
      />

      <PageHero
        eyebrow="come say hello"
        title={
          <>
            There’s always
            <br />
            room for <em className="display-em">one more.</em>
          </>
        }
        lede="Questions about a booking, a big order, or where to find us? We’re listening."
      />

      <Section>
        <Container className="grid items-start gap-[clamp(34px,5vw,70px)] min-[900px]:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Eyebrow>find us here</Eyebrow>
            <h2 className="mt-[15px] mb-5">
              Come for
              <br />
              the <em className="display-em">coffee.</em>
            </h2>

            <dl className="mb-[18px] flex flex-col gap-3">
              {DETAILS.map((detail) => (
                <div
                  key={detail.label}
                  className="rounded-tile border border-line bg-white px-4 py-3.5"
                >
                  <dt className="mb-0.5 text-[12.5px] text-muted-strong">{detail.label}</dt>
                  <dd className="text-[15px] font-bold tracking-[-0.02em] text-espresso">
                    {"href" in detail && detail.href ? (
                      <a
                        href={detail.href}
                        className="underline decoration-transparent underline-offset-4 transition-colors hover:text-gold-ink hover:decoration-current"
                      >
                        {detail.value}
                      </a>
                    ) : (
                      detail.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="text-[13px] leading-[1.8] text-muted-strong">
              We welcome walk-ins, quiet laptop mornings, and long tables. {CONTACT.groupNote}
            </p>
          </div>

          <EnquiryForm />
        </Container>
      </Section>

      <Section tone="cream">
        <Container>
          <SectionHead
            eyebrow="answers, for now"
            title={
              <>
                Frequently
                <br />
                <em className="display-em">asked.</em>
              </>
            }
          >
            <p>Still curious? Send the enquiry — a human will reply.</p>
          </SectionHead>

          <FaqAccordion entries={FAQ_ENTRIES} />
        </Container>
      </Section>
    </>
  );
}
