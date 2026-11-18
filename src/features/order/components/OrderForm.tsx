import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  orderSchema,
  type OrderValues,
  ORDER_TYPES,
  ORDER_TIMINGS,
  DELIVERY,
} from "../schemas/order.schema";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { FormError, FormSuccess } from "@/components/ui/FormStatus";
import { submitForm } from "@/services/form.service";
import { toast } from "@/components/feedback/toast.store";
import { useCart } from "@/features/cart/hooks/useCart";
import { formatCents } from "@/lib/currency";
import type { SubmissionReceipt } from "@/types/api";

type OrderReceipt = SubmissionReceipt & { totalCents: number; itemCount: number };

/**
 * Checkout form.
 *
 * Business rules enforced here (none of which the original enforced):
 *  1. Checkout is blocked when the basket is empty — the parent page renders the
 *     empty state, and this form re-checks before submitting.
 *  2. A delivery address is required iff "Local delivery" is selected.
 *  3. The submitted payload carries every line: product id, name, quantity,
 *     unit price in cents, line total in cents, plus the basket total.
 *  4. Double submission is prevented by `isSubmitting`.
 *  5. Failure is surfaced inline and via toast; the basket is only cleared
 *     after a *successful* submission.
 */
export function OrderForm({ onSuccess }: { onSuccess?: (receipt: OrderReceipt) => void }) {
  const { lines, totals, clear } = useCart();
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OrderValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      firstName: "",
      email: "",
      phone: "",
      orderType: ORDER_TYPES[0],
      timing: ORDER_TIMINGS[0],
      address: "",
      notes: "",
    },
    mode: "onTouched",
  });

  const orderType = watch("orderType");
  const isDelivery = orderType === DELIVERY;

  const onSubmit = async (values: OrderValues) => {
    setFailure(null);

    if (lines.length === 0) {
      setFailure("Your basket is empty. Add something from the menu before placing a request.");
      return;
    }

    const payload = {
      customer: {
        firstName: values.firstName,
        phone: values.phone,
      },
      fulfilment: {
        orderType: values.orderType,
        timing: values.timing,
        address: isDelivery ? values.address : null,
      },
      notes: values.notes || null,
      items: lines.map((line) => ({
        productId: line.id,
        name: line.name,
        quantity: line.quantity,
        unitPriceCents: line.priceCents,
        lineTotalCents: line.priceCents * line.quantity,
      })),
      totals: {
        itemCount: totals.itemCount,
        subtotalCents: totals.subtotalCents,
        totalCents: totals.totalCents,
        currency: "USD" as const,
      },
      placedAt: new Date().toISOString(),
    };

    const result = await submitForm("order", payload, {
      replyTo: values.email,
      replyName: values.firstName,
    });

    if (!result.ok) {
      setFailure(result.error.message);
      toast.error("Your order request didn’t go through.");
      return;
    }

    const full: OrderReceipt = {
      ...result.data,
      totalCents: totals.totalCents,
      itemCount: totals.itemCount,
    };

    setReceipt(full);
    // Only clear the basket after the service confirms.
    clear();
    toast.success("Order request received");
    onSuccess?.(full);
    window.requestAnimationFrame(() => successRef.current?.focus());
  };

  if (receipt) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        className="rounded-card border border-line bg-white p-[clamp(26px,4vw,40px)] shadow-card-soft"
      >
        <h2 className="text-[28px] sm:text-[32px]">Your order request is in.</h2>
        <FormSuccess
          title={`${receipt.itemCount} item${receipt.itemCount === 1 ? "" : "s"} · ${formatCents(receipt.totalCents)}`}
          receipt={receipt}
          businessPromise="We’ll confirm the final timing by phone or email."
        >
          <p>
            Here’s what we captured. The basket has been emptied so you can start a fresh order.
          </p>
        </FormSuccess>
        <button
          type="button"
          onClick={() => setReceipt(null)}
          className="mt-6 border-b border-line pb-0.5 text-sm font-semibold text-espresso transition-colors hover:border-gold-ink hover:text-gold-ink"
        >
          Start another order
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-card border border-line bg-white p-[clamp(26px,4vw,40px)] shadow-card-soft"
      aria-describedby="order-form-summary"
    >
      <span className="text-[11px] font-semibold tracking-[0.19em] text-muted-strong uppercase">
        order details
      </span>
      <h2 className="mt-3 mb-1 text-[clamp(1.75rem,4vw,2.25rem)]">
        Where should we
        <br />
        send the good stuff?
      </h2>
      <p id="order-form-summary" className="mb-5 text-[12.5px] text-muted-strong">
        Fields marked <span aria-hidden="true">*</span> are required.
      </p>

      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
        <TextField
          label="First name"
          placeholder="Your name"
          autoComplete="given-name"
          required
          error={errors.firstName?.message}
          {...register("firstName")}
        />
        <TextField
          label="Email"
          placeholder="you@example.com"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          error={errors.email?.message}
          {...register("email")}
        />
        <TextField
          label="Phone"
          placeholder="+234 ..."
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          error={errors.phone?.message}
          {...register("phone")}
        />
        <SelectField
          label="Order type"
          options={ORDER_TYPES}
          error={errors.orderType?.message}
          {...register("orderType")}
        />
        <SelectField
          label="When"
          options={ORDER_TIMINGS}
          error={errors.timing?.message}
          {...register("timing")}
        />

        <TextField
          label={isDelivery ? "Delivery address" : "Address or pickup note"}
          placeholder={
            isDelivery ? "Street, area, and a landmark helps" : "Where should we meet you?"
          }
          autoComplete={isDelivery ? "street-address" : "off"}
          fullWidth
          required={isDelivery}
          hint={isDelivery ? "We only deliver locally — tell us where to find you." : undefined}
          error={errors.address?.message}
          {...register("address")}
        />

        <TextAreaField
          label="Anything else?"
          placeholder="Milk preference, allergies, a note for the kitchen..."
          fullWidth
          error={errors.notes?.message}
          {...register("notes")}
        />
      </div>

      {failure ? <FormError message={failure} /> : null}

      {lines.length === 0 ? (
        <p role="alert" className="mt-4 text-[12.5px] font-semibold text-danger">
          Your basket is empty — add something from the menu before placing a request.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || lines.length === 0}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-espresso px-[23px] py-[13px] text-sm font-semibold text-cream transition-colors hover:bg-gold hover:text-espresso disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <span
              aria-hidden="true"
              className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
            Placing request…
          </>
        ) : (
          <>
            Place request <span aria-hidden="true">↗</span>
          </>
        )}
      </button>

      <p className="sr-only" aria-live="polite">
        {isSubmitting ? "Placing your order request" : ""}
      </p>
    </form>
  );
}
