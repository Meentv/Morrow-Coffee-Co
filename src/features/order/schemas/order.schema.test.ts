import { describe, expect, it } from "vitest";

import { orderSchema, ORDER_TIMINGS, ORDER_TYPES, DELIVERY } from "./order.schema";

const validBase = {
  firstName: "Ada",
  email: "ada@example.com",
  phone: "+234 801 234 5678",
  orderType: ORDER_TYPES[0],
  timing: ORDER_TIMINGS[0],
  address: "",
  notes: "",
};

describe("order schema", () => {
  it("accepts a valid pickup order without an address", () => {
    const result = orderSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it("rejects an empty first name with a helpful message", () => {
    const result = orderSchema.safeParse({ ...validBase, firstName: "  " });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Enter your first name");
    }
  });

  it("rejects a missing phone number", () => {
    const result = orderSchema.safeParse({ ...validBase, phone: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("phone number");
    }
  });

  it("rejects a malformed phone number", () => {
    const result = orderSchema.safeParse({ ...validBase, phone: "not-a-number" });
    expect(result.success).toBe(false);
  });

  it("accepts common phone formatting", () => {
    for (const phone of ["+1 234 567 890", "(555) 019-2837", "+234-801-234-5678"]) {
      expect(orderSchema.safeParse({ ...validBase, phone }).success).toBe(true);
    }
  });

  it("requires a delivery address when local delivery is selected", () => {
    const result = orderSchema.safeParse({
      ...validBase,
      orderType: DELIVERY,
      address: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "address");
      expect(issue?.message).toBe("We need a delivery address for local delivery");
    }
  });

  it("accepts delivery when an address is supplied", () => {
    const result = orderSchema.safeParse({
      ...validBase,
      orderType: DELIVERY,
      address: "18 Test Street, Ibadan",
    });
    expect(result.success).toBe(true);
  });

  it("does not require an address for pickup, even if one is typed", () => {
    const result = orderSchema.safeParse({
      ...validBase,
      orderType: ORDER_TYPES[0],
      address: "left at the door",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown order type", () => {
    const result = orderSchema.safeParse({ ...validBase, orderType: "Teleport" });
    expect(result.success).toBe(false);
  });

  it("enforces the notes length cap", () => {
    const result = orderSchema.safeParse({ ...validBase, notes: "x".repeat(601) });
    expect(result.success).toBe(false);
  });
});
