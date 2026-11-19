import emailjs from "@emailjs/browser";

import { MOCK_LATENCY_MS } from "@/lib/constants";
import { createReference, sleep } from "@/lib/utils";
import type { SubmissionResult } from "@/types/api";

/**
 * The single submission boundary for every form on the site.
 *
 * ── HOW MAIL ACTUALLY GETS SENT ─────────────────────────────────────────────
 * EmailJS sends the message from the browser to your email account. There is no
 * server for us to run, which is why it fits a static deploy (Vercel/Netlify).
 *
 * It needs three public identifiers from your EmailJS dashboard:
 *
 *   VITE_EMAILJS_SERVICE_ID   e.g. "service_abc1234"
 *   VITE_EMAILJS_TEMPLATE_ID  e.g. "template_xyz987"
 *   VITE_EMAILJS_PUBLIC_KEY   e.g. "dQw4w9WgXcQ…"
 *
 * These are *publishable* keys by design — EmailJS expects them in the client.
 * They are not secrets. Do not put a private key here; there is no private key
 * in this flow at all.
 *
 * ── HONESTY CONTRACT (unchanged, and the point of this file) ────────────────
 * If those three variables are missing, this returns `mode: "demo"` and the UI
 * says so in plain language. It never claims an order reached a kitchen and it
 * never claims an email was delivered, because it was not. The moment the keys
 * are present, the same call really sends and returns `mode: "live"`.
 *
 * Every submission is tagged with a `form_type` field so one EmailJS template
 * can serve all the site's forms — see docs/EMAIL_SETUP.md for the exact
 * template body to paste in the dashboard.
 * ────────────────────────────────────────────────────────────────────────────
 */

export type FormKind = "order" | "kitchen" | "contact" | "newsletter" | "bean-order";

/**
 * Fallback notification address when VITE_CONTACT_EMAIL is not set.
 *
 * This is the address the business asked submissions to go to. It is a default,
 * not a secret: it appears in the footer as a mailto: link anyway. Override it
 * with VITE_CONTACT_EMAIL without touching code.
 */
export const DEFAULT_TO_EMAIL = "alameenahmed588@gmail.com";

export type SubmitOptions = {
  /** Abort a request when the component unmounts (demo mode only). */
  signal?: AbortSignal;
  /**
   * The visitor's reply address. EmailJS needs it to populate the template's
   * Reply-To, so a reply actually reaches the customer rather than the site.
   */
  replyTo?: string;
  /** Their name, for the template's greeting. */
  replyName?: string;
};

type EmailJsConfig = {
  serviceId: string;
  templateId: string;
  publicKey: string;
  /**
   * Where the notification lands.
   *
   * EmailJS's own template has a "To email" setting in the dashboard, so this is
   * not strictly required — but it is passed as `to_email` on every submission
   * so the template can interpolate `{{to_email}}` and the address lives in one
   * reviewable place in the repo rather than only inside a dashboard nobody can
   * diff. If the dashboard lists a different address, the dashboard wins; see
   * docs/EMAIL_SETUP.md.
   */
  toEmail: string;
};

function readConfig(): EmailJsConfig | null {
  const env = import.meta.env;
  const serviceId = (env.VITE_EMAILJS_SERVICE_ID as string | undefined)?.trim();
  const templateId = (env.VITE_EMAILJS_TEMPLATE_ID as string | undefined)?.trim();
  const publicKey = (env.VITE_EMAILJS_PUBLIC_KEY as string | undefined)?.trim();

  if (!serviceId || !templateId || !publicKey) return null;

  const toEmail = (env.VITE_CONTACT_EMAIL as string | undefined)?.trim();
  return {
    serviceId,
    templateId,
    publicKey,
    toEmail: toEmail || DEFAULT_TO_EMAIL,
  };
}

const REFERENCE_PREFIX: Record<FormKind, string> = {
  order: "MOR",
  kitchen: "KIT",
  contact: "ENQ",
  newsletter: "NEW",
  "bean-order": "BEA",
};

/** Human label used in the email subject line. */
export const FORM_LABELS: Record<FormKind, string> = {
  order: "Café order",
  kitchen: "Kitchen enquiry",
  contact: "Website enquiry",
  newsletter: "Newsletter signup",
  "bean-order": "Bean order",
};

