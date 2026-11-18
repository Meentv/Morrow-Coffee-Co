import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { newsletterSchema, type NewsletterValues } from "../schemas/newsletter.schema";
import { submitForm, isDemoMode } from "@/services/form.service";
import { toast } from "@/components/feedback/toast.store";
import type { SubmissionReceipt } from "@/types/api";
import { cn } from "@/lib/utils";

/**
 * Newsletter subscription.
 *
 * Original behaviour: a bare email input inside a <form> that, on submit,
 * immediately fired a success toast and reset — with no validation beyond the
 * browser's, no loading state, and no error path.
 *
 * Now: validated, with a real pending state, a success state that survives the
 * reset, and an inline error that is announced. The success copy is honest
 * about demo mode.
 */
/**
 * Two placements, one implementation.
 *
 * `panel` is the existing homepage card (dark card on cream). `footer` is the
 * variant the gooey footer needs: a pill-shaped glass field that reads as one
 * control, sitting on the espresso ground next to oversized display type.
 * Both share the same schema, service call and demo-mode honesty — only the
 * chrome differs, so a fix to validation fixes both.
 */
export function NewsletterForm({ variant = "panel" }: { variant?: "panel" | "footer" }) {
  const [receipt, setReceipt] = useState<SubmissionReceipt | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
    mode: "onSubmit",
  });

  const onSubmit = async (values: NewsletterValues) => {
    setFailure(null);

    const result = await submitForm(
      "newsletter",
      { email: values.email, source: "homepage-cta" },
      { replyTo: values.email },
    );

    if (!result.ok) {
      setFailure(result.error.message);
      toast.error("We couldn’t add you to the list. Please try again.");
      return;
    }

    setReceipt(result.data);
    reset();
    toast.success("You’re on the list — see you in your inbox ✦");
  };

  if (receipt) {
    return (
      <div className="mx-auto mt-1 max-w-[420px]" role="status">
        <p className="flex items-center justify-center gap-2 text-[14px] font-semibold text-cream">
          <span aria-hidden="true" className="text-gold">
            ✓
          </span>
          You’re on the list.
        </p>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-cream/60">
          {receipt.mode === "demo"
            ? "Demo mode — no mailing list is connected yet, so nothing was sent."
            : `Reference ${receipt.reference}`}
        </p>
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full border p-1.5 transition-colors duration-200",
            errors.email || failure
              ? "border-danger"
              : "border-cream/35 focus-within:border-cream/80 focus-within:bg-cream/6",
          )}
        >
          <label htmlFor="footer-newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="footer-newsletter-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@email.com"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby="footer-newsletter-note"
            className="min-w-0 flex-1 bg-transparent px-4 text-[16px] text-cream outline-none placeholder:text-cream/50"
            style={{ height: 44 }}
            {...register("email")}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-gold font-semibold text-espresso transition-[background-color,transform] duration-200 hover:bg-cream active:scale-[0.97] disabled:opacity-60"
            style={{ height: 44, paddingInline: 20, fontSize: 15 }}
          >
            {isSubmitting ? "Adding…" : "Join the letter"}
            {isSubmitting ? null : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            )}
          </button>
        </div>

        {/* One live region for all three states, so a screen reader hears the
            outcome once rather than three separate announcements. */}
        <p
          id="footer-newsletter-note"
          aria-live="polite"
          className={cn(
            "mt-3 min-h-[21px] pl-[18px] text-sm",
            errors.email || failure ? "font-medium text-danger-soft" : "text-cream/60",
          )}
        >
          {errors.email
            ? errors.email.message
            : failure
              ? failure
              : isDemoMode()
                ? "No flat news. Leave whenever you like. (Demo — no mailing list connected.)"
                : "No flat news. Leave whenever you like."}
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mx-auto mt-[21px] max-w-[420px]">
      <div className="flex flex-col gap-2 min-[480px]:flex-row">
        <div className="flex-1">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@email.com"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "newsletter-email-error" : undefined}
            className={cn(
              "w-full rounded-full border border-transparent px-[17px] py-[13px] text-sm text-espresso transition-shadow duration-200 outline-none placeholder:text-espresso/65",
              "bg-white/94 focus:ring-[3px] focus:ring-gold/35",
              errors.email && "bg-danger/10 ring-2 ring-danger/60",
            )}
            {...register("email")}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-gold px-6 py-[13px] text-sm font-semibold whitespace-nowrap text-espresso transition-colors hover:bg-cream disabled:opacity-60"
        >
          {isSubmitting ? "Adding…" : "Subscribe"}
        </button>
      </div>

      {errors.email ? (
        <p
          id="newsletter-email-error"
          role="alert"
          className="mt-2 text-[12px] font-semibold text-[#ffd9cf]"
        >
          {errors.email.message}
        </p>
      ) : null}

      {failure ? (
        <p role="alert" className="mt-2 text-[12px] font-semibold text-[#ffd9cf]">
          {failure}
        </p>
      ) : null}

      {isDemoMode() ? (
        <p className="mt-2.5 text-[10.5px] text-cream/60">
          Demo — no mailing list is connected yet.
        </p>
      ) : null}
    </form>
  );
}
