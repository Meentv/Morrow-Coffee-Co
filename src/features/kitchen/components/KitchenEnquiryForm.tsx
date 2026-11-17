import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  kitchenSchema,
  type KitchenValues,
  EVENT_TYPES,
  GUEST_COUNTS,
} from "../schemas/kitchen.schema";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { FormError, FormSuccess } from "@/components/ui/FormStatus";
import { submitForm } from "@/services/form.service";
import { toast } from "@/components/feedback/toast.store";
import type { SubmissionReceipt } from "@/types/api";

/**
 * Private-chef / kitchen enquiry.
 *
 * Preserves all five original fields. Fixes: fields are named and labelled,
 * validation exists, there is a pending state, duplicate submission is blocked
 * by `isSubmitting`, and success is announced in-page (role=status) as well as
 * via toast, then focus moves to the confirmation so keyboard users land on it.
 */
export function KitchenEnquiryForm() {
  const [receipt, setReceipt] = useState<SubmissionReceipt | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<KitchenValues>({
    resolver: zodResolver(kitchenSchema),
    defaultValues: {
      name: "",
      contact: "",
      eventType: EVENT_TYPES[0],
      guestCount: GUEST_COUNTS[0],
      details: "",
    },
  });

  const onSubmit = async (values: KitchenValues) => {
    setFailure(null);
    const result = await submitForm("kitchen", values);

    if (!result.ok) {
      setFailure(result.error.message);
      toast.error("We couldn’t send that request. Please try again.");
      return;
    }

    setReceipt(result.data);
    reset();
    toast.success("Kitchen request received");
    window.requestAnimationFrame(() => successRef.current?.focus());
  };

  return (
    <div
      className="rounded-card border border-line bg-white p-[clamp(26px,4vw,40px)] shadow-card-soft"
      ref={successRef}
      tabIndex={-1}
    >
      {receipt ? (
        <>
          <h3 className="text-[26px]">Request received.</h3>
          <FormSuccess
            title="Your kitchen request has been captured."
            receipt={receipt}
            businessPromise="Our kitchen team will reply within one business day."
          >
            <p>We’ll come back with availability, a menu direction, and a simple estimate.</p>
          </FormSuccess>
          <button
            type="button"
            onClick={() => setReceipt(null)}
            className="mt-6 border-b border-line pb-0.5 text-sm font-semibold text-espresso transition-colors hover:border-gold-ink hover:text-gold-ink"
          >
            Send another request
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <h3 className="mb-1 text-[22px]">Kitchen request</h3>
          <p className="mb-5 text-[12.5px] text-muted-strong">
            Fields marked <span aria-hidden="true">*</span> are required.
          </p>

          <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
            <TextField
              label="Your name"
              placeholder="Name"
              autoComplete="name"
              required
              error={errors.name?.message}
              {...register("name")}
            />
            <TextField
              label="Email or phone"
              placeholder="How should we reach you?"
              autoComplete="email"
              required
              error={errors.contact?.message}
              {...register("contact")}
            />
            <SelectField
              label="Event type"
              options={EVENT_TYPES}
              error={errors.eventType?.message}
              {...register("eventType")}
            />
            <SelectField
              label="Guest count"
              options={GUEST_COUNTS}
              error={errors.guestCount?.message}
              {...register("guestCount")}
            />
            <TextAreaField
              label="Tell us about it"
              placeholder="Date, place, mood, menu ideas, anything useful..."
              fullWidth
              required
              error={errors.details?.message}
              {...register("details")}
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
                <Spinner /> Sending…
              </>
            ) : (
              <>
                Send kitchen request <span aria-hidden="true">↗</span>
              </>
            )}
          </button>

          <p className="sr-only" aria-live="polite">
            {isSubmitting ? "Sending your kitchen request" : ""}
          </p>
        </form>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}
