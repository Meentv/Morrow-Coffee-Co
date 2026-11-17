import { describe, expect, it } from "vitest";

import { formatCents, lineTotalCents, parseAmountToCents } from "./currency";

describe("formatCents", () => {
  it("formats whole and fractional amounts", () => {
    expect(formatCents(550)).toBe("$5.50");
    expect(formatCents(0)).toBe("$0.00");
    expect(formatCents(5)).toBe("$0.05");
    expect(formatCents(325)).toBe("$3.25");
  });

  it("formats large amounts with thousands separators", () => {
    expect(formatCents(123456)).toBe("$1,234.56");
  });

  it("formats negative amounts (used by future discounts)", () => {
    expect(formatCents(-250)).toBe("-$2.50");
  });

  it("returns a dash for non-finite input instead of NaN", () => {
    expect(formatCents(Number.NaN)).toBe("—");
    expect(formatCents(Number.POSITIVE_INFINITY)).toBe("—");
  });
});

describe("parseAmountToCents", () => {
  it("parses plain and decimal amounts", () => {
    expect(parseAmountToCents("5.50")).toBe(550);
    expect(parseAmountToCents("5")).toBe(500);
    expect(parseAmountToCents("5.5")).toBe(550);
    expect(parseAmountToCents("$4.75")).toBe(475);
    expect(parseAmountToCents(" 12.00 ")).toBe(1200);
  });

  it("rejects more than two decimal places rather than rounding silently", () => {
    expect(parseAmountToCents("5.555")).toBeNull();
  });

  it("rejects junk", () => {
    expect(parseAmountToCents("")).toBeNull();
    expect(parseAmountToCents("five")).toBeNull();
    expect(parseAmountToCents("-5")).toBeNull();
    expect(parseAmountToCents("5,50")).toBeNull();
  });
});

describe("lineTotalCents", () => {
  it("multiplies exactly using integer maths", () => {
    expect(lineTotalCents(550, 3)).toBe(1650);
    expect(lineTotalCents(325, 2)).toBe(650);
  });

  it("never produces floating point drift", () => {
    // 0.1 + 0.2 !== 0.3 in floats; 10 + 20 === 30 in cents.
    const sum = lineTotalCents(10, 1) + lineTotalCents(20, 1);
    expect(sum).toBe(30);
    expect(Number.isInteger(sum)).toBe(true);
  });

  it("treats zero or negative quantity as zero", () => {
    expect(lineTotalCents(550, 0)).toBe(0);
    expect(lineTotalCents(550, -4)).toBe(0);
  });

  it("truncates fractional quantities", () => {
    expect(lineTotalCents(550, 2.9)).toBe(1100);
  });
});
