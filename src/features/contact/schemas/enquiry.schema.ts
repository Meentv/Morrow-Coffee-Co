import { z } from "zod";

/** Topic list preserved verbatim from the original enquiry <select>. */
export const ENQUIRY_TOPICS = [
  "General question",
  "Private event",
  "Wholesale coffee",
  "Feedback",
  "Partnership",
] as const;

export type EnquiryTopic = (typeof ENQUIRY_TOPICS)[number];

export const enquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name")
    .max(80, "Please keep your name under 80 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address")
    .email("Enter a valid email address, e.g. you@email.com"),
  topic: z.enum(ENQUIRY_TOPICS, { message: "Choose a topic" }),
  message: z
    .string()
    .trim()
    .min(1, "Tell us what you need")
    .min(10, "A little more detail helps us help you (10+ characters)")
    .max(2000, "Please keep your message under 2000 characters"),
});

export type EnquiryValues = z.infer<typeof enquirySchema>;
