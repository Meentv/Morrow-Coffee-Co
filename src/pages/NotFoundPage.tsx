import { Seo } from "@/components/seo/Seo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

/** The original site had no 404 — a bad URL simply showed the host's error. */
export default function NotFoundPage() {
  return (
    <>
      <Seo title="Page not found" description="That page isn't on the menu." path="/404" noIndex />
      <Container className="py-[clamp(64px,10vw,140px)] text-center">
        <Eyebrow withDot>404</Eyebrow>
        <h1 className="mx-auto mt-5 max-w-2xl text-[clamp(2.5rem,6vw,4.5rem)]">
          That page isn’t
          <br />
          on the <em className="display-em">menu.</em>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-strong">
          The link may have changed, or it never existed. The coffee is still here.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/" variant="primary" trailing="→">
            Back to home
          </Button>
          <Button to="/menu" variant="soft">
            See the menu
          </Button>
        </div>
      </Container>
    </>
  );
}
