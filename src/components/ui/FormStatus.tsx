import type { SubmissionReceipt } from "@/types/api";

/**
 * Inline success panel for a submitted form.
 *
 * The success copy is deliberately split into two clauses:
 *   1. what the app actually did (accepted the details locally / sent them), and
 *   2. the business promise it cannot keep yet (a human will reply).
 * In demo mode clause 1 is explicit that nothing left the browser, so no one is
 * misled into thinking their order reached a kitchen.
 */
export function FormSuccess({
  title,
  receipt,
  children,
  businessPromise,
}: {
  title: string;
  receipt: SubmissionReceipt;
  children?: React.ReactNode;
  /** e.g. "our kitchen team will reply within one business day". */
  businessPromise?: string;
}) {
  const isDemo = receipt.mode === "demo";

  return (
    <div
      role="status"
      className="mt-5 rounded-xl border border-success/25 bg-success/6 px-4 py-3.5"
    >
      <p className="flex items-center gap-2 text-[13.5px] font-bold text-success">
        <span aria-hidden="true">✓</span>
        {title}
      </p>

      {children ? (
        <div className="mt-1.5 text-[13px] leading-relaxed text-espresso">{children}</div>
      ) : null}

      {businessPromise && !isDemo ? (
        <p className="mt-1.5 text-[13px] leading-relaxed text-espresso">{businessPromise}</p>
      ) : null}

      <p className="mt-2 border-t border-success/15 pt-2 text-[11.5px] leading-relaxed text-muted-strong">
        {isDemo ? (
          <>
            <strong className="font-semibold text-espresso">Demo mode.</strong> This build has no
            backend connected, so your details stayed in this browser and were not sent to Morrow.
            Reference <span className="font-mono">{receipt.reference}</span>
          </>
        ) : (
          <>
            Reference <span className="font-mono">{receipt.reference}</span> ·{" "}
            {new Date(receipt.submittedAt).toLocaleString()}
          </>
        )}
      </p>
    </div>
  );
}

/** Error banner used when the service layer fails. */
export function FormError({ message }: { message: string }) {
  return (
    <div role="alert" className="mt-5 rounded-xl border border-danger/30 bg-danger/6 px-4 py-3.5">
      <p className="text-[13.5px] font-bold text-danger">That didn’t go through.</p>
      <p className="mt-1 text-[13px] leading-relaxed text-espresso">{message}</p>
    </div>
  );
}
