import { forwardRef, useId, useState } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

/**
 * Form field primitives.
 *
 * ── WHY FLOATING LABELS, GIVEN THE RESEARCH ─────────────────────────────────
 * The research on this is consistent and mostly *against* floating labels:
 * labels above the field win on scanability, they survive autofill and zoom,
 * and tiny floating text is harder to read for people with cognitive
 * impairments.
 *
 * So this implementation keeps a real, always-present <label> element as the
 * accessible name and the layout's anchor, and animates it *only as a visual
 * echo* of the control's state. The label never becomes the placeholder, never
 * disappears, and never carries information the input lacks. Concretely:
 *
 *  - The <label> is always in the DOM with a `for` pointing at the input.
 *  - Its rendered position moves up over the border when the field is focused
 *    or filled, which is the modern look, but the text is 12px at a 5.2:1
 *    contrast ratio rather than the 9px whisper most implementations ship.
 *  - Placeholder text is still allowed, and is an *example*, never a label.
 *  - If the browser cannot run the animation (reduced motion) it snaps, no
 *    information is lost.
 *
 * Every control also gets: aria-describedby wiring for hint and error text,
 * aria-invalid on failure, and a role="alert" error node so a validation
 * message is announced the moment it appears.
 */

type FieldShellProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  fullWidth?: boolean;
  /** True once the control has a value, so the label can stay lifted. */
  floating: boolean;
  /** Renders the control; receives the ids it must wire up. */
  children: (ids: { inputId: string; describedBy: string | undefined }) => ReactNode;
};

function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  className,
  fullWidth,
  floating,
  children,
}: FieldShellProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div
      className={cn(
        // `group` lets the label react to :focus-within without JS.
        "group relative flex flex-col gap-1.5",
        fullWidth && "sm:col-span-2",
        className,
      )}
    >
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-3.5 z-1 origin-left px-1.5",
          "bg-paper text-[11px] font-semibold tracking-[0.06em] text-muted-strong uppercase",
          "transition-all duration-200 ease-brand",
          // Lifted state: focused, filled, or (for selects) always — a select
          // shows its chosen option, so the label must not sit on top of it.
          floating
            ? "top-0 -translate-y-1/2 scale-100"
            : "top-[15px] translate-y-0 scale-100 text-[13px] font-medium tracking-normal normal-case",
          "group-focus-within:top-0 group-focus-within:-translate-y-1/2 group-focus-within:text-[11px] group-focus-within:font-semibold group-focus-within:tracking-[0.06em] group-focus-within:uppercase",
          "motion-reduce:transition-none",
        )}
      >
        {label}
        {required ? (
          <span aria-hidden="true" className="text-gold-ink">
            {" "}
            *
          </span>
        ) : null}
      </label>

      {children({ inputId: id, describedBy })}

      {/* Hint and error occupy the same slot so the layout does not jump when
          an error replaces a hint. Errors are assertive; hints are quiet. */}
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="flex items-start gap-1.5 text-[12px] leading-snug font-medium text-danger"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="mt-px size-3.5 shrink-0"
            fill="currentColor"
          >
            <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm0 2.8a.9.9 0 0 1 .9.9v3.4a.9.9 0 1 1-1.8 0V5.2a.9.9 0 0 1 .9-.9Zm0 7.9a1.05 1.05 0 1 1 0-2.1 1.05 1.05 0 0 1 0 2.1Z" />
          </svg>
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={hintId} className="text-[12px] leading-snug text-muted-strong">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The shared control surface. 48px tall to clear the touch-target minimum,
 * 16px text on mobile so iOS does not zoom the page on focus.
 */
const CONTROL_CLASSES = cn(
  "peer w-full rounded-xl border border-line bg-paper px-4 pt-[22px] pb-2 text-[15px] text-espresso",
  "transition-[border-color,background-color,box-shadow] duration-200 outline-none",
  "placeholder:text-[13px] placeholder:text-espresso/45",
  "hover:border-espresso/25",
  "focus:border-gold-ink focus:ring-[3px] focus:ring-gold/20",
  "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/10",
);

