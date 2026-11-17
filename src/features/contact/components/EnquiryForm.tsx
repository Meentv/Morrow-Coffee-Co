import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { enquirySchema, type EnquiryValues, ENQUIRY_TOPICS } from "../schemas/enquiry.schema";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { FormError, FormSuccess } from "@/components/ui/FormStatus";
import { submitForm } from "@/services/form.service";
import { toast } from "@/components/feedback/toast.store";
import type { SubmissionReceipt } from "@/types/api";

/** Contact / general enquiry — all four original fields preserved. */
export function EnquiryForm() {
  const [receipt, setReceipt] = useState<SubmissionReceipt | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: { name: "", email: "", topic: ENQUIRY_TOPICS[0], message: "" },
  });

  const onSubmit = async (values: EnquiryValues) => {
    setFailure(null);
    const result = await submitForm("contact", values);

    if (!result.ok) {
      setFailure(result.error.message);
      toast.error("We couldn’t send your enquiry. Please try again.");
      return;
    }

    setReceipt(result.data);
    reset();
    toast.success("Enquiry sent");
    window.requestAnimationFrame(() => successRef.current?.focus());
  };

  return (
    <div
      ref={successRef}
      tabIndex={-1}
      className="rounded-card border border-line bg-white p-[clamp(26px,4vw,40px)] shadow-card-soft"
    >
      {receipt ? (
        <>
          <span className="text-[11px] font-semibold tracking-[0.19em] text-muted-strong uppercase">
            send an enquiry
          </span>
          <h3 className="mt-3 mb-1 text-[28px]">Enquiry received.</h3>
          <FormSuccess
            title="Your enquiry has been captured."
            receipt={receipt}
            businessPromise="A human will get back to you soon."
          >
            <p>Thanks for reaching out — we read every message.</p>
          </FormSuccess>
          <button
            type="button"
            onClick={() => setReceipt(null)}
            className="mt-6 border-b border-line pb-0.5 text-sm font-semibold text-espresso transition-colors hover:border-gold-ink hover:text-gold-ink"
          >
            Send another enquiry
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <span className="text-[11px] font-semibold tracking-[0.19em] text-muted-strong uppercase">
            send an enquiry
          </span>
          <h3 className="mt-3 mb-1 text-[28px]">What can we help with?</h3>
          <p className="mb-5 text-[12.5px] text-muted-strong">
            Fields marked <span aria-hidden="true">*</span> are required.
          </p>

          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
            <TextField
              label="Name"
              placeholder="Your name"
              autoComplete="name"
              required
              error={errors.name?.message}
              {...register("name")}
            />
            <TextField
              label="Email"
              placeholder="you@email.com"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              error={errors.email?.message}
              {...register("email")}
            />
            <SelectField
              label="Topic"
              options={ENQUIRY_TOPICS}
              fullWidth
              error={errors.topic?.message}
              {...register("topic")}
            />
            <TextAreaField
              label="Message"
              placeholder="Tell us what's on your mind..."
              fullWidth
              required
              error={errors.message?.message}
              {...register("message")}
            />
          </div>

          {failure ? <FormError message={failure} /> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-espresso px-[23px] py-[13px] text-sm font-semibold text-cream transition-colors hover:bg-gold hover:text-espresso disabled:cursor-wait disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <span
                  aria-hidden="true"
                  className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
                />
                Sending…
              </>
            ) : (
              <>
                Send enquiry <span aria-hidden="true">↗</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
