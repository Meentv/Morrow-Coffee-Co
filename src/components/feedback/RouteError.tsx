import { isRouteErrorResponse, useRouteError, Link } from "react-router-dom";

import { Container } from "@/components/ui/Container";

/**
 * Route-level error boundary. A failed lazy chunk (common on flaky mobile
 * networks after a redeploy) shows a recoverable message with a retry, rather
 * than a blank page — which is what the original did on any JS error.
 */
export function RouteError() {
  const error = useRouteError();

  const isChunkError =
    error instanceof Error && /dynamically imported module|Loading chunk/i.test(error.message);

  const title = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText}`
    : isChunkError
      ? "That page didn’t finish loading."
      : "Something went wrong.";

  return (
    <Container className="py-24 text-center">
      <p aria-hidden="true" className="text-2xl text-gold">
        ✦
      </p>
      <h1 className="mt-4 text-[clamp(2rem,5vw,3rem)]">{title}</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-strong">
        {isChunkError
          ? "Your connection dropped while loading this page. Reloading usually fixes it."
          : "We hit an unexpected problem. Reload the page, or head back to the homepage."}
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full bg-espresso px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-gold hover:text-espresso"
        >
          Reload the page
        </button>
        <Link
          to="/"
          className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-espresso transition-colors hover:border-gold"
        >
          Back to home
        </Link>
      </div>
    </Container>
  );
}
