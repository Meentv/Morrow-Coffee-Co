import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Suspense fallback for lazy route chunks. Rendered while a page's JS is in
 * flight, so the user sees the shell's structure rather than a blank flash.
 */
export function PageLoading() {
  return (
    <Container className="py-[clamp(52px,7vw,88px)]" role="status" aria-live="polite">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-5 h-12 w-[min(560px,80%)]" />
      <Skeleton className="mt-3 h-12 w-[min(360px,55%)]" />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index}>
            <Skeleton className="aspect-4/3 w-full" />
            <Skeleton className="mt-3 h-4 w-2/3" />
            <Skeleton className="mt-2 h-3 w-full" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading page…</span>
    </Container>
  );
}
