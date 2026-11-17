import { createReference, sleep } from "@/lib/utils";
import { MOCK_LATENCY_MS } from "@/lib/constants";
import type { SubmissionResult } from "@/types/api";

/**
 * The single submission boundary for every form on the site.
 *
 * ── HONESTY CONTRACT ────────────────────────────────────────────────────────
 * With no VITE_API_BASE_URL configured, this returns `mode: "demo"` and the UI
 * says so in plain language ("Demo mode — nothing was sent"). It never claims
 * an order reached a kitchen, because it did not. The moment a real endpoint is
 * supplied, the same call goes over the network and returns `mode: "live"`.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Adding a real backend later requires no component changes: implement the
 * endpoint, set the env var, done.
 */

export type FormKind = "order" | "kitchen" | "contact" | "newsletter";

export type SubmitOptions = {
  /** Abort a request when the component unmounts. */
  signal?: AbortSignal;
};

const ENDPOINTS: Record<FormKind, string> = {
  order: "/orders",
  kitchen: "/kitchen-enquiries",
  contact: "/contact",
  newsletter: "/newsletter",
};

function apiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return raw ? raw.replace(/\/$/, "") : "";
}

function referenceFor(kind: FormKind): string {
  const prefix = { order: "MOR", kitchen: "KIT", contact: "ENQ", newsletter: "NEW" }[kind];
  return createReference(prefix);
}

async function mockSubmit<T extends object>(
  kind: FormKind,
  payload: T,
  options: SubmitOptions,
): Promise<SubmissionResult> {
  /**
   * Simulate believable latency in the browser so loading states are real.
   * Under Vitest the delay collapses to a single macrotask, so the test suite
   * exercises the async code path without waiting a second per submission.
   */
  const isTest = import.meta.env.MODE === "test";
  const jitter = isTest
    ? 0
    : MOCK_LATENCY_MS.min + Math.random() * (MOCK_LATENCY_MS.max - MOCK_LATENCY_MS.min);
  await sleep(jitter).catch(() => undefined);

  if (options.signal?.aborted) {
    return { ok: false, error: { code: "network", message: "Submission cancelled." } };
  }

  // Log once so a developer can verify exactly what *would* have been sent.
  if (import.meta.env.DEV) {
    console.info(`[form.service] demo submission → ${ENDPOINTS[kind]}`, payload);
  }

  return {
    ok: true,
    data: {
      reference: referenceFor(kind),
      submittedAt: new Date().toISOString(),
      mode: "demo",
    },
  };
}

async function liveSubmit<T extends object>(
  kind: FormKind,
  payload: T,
  baseUrl: string,
  options: SubmitOptions,
): Promise<SubmissionResult> {
  try {
    const response = await fetch(`${baseUrl}${ENDPOINTS[kind]}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: options.signal,
    });

    if (!response.ok) {
      return {
        ok: false,
        error: {
          code: response.status >= 500 ? "server" : "validation",
          message:
            response.status >= 500
              ? "The kitchen server had a problem. Please try again, or call us."
              : "We couldn’t accept that submission. Please check your details and try again.",
        },
      };
    }

    const body = (await response.json().catch(() => ({}))) as { reference?: string };

    return {
      ok: true,
      data: {
        reference: body.reference ?? referenceFor(kind),
        submittedAt: new Date().toISOString(),
        mode: "live",
      },
    };
  } catch (error) {
    const aborted = error instanceof DOMException && error.name === "AbortError";
    return {
      ok: false,
      error: {
        code: "network",
        message: aborted
          ? "Submission cancelled."
          : "We couldn’t reach the kitchen. Check your connection and try again.",
      },
    };
  }
}

/** Submit any of the site's forms. Never throws — always returns a result. */
export async function submitForm<T extends object>(
  kind: FormKind,
  payload: T,
  options: SubmitOptions = {},
): Promise<SubmissionResult> {
  const baseUrl = apiBaseUrl();

  if (!baseUrl) {
    return mockSubmit(kind, payload, options);
  }

  return liveSubmit(kind, payload, baseUrl, options);
}

/** Whether the app is currently in demo mode — used to word the UI honestly. */
export function isDemoMode(): boolean {
  return !apiBaseUrl();
}