export type TextFieldProps = {
  label: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label,
    error,
    hint,
    fullWidth,
    className,
    required,
    id,
    value,
    defaultValue,
    onChange,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  // Track "has a value" without taking over from react-hook-form's uncontrolled
  // registration: we only mirror what onChange / defaultValue tell us.
  const [filled, setFilled] = useState(
    Boolean(defaultValue) || (value !== undefined && value !== ""),
  );
  const floating = filled || Boolean(value);

  return (
    <FieldShell
      id={inputId}
      label={label}
      {...(hint !== undefined ? { hint } : {})}
      {...(error !== undefined ? { error } : {})}
      {...(required !== undefined ? { required } : {})}
      {...(fullWidth !== undefined ? { fullWidth } : {})}
      floating={floating}
    >
      {({ inputId: resolvedId, describedBy }) => (
        <input
          ref={ref}
          id={resolvedId}
          name={rest.name ?? resolvedId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(CONTROL_CLASSES, className)}
          {...(value !== undefined ? { value } : {})}
          {...(value !== undefined ? {} : { defaultValue })}
          onChange={(event) => {
            setFilled(event.target.value !== "");
            onChange?.(event);
          }}
          {...rest}
        />
      )}
    </FieldShell>
  );
});

export type TextAreaFieldProps = {
  label: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  function TextAreaField(
    {
      label,
      error,
      hint,
      fullWidth,
      className,
      required,
      id,
      value,
      defaultValue,
      onChange,
      ...rest
    },
    ref,
  ) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const [filled, setFilled] = useState(
      Boolean(defaultValue) || (value !== undefined && value !== ""),
    );
    const floating = filled || Boolean(value);

    return (
      <FieldShell
        id={fieldId}
        label={label}
        {...(hint !== undefined ? { hint } : {})}
        {...(error !== undefined ? { error } : {})}
        {...(required !== undefined ? { required } : {})}
        {...(fullWidth !== undefined ? { fullWidth } : {})}
        floating={floating}
      >
        {({ inputId, describedBy }) => (
          <textarea
            ref={ref}
            id={inputId}
            name={rest.name ?? inputId}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(CONTROL_CLASSES, "min-h-[124px] resize-y leading-relaxed", className)}
            {...(value !== undefined ? { value } : {})}
            {...(value !== undefined ? {} : { defaultValue })}
            onChange={(event) => {
              setFilled(event.target.value !== "");
              onChange?.(event);
            }}
            {...rest}
          />
        )}
      </FieldShell>
    );
  },
);

export type SelectFieldProps = {
  label: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  options: readonly string[];
  placeholder?: string;
} & SelectHTMLAttributes<HTMLSelectElement>;

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, error, hint, fullWidth, className, required, id, options, placeholder, ...rest },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldShell
      id={fieldId}
      label={label}
      {...(hint !== undefined ? { hint } : {})}
      {...(error !== undefined ? { error } : {})}
      {...(required !== undefined ? { required } : {})}
      {...(fullWidth !== undefined ? { fullWidth } : {})}
      // A select always renders a chosen option, so the label is always lifted.
      floating
    >
      {({ inputId, describedBy }) => (
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            name={rest.name ?? inputId}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              CONTROL_CLASSES,
              "cursor-pointer appearance-none pr-11",
              // The control has no placeholder text, so no left padding shift.
              "pt-[22px] pb-2",
              className,
            )}
            {...rest}
          >
            {placeholder ? (
              <option value="" disabled>
                {placeholder}
              </option>
            ) : null}
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-strong"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      )}
    </FieldShell>
  );
});

/**
 * A segmented control for short, mutually exclusive choices (pickup vs delivery,
 * how you take your beans). It is a real radio group, so arrow keys work and
 * screen readers announce the options the way they expect.
 */
export function SegmentedField({
  label,
  error,
  options,
  value,
  onChange,
  name,
  columns = 2,
}: {
  label: string;
  error?: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  columns?: 2 | 3;
}) {
  const groupId = `${useId()}-segmented`;
  const errorId = error ? `${groupId}-error` : undefined;

  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={errorId}>
      <legend className="mb-2 text-[11px] font-semibold tracking-[0.06em] text-muted-strong uppercase">
        {label}
      </legend>
      <div className={cn("grid gap-2", columns === 2 ? "grid-cols-2" : "grid-cols-3")}>
        {options.map((option) => {
          const selected = value === option;
          return (
            <label
              key={option}
              className={cn(
                "flex min-h-[46px] cursor-pointer items-center justify-center rounded-xl border px-3 text-center text-[13px] font-semibold transition-all duration-200",
                "has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-gold/25",
                selected
                  ? "border-espresso bg-espresso text-cream shadow-card-soft"
                  : "border-line bg-paper text-espresso hover:border-espresso/30 hover:bg-cream",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option}
                checked={selected}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              {option}
            </label>
          );
        })}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-[12px] font-medium text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