/**
 * Flatten the payload into the flat string map EmailJS templates interpolate.
 * Template variables cannot reach into nested objects, so nested values are
 * serialised readably instead of arriving as `[object Object]`.
 */
function toTemplateParams(
  kind: FormKind,
  payload: Record<string, unknown>,
  reference: string,
  options: SubmitOptions,
  toEmail: string,
): Record<string, string> {
  const params: Record<string, string> = {
    form_type: kind,
    form_label: FORM_LABELS[kind],
    reference,
    submitted_at: new Date().toISOString(),
    page_url: typeof window !== "undefined" ? window.location.href : "",
    reply_to: options.replyTo ?? "",
    reply_name: options.replyName ?? "",
    /** Available to the template as {{to_email}}. */
    to_email: toEmail,
    /** Convenience: a prefilled subject the template can use directly. */
    subject: `${FORM_LABELS[kind]}${options.replyName ? ` — ${options.replyName}` : ""} (${reference})`,
  };

  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null || value === "") continue;
    params[key] = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  }

  // A readable multi-line body, so the email is useful even with a bare
  // template that only prints {{message}}.
  params["message"] = Object.entries(payload)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => {
      const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
      return `${key}: ${text}`;
    })
    .join("\n");

  return params;
}

async function demoSubmit(
  kind: FormKind,
  payload: Record<string, unknown>,
  options: SubmitOptions,
): Promise<SubmissionResult> {
  /**
   * Simulate believable latency so loading states are real. Under Vitest the
   * delay collapses to a single macrotask, so tests exercise the async path
   * without waiting a second per submission.
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
    console.info(`[form.service] demo submission (no EmailJS keys) → ${kind}`, payload);
  }

  return {
    ok: true,
    data: {
      reference: createReference(REFERENCE_PREFIX[kind]),
      submittedAt: new Date().toISOString(),
      mode: "demo",
    },
  };
}

async function liveSubmit(
  kind: FormKind,
  payload: Record<string, unknown>,
  config: EmailJsConfig,
  options: SubmitOptions,
): Promise<SubmissionResult> {
  const reference = createReference(REFERENCE_PREFIX[kind]);

  try {
    await emailjs.send(
      config.serviceId,
      config.templateId,
      toTemplateParams(kind, payload, reference, options, config.toEmail),
      { publicKey: config.publicKey },
    );

    return {
      ok: true,
      data: { reference, submittedAt: new Date().toISOString(), mode: "live" },
    };
  } catch (error) {
    // EmailJS rejects with { status, text } for a non-2xx send.
    const status = (error as { status?: number }).status;
    const text = (error as { text?: string }).text;

    if (import.meta.env.DEV) {
      console.error(`[form.service] EmailJS rejected ${kind}`, { status, text, error });
    }

    if (status === 429) {
      return {
        ok: false,
        error: {
          code: "server",
          message: "Too many messages just now. Please wait a moment, then try again.",
        },
      };
    }

    if (status === 400 || status === 412 || status === 422) {
      // Misconfigured template or service — a deployment problem, not the
      // visitor's fault, so the copy does not blame them.
      return {
        ok: false,
        error: {
          code: "unconfigured",
          message:
            "Our message service isn’t accepting this yet. Please call or email us directly.",
        },
      };
    }

    return {
      ok: false,
      error: {
        code: "network",
        message: "We couldn’t send that just now. Check your connection and try again.",
      },
    };
  }
}

/**
 * Submit any of the site's forms. Never throws — always returns a result.
 *
 * `payload` should already be validated by a Zod schema; this layer only
 * transports it.
 */
export async function submitForm<T extends object>(
  kind: FormKind,
  payload: T,
  options: SubmitOptions = {},
): Promise<SubmissionResult> {
  const config = readConfig();
  const record = payload as Record<string, unknown>;

  if (!config) {
    return demoSubmit(kind, record, options);
  }

  return liveSubmit(kind, record, config, options);
}

/**
 * Whether the app is currently in demo mode — used to word the UI honestly.
 * True when the EmailJS identifiers are absent.
 */
export function isDemoMode(): boolean {
  return readConfig() === null;
}
