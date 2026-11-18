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
export function NewsletterForm() {
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
