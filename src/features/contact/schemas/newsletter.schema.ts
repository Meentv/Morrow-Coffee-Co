import { z } from "zod";

export const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address")
    .max(254, "That email address is too long")
    .email("Enter a valid email address, e.g. you@email.com"),
});

export type NewsletterValues = z.infer<typeof newsletterSchema>;
