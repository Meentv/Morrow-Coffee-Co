import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { SegmentedField, SelectField, TextAreaField, TextField } from "./Field";

/**
 * These pin the label contract, because the previous floating-label version
 * shipped a real bug to production: the control reserved `pt-[22px]` for the
 * lifted label while the label ALSO sat over the border in its resting state,
 * so an empty required field rendered "FIRST NAME *" directly on top of
 * "Your name" in the same 22px band.
 *
 * A screenshot is the only way to see the overlap, so these tests assert the
 * structural cause instead: the label is a sibling *above* the control, not an
 * absolutely positioned overlay inside it.
 */

describe("text field", () => {
  it("associates a real label sitting above the control", () => {
    render(<TextField label="First name" required />);

    const input = screen.getByRole("textbox", { name: /first name/i });
    const label = screen.getByText("First name");

    expect(label.tagName).toBe("LABEL");
    expect(label.getAttribute("for")).toBe(input.id);
    // The bug: an absolute overlay inside the field wrapper. A label above the
    // field must not be absolutely positioned at all.
    expect(label.className).not.toMatch(/\babsolute\b/);
    expect(label.className).not.toMatch(/\btranslate-y\b/);
  });

  it("marks optional fields rather than required ones", () => {
    // Research prefers naming the minority case: "(optional)" beats a star
    // people have to decode. Required fields carry no visible marker.
    const { unmount } = render(<TextField label="Phone" />);
    expect(screen.getByText(/\(optional\)/)).toBeInTheDocument();
    unmount();

    render(<TextField label="Email" required />);
    expect(screen.queryByText(/\(optional\)/)).toBeNull();
    expect(screen.queryByText("*")).toBeNull();
    expect(screen.getByRole("textbox", { name: /email/i })).toBeRequired();
  });

  it("gives the control no top padding reserved for a floating label", () => {
    render(<TextField label="Email" />);
    const input = screen.getByRole("textbox");

    // The exact regression: `pt-[22px]` pushed the placeholder into the band
    // the label occupied. A centred 48px control has no reason for it.
    expect(input.className).not.toMatch(/pt-\[22px\]/);
    expect(input.className).toMatch(/\bh-12\b/);
    // 16px text on mobile keeps iOS from zooming the page on focus.
    expect(input.className).toMatch(/text-\[16px\]/);
  });

  it("wires errors to the field and announces them", () => {
    render(<TextField label="Email" error="Enter your email" />);

    const input = screen.getByRole("textbox", { name: /email/i });
    const error = screen.getByRole("alert");

    expect(error).toHaveTextContent("Enter your email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")).toContain(error.id);
  });

  it("prefers the error over the hint in the shared slot", () => {
    render(<TextField label="Email" hint="We reply within a day" error="Enter your email" />);

    // Both would occupy the same row, so only the actionable one shows.
    expect(screen.getByRole("alert")).toHaveTextContent("Enter your email");
    expect(screen.queryByText("We reply within a day")).toBeNull();
  });
});

describe("select field", () => {
  it("renders a labelled select with its options", () => {
    render(
      <SelectField label="Order type" options={["Pickup from Morrow", "Delivery"]} required />,
    );

    const select = screen.getByRole("combobox", { name: /order type/i });
    expect(select).toBeRequired();
    expect(screen.getByRole("option", { name: "Pickup from Morrow" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Delivery" })).toBeInTheDocument();
  });
});

describe("textarea field", () => {
  it("is labelled and keeps a usable minimum height", () => {
    render(<TextAreaField label="Anything else?" />);
    const field = screen.getByRole("textbox", { name: /anything else/i });
    expect(field.className).toMatch(/min-h-/);
  });
});

describe("segmented field", () => {
  it("is a real radio group with a legend", () => {
    render(
      <SegmentedField
        label="Delivery or pickup"
        name="orderType"
        value="Pickup"
        onChange={() => {}}
        options={["Pickup", "Delivery"]}
      />,
    );

    const group = screen.getByRole("group", { name: /delivery or pickup/i });
    expect(group.tagName).toBe("FIELDSET");
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(screen.getByRole("radio", { name: "Pickup" })).toBeChecked();
  });

  it("describes the group with its error", () => {
    render(
      <SegmentedField
        label="Delivery or pickup"
        name="orderType"
        value="Pickup"
        onChange={() => {}}
        options={["Pickup", "Delivery"]}
        error="Choose how you'd like your order"
      />,
    );

    const group = screen.getByRole("group");
    const error = screen.getByRole("alert");
    expect(group.getAttribute("aria-describedby")).toContain(error.id);
  });
});
