/**
 * Image path helpers.
 *
 * Every photo in `public/images/` ships as a `.jpg` plus a `.webp` derivative of
 * the same crop (see docs/IMAGE_AUDIT.md), so the JPEG path is the canonical one
 * and the WebP is always derived. Callers only ever name the `.jpg`.
 */

/** `/images/latte.jpg` → `/images/latte.webp`. Other extensions pass through. */
export function webpVariant(src: string): string | undefined {
  return src.endsWith(".jpg") ? `${src.slice(0, -4)}.webp` : undefined;
}
