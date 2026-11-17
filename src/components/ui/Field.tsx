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
 * Every control gets: a real <label for>, aria-describedby wiring for hint and
 * error text, aria-invalid on failure, and a `role="alert"` error node so a
 * validation message is announced the moment it appears.
 *
 * The original forms had bare <label> elements with no `for`, no `id`, no
 * `name`, and error text that never existed — a screen-reader user was told
 * "edit text, blank" with no idea which field it was.
 */

type FieldShellProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  fullWidth?: boolean;
  children: (ids: { inputId: string; describedBy: string | undefined }) => ReactNode;
};

const CONTROL_CLASSES =
  "w-full rounded-xl border border-line bg-[#fbf8f3] px-[15px] py-[13px] text-espresso text-sm outline-none transition-[border-color,background-color,box-shadow] duration-200 placeholder:text-espresso/40 focus:border-gold focus:bg-white focus:ring-[3px] focus:ring-gold/15 aria-[invalid=true]:border-danger aria-[invalid=true]:bg-danger/4";

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
    <div className={cn("flex flex-col gap-[7px]", fullWidth && "sm:col-span-2", className)}>
      <label
        htmlFor={id}
        className="text-[11px] font-bold tracking-[0.12em] text-muted-strong uppercase"
      >
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-1 text-gold">
            *
          </span>
        ) : (
          <span className="ml-1.5 text-[10px] font-medium tracking-normal text-muted-strong/70 normal-case">
            (optional)
          </span>
        )}
      </label>
      {children({ inputId: id, describedBy })}
      {hint && !error ? (
        <p id={hintId} className="text-[11.5px] leading-snug text-muted-strong">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-[11.5px] leading-snug font-semibold text-danger"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

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
            className={cn(CONTROL_CLASSES, "min-h-[125px] resize-y leading-relaxed", className)}
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
            className={cn(CONTROL_CLASSES, "appearance-none pr-10", className)}
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
