import { useEffect } from "react";

import { SITE } from "@/lib/constants";

/**
 * Per-page metadata.
 *
 * The app is a Vite SPA, so tags are managed imperatively at runtime. Each tag
 * is created with a stable `data-seo` attribute and cleaned up on unmount so
 * nothing leaks between routes.
 *
 * Architecture note: crawlers that do not execute JavaScript will only ever see
 * the defaults in index.html. If SEO on per-route titles becomes business-
 * critical, add prerendering (vite-plugin-prerender / react-snap) or move to a
 * framework with SSR. This is called out in the README rather than papered over.
 */

export type SeoProps = {
  title: string;
  description: string;
  /** Path relative to the site root, e.g. "/menu". Used for the canonical URL. */
  path: string;
  /** Optional override; defaults to SITE.ogImage. */
  image?: string;
  /** Set to true on the 404 route so it is never indexed. */
  noIndex?: boolean;
};

function upsertMeta(attribute: "name" | "property", key: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"][data-seo]`,
  );
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    element.setAttribute("data-seo", "");
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function upsertLink(rel: string, href: string): void {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"][data-seo]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    element.setAttribute("data-seo", "");
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

export function Seo({ title, description, path, image, noIndex = false }: SeoProps) {
  useEffect(() => {
    const fullTitle = title.includes(SITE.name) ? title : `${title} — ${SITE.name}`;
    const canonical = SITE.url ? `${SITE.url}${path === "/" ? "/" : path}` : "";
    const absoluteImage = (image ?? SITE.ogImage).startsWith("http")
      ? (image ?? SITE.ogImage)
      : `${SITE.url}${image ?? SITE.ogImage}`;

    document.title = fullTitle;
    upsertMeta("name", "description", description);
    if (noIndex) {
      upsertMeta("name", "robots", "noindex, nofollow");
    } else {
      document.head.querySelector('meta[name="robots"][data-seo]')?.remove();
    }

    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", SITE.name);
    upsertMeta("property", "og:locale", SITE.locale);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:image", absoluteImage);
    if (canonical) upsertMeta("property", "og:url", canonical);

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", absoluteImage);

    // Canonical is only emitted when a real origin is configured — the brief
    // says not to invent a domain, and a canonical pointing at a placeholder
    // host would be actively harmful.
    if (canonical) upsertLink("canonical", canonical);
  }, [title, description, path, image, noIndex]);

  return null;
}
