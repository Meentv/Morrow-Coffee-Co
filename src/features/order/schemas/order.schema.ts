import { z } from "zod";

/**
 * Order / checkout form.
 *
 * Preserves every original field ("First name", "Phone", "Order type", "When",
 * "Address or pickup note", "Anything else?"), and adds the validation the
 * original was missing entirely — it had no names, no ids, no required flags
 * on phone, and happily "submitted" an empty order.
 */

export const ORDER_TYPES = ["Pickup from Morrow", "Local delivery"] as const;
export const ORDER_TIMINGS = [
  "As soon as possible",
  "In 30 minutes",
  "Schedule for later",
] as const;

export type OrderType = (typeof ORDER_TYPES)[number];
export type OrderTiming = (typeof ORDER_TIMINGS)[number];

export const DELIVERY: OrderType = "Local delivery";

export const orderSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "Enter your first name")
      .max(60, "Please keep your name under 60 characters"),
    phone: z
      .string()
      .trim()
      .min(1, "Enter a phone number so we can confirm your order")
      .regex(/^\+?[\d\s().-]{7,20}$/, "Enter a valid phone number"),
    orderType: z.enum(ORDER_TYPES, { message: "Choose pickup or delivery" }),
    timing: z.enum(ORDER_TIMINGS, { message: "Choose when you would like it" }),
    /** Required only for delivery — enforced below via superRefine. */
    address: z.string().trim().max(240, "Please keep the address under 240 characters"),
    notes: z.string().trim().max(600, "Please keep notes under 600 characters"),
  })
  .superRefine((values, ctx) => {
    if (values.orderType === DELIVERY && values.address.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["address"],
        message: "We need a delivery address for local delivery",
      });
    }
  });

export type OrderValues = z.infer<typeof orderSchema>;
