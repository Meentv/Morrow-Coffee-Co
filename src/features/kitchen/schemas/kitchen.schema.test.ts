import { describe, expect, it } from "vitest";

import { kitchenSchema, EVENT_TYPES, GUEST_COUNTS } from "./kitchen.schema";
import { enquirySchema, ENQUIRY_TOPICS } from "@/features/contact/schemas/enquiry.schema";
import { newsletterSchema } from "@/features/contact/schemas/newsletter.schema";

describe("kitchen enquiry schema", () => {
  const base = {
    name: "Ada",
    email: "ada@example.com",
    contact: "",
    eventType: EVENT_TYPES[0],
    guestCount: GUEST_COUNTS[1],
    details: "A launch party for 40 people on the 12th, evening, coffee bar plus small plates.",
  };

  it("accepts a valid email with no phone number", () => {
    expect(kitchenSchema.safeParse(base).success).toBe(true);
  });

  it("accepts an optional phone number alongside the email", () => {
    expect(kitchenSchema.safeParse({ ...base, contact: "+234 801 234 5678" }).success).toBe(true);
  });

  it("requires an email address, because it is used as the reply-to", () => {
    const result = kitchenSchema.safeParse({ ...base, email: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Enter your email address so we can reply");
    }
  });

  it("rejects a malformed email", () => {
    expect(kitchenSchema.safeParse({ ...base, email: "ada@" }).success).toBe(false);
  });

  it("rejects a phone number that is not a phone number", () => {
    const result = kitchenSchema.safeParse({ ...base, contact: "message me" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Enter a valid phone number");
    }
  });

  it("requires a meaningful description", () => {
    const result = kitchenSchema.safeParse({ ...base, details: "hi" });
    expect(result.success).toBe(false);
  });

  it("rejects an event type outside the original option list", () => {
    expect(kitchenSchema.safeParse({ ...base, eventType: "Wedding" }).success).toBe(false);
  });
});

describe("contact enquiry schema", () => {
  const base = {
    name: "Ada",
    email: "ada@example.com",
    topic: ENQUIRY_TOPICS[0],
    message: "Do you have space for eight on Saturday morning?",
  };

  it("accepts a complete enquiry", () => {
    expect(enquirySchema.safeParse(base).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(enquirySchema.safeParse({ ...base, email: "ada@" }).success).toBe(false);
  });

  it("rejects a too-short message", () => {
    const result = enquirySchema.safeParse({ ...base, message: "hi" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("10+ characters");
    }
  });
});

describe("newsletter schema", () => {
  it("accepts a valid address", () => {
    expect(newsletterSchema.safeParse({ email: "you@email.com" }).success).toBe(true);
  });

  it("trims surrounding whitespace before validating", () => {
    expect(newsletterSchema.safeParse({ email: "  you@email.com  " }).success).toBe(true);
  });

  it("rejects an empty value with a specific message", () => {
    const result = newsletterSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Enter your email address");
    }
  });

  it("rejects a malformed address", () => {
    for (const email of ["nope", "a@b", "a b@c.com", "@email.com"]) {
      expect(newsletterSchema.safeParse({ email }).success).toBe(false);
    }
  });
});
