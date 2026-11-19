import { forwardRef, useId } from "react";
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
 * ── WHY LABELS SIT ABOVE THE FIELD ──────────────────────────────────────────
 * An earlier revision used floating labels: the label started inside the
 * control and animated up over the border. It looked current, but it had two
 * real problems, and the second one was reported from the live site:
 *
 * 1. The floating-label pattern is the one the accessibility research is
 *    against (Penzo, Wroblewski, NN/g, Baymard): tiny 11px text over a border is
 *    harder to read, and it fails at 200% zoom.
 * 2. It collided. The control kept `pt-[22px]` to leave room for the label while
 *    lifted, so in the resting state the label sat *on top of* the placeholder —
 *    "FIRST NAME *" over "Your name" in the same 22px band. That is unreadable,
 *    and it happened on every empty required field.
 *
 * So the label now sits above the control, always visible, never animated, never
 * overlapping. That is: the strongest-label pattern, zero layout maths, and one
 * predictable 48px control everywhere.
 *
 * Two details kept from the research:
 * - **Optional fields are marked "(optional)"**, not required ones with an
 *   asterisk. Asterisks force people to work out what the star means; naming the
 *   minority case doesn't. `required` still sets the real `required` attribute.
 * - **Errors are assertive, hints are quiet**, and both share one slot so the
 *   form never jumps as you tab through it.
 */

type FieldShellProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  fullWidth?: boolean;
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
  children,
}: FieldShellProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", fullWidth && "sm:col-span-2", className)}>
      <label
        htmlFor={id}
        className="text-[12px] leading-none font-semibold tracking-[0.03em] text-espresso"
      >
        {label}
        {required ? null : <span className="ml-1 font-normal text-muted-strong">(optional)</span>}
      </label>

      {children({ inputId: id, describedBy })}

      {/*
        Hint and error occupy the same slot, so tabbing through a form with
        several errors never reflows the fields below.
      */}
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="flex items-start gap-1.5 text-[12.5px] leading-snug font-medium text-danger"
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
        <p id={hintId} className="text-[12.5px] leading-snug text-muted-strong">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The shared control surface.
 *
 * `h-12` (48px) clears the touch-target minimum on every control, including the
 * textarea's first line, and 16px text on mobile stops iOS zooming the page on
 * focus. No top padding is reserved for a label any more, so the placeholder
 * gets the full height of the control.
 */
const CONTROL_CLASSES = cn(
  "w-full rounded-xl border border-line bg-paper px-3.5 text-[16px] text-espresso",
  "h-12 sm:text-[15px]",
  "transition-[border-color,background-color,box-shadow] duration-200 outline-none",
  "placeholder:text-espresso/45",
  "hover:border-espresso/30",
  "focus:border-gold-ink focus:bg-white focus:ring-[3px] focus:ring-gold/20",
  "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/10",
);

export type TextFieldProps = {
  label: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, fullWidth, className, required, id, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <FieldShell
      id={inputId}
      label={label}
      {...(hint !== undefined ? { hint } : {})}
      {...(error !== undefined ? { error } : {})}
      {...(required !== undefined ? { required } : {})}
      {...(fullWidth !== undefined ? { fullWidth } : {})}
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
  function TextAreaField({ label, error, hint, fullWidth, className, required, id, ...rest }, ref) {
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
      >
        {({ inputId, describedBy }) => (
          <textarea
            ref={ref}
            id={inputId}
            name={rest.name ?? inputId}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              CONTROL_CLASSES,
              "h-auto min-h-[116px] resize-y py-3 leading-relaxed",
              className,
            )}
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
              // A native select shows its chosen option, so vertical centring
              // (from h-12) is exactly what's wanted — no label to dodge.
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
  hint,
  options,
  value,
  onChange,
  name,
  columns = 2,
}: {
  label: string;
  error?: string;
  hint?: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  columns?: 2 | 3;
}) {
  const groupId = `${useId()}-segmented`;
  const errorId = error ? `${groupId}-error` : undefined;
  const hintId = hint ? `${groupId}-hint` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={describedBy}>
      <legend className="mb-2 text-[12px] leading-none font-semibold tracking-[0.03em] text-espresso">
        {label}
      </legend>
      <div className={cn("grid gap-2", columns === 2 ? "grid-cols-2" : "grid-cols-3")}>
        {options.map((option) => {
          const selected = value === option;
          return (
            <label
              key={option}
              className={cn(
                "flex h-12 cursor-pointer items-center justify-center rounded-xl border px-3 text-center text-[13.5px] font-semibold transition-all duration-200",
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
        <p id={errorId} role="alert" className="text-[12.5px] font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-[12.5px] leading-snug text-muted-strong">
          {hint}
        </p>
      ) : null}
    </fieldset>
  );
}
