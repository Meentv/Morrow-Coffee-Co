/**
 * Money helpers. Every value crossing these functions is an integer number of
 * cents. There is no `price * 100` / `/ 100` round-tripping anywhere in the
 * cart, because 0.1 + 0.2 !== 0.3 and a coffee shop that mis-adds a subtotal
 * is a broken coffee shop.
 */

/** Format integer cents as a display string: 550 → "$5.50". */
export function formatCents(cents: number): string {
  if (!Number.isFinite(cents)) return "—";

  const rounded = Math.round(cents);
  const negative = rounded < 0;
  const absolute = Math.abs(rounded);
  const dollars = Math.trunc(absolute / 100);
  const remainder = absolute % 100;

  const formatted = `$${dollars.toLocaleString("en-US")}.${String(remainder).padStart(2, "0")}`;
  return negative ? `-${formatted}` : formatted;
}

/**
 * Parse a human-entered amount ("5.50", "5", "5.5") into integer cents.
 * Returns null for anything that is not a valid non-negative amount with at
 * most two decimal places — no silent truncation of a third decimal.
 */
export function parseAmountToCents(input: string): number | null {
  const trimmed = input.trim().replace(/^\$/, "");
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;

  const [whole = "0", fraction = ""] = trimmed.split(".");
  const pennies = Number.parseInt(fraction.padEnd(2, "0"), 10);
  const dollars = Number.parseInt(whole, 10);

  if (!Number.isSafeInteger(dollars) || !Number.isSafeInteger(pennies)) return null;
  return dollars * 100 + pennies;
}

/** Multiply a unit price by a whole quantity using integer maths only. */
export function lineTotalCents(unitPriceCents: number, quantity: number): number {
  const qty = Math.max(0, Math.trunc(quantity));
  return Math.round(unitPriceCents) * qty;
}
