"use client";

import { useId } from "react";

type Base = {
  name: string;
  label: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  className?: string;
};

function Wrapper({ id, label, error, hint, required, className, children }: Base & { id: string; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <label htmlFor={id} className="text-sm font-medium text-mist">
        {label}
        {required && <span aria-hidden className="text-ice"> *</span>}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-mist/60">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, hint?: string, error?: string | null, extra?: string) {
  return [hint ? `${id}-hint` : null, extra ?? null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
}

export function TextField(
  props: Base & { type?: "text" | "email" | "tel"; autoComplete?: string; maxLength?: number; dir?: "ltr"; describedBy?: string; defaultValue?: string },
) {
  const id = useId();
  return (
    <Wrapper {...props} id={id}>
      <input
        id={id}
        name={props.name}
        type={props.type ?? "text"}
        autoComplete={props.autoComplete}
        maxLength={props.maxLength}
        required={props.required}
        dir={props.dir}
        defaultValue={props.defaultValue}
        aria-invalid={props.error ? true : undefined}
        aria-describedby={describedBy(id, props.hint, props.error, props.describedBy)}
        className="field-input"
      />
    </Wrapper>
  );
}

export function TextArea(props: Base & { rows?: number; maxLength?: number }) {
  const id = useId();
  return (
    <Wrapper {...props} id={id}>
      <textarea
        id={id}
        name={props.name}
        rows={props.rows ?? 6}
        maxLength={props.maxLength}
        required={props.required}
        aria-invalid={props.error ? true : undefined}
        aria-describedby={describedBy(id, props.hint, props.error)}
        className="field-input resize-y"
      />
    </Wrapper>
  );
}

export function SelectField(
  props: Base & {
    options: { value: string; label: string }[];
    placeholder?: string;
    defaultValue?: string;
    value?: string;
    onChange?: (value: string) => void;
  },
) {
  const id = useId();
  return (
    <Wrapper {...props} id={id}>
      <select
        id={id}
        name={props.name}
        required={props.required}
        defaultValue={props.value === undefined ? (props.defaultValue ?? "") : undefined}
        value={props.value}
        onChange={props.onChange ? (e) => props.onChange!(e.target.value) : undefined}
        aria-invalid={props.error ? true : undefined}
        aria-describedby={describedBy(id, props.hint, props.error)}
        className="field-input appearance-none bg-[length:16px] bg-[position:right_1rem_center] bg-no-repeat pe-10 rtl:bg-[position:left_1rem_center]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23bbccd7' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        }}
      >
        {props.placeholder !== undefined && (
          <option value="" disabled={props.required}>
            {props.placeholder}
          </option>
        )}
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Wrapper>
  );
}

export function ConsentField({ name, label, error, children }: { name: string; label: string; error?: string | null; children?: React.ReactNode }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <input
          id={id}
          name={name}
          type="checkbox"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-1 size-5 shrink-0 accent-[#bbccd7]"
        />
        <label htmlFor={id} className="text-sm leading-relaxed text-mist/80">
          {label} {children}
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** Invisible to people (and skipped by keyboard and screen readers); bots tend to fill it. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -start-[10000px] top-auto h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
