/**
 * Service-layer result types.
 *
 * `mode` is the important field: every response from the mock services is
 * explicitly tagged `demo`, so the UI can be honest that nothing was sent to a
 * real business. When a real endpoint is wired up (VITE_API_BASE_URL), the
 * service returns `mode: "live"` instead and the copy switches automatically.
 */
export type SubmissionMode = "demo" | "live";

export type SubmissionReceipt = {
  /** Human-readable reference, e.g. "MOR-7F3A1C09". */
  reference: string;
  submittedAt: string;
  mode: SubmissionMode;
};

export type SubmissionFailure = {
  /** `unconfigured` = live mode requested but no endpoint set. */
  code: "network" | "validation" | "unconfigured" | "server";
  message: string;
};

export type SubmissionResult<T = SubmissionReceipt> =
  | { ok: true; data: T }
  | { ok: false; error: SubmissionFailure };
