import { z } from "zod";

/**
 * Kitchen / private-chef enquiry.
 *
 * Field set and option lists are migrated verbatim from the original
 * `#chefForm`. The original form had **no name attributes and no ids**, so its
 * labels were not associated with their inputs and the data could not be
 * submitted anywhere. All four fields are now named, typed and validated.
 */

export const EVENT_TYPES = [
  "Office gathering",
  "Private breakfast",
  "Birthday or celebration",
  "Launch or brand event",
  "Something else",
] as const;

export const GUEST_COUNTS = ["Under 20", "20–50", "50–100", "100+"] as const;

export type EventType = (typeof EVENT_TYPES)[number];
export type GuestCount = (typeof GUEST_COUNTS)[number];

/**
 * The original had one "Email or phone" field. It is now split deliberately:
 * `email` is required and is used as the Reply-To so a chef can answer the
 * enquiry directly, and `contact` is an optional phone number. A field that
 * accepts either cannot be used for replies without guessing, and guessing
 * produces undeliverable mail.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s().-]{7,20}$/;

export const kitchenSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name")
    .max(80, "Please keep your name under 80 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address so we can reply")
    .refine((value) => EMAIL.test(value), "Enter a valid email address"),
  contact: z
    .string()
    .trim()
    .max(40, "Please keep this under 40 characters")
    .refine((value) => value === "" || PHONE.test(value), "Enter a valid phone number"),
  eventType: z.enum(EVENT_TYPES, { message: "Choose the kind of event" }),
  guestCount: z.enum(GUEST_COUNTS, { message: "Choose a guest count" }),
  details: z
    .string()
    .trim()
    .min(1, "Tell us a little about your event")
    .min(10, "The more context the better — at least 10 characters")
    .max(2000, "Please keep this under 2000 characters"),
});

export type KitchenValues = z.infer<typeof kitchenSchema>;
