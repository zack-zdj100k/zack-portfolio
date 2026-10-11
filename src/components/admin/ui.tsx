// Admin form primitives. Server-renderable (no hooks): plain labelled inputs that post to server actions.
import Link from "next/link";
import { locales, localeNames, type Locale } from "@/lib/i18n/locales";

export function Card({ title, description, children, actions }: { title?: string; description?: React.ReactNode; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-ink-2 p-5 md:p-7">
      {(title || actions) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-lg font-bold text-mist">{title}</h2>}
            {description && <p className="mt-1 max-w-3xl text-sm text-mist/60">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageTitle({ title, description, actions }: { title: string; description?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-mist md:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-3xl text-mist/65">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

type FieldBase = { label: string; name: string; hint?: React.ReactNode; className?: string; required?: boolean };

export function Input({
  label,
  name,
  hint,
  className,
  required,
  defaultValue,
  type = "text",
  dir,
  ...rest
}: FieldBase & { defaultValue?: string | number | null; type?: string; dir?: "ltr" | "rtl"; min?: number; max?: number; step?: string; maxLength?: number; placeholder?: string; pattern?: string; multiple?: boolean; accept?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="text-sm font-medium text-mist/85">
        {label}
        {required && <span className="text-ice"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={type === "file" ? undefined : (defaultValue ?? "")}
        required={required}
        dir={dir}
        className={type === "file" ? "field-input file:me-3 file:rounded-full file:border-0 file:bg-mist file:px-4 file:py-1.5 file:text-sm file:text-ink" : "field-input"}
        {...rest}
      />
      {hint && <span className="text-xs text-mist/55">{hint}</span>}
    </label>
  );
}

export function Textarea({ label, name, hint, className, required, defaultValue, rows = 4, dir, maxLength }: FieldBase & { defaultValue?: string | null; rows?: number; dir?: "ltr" | "rtl"; maxLength?: number }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="text-sm font-medium text-mist/85">
        {label}
        {required && <span className="text-ice"> *</span>}
      </span>
      <textarea name={name} rows={rows} defaultValue={defaultValue ?? ""} required={required} dir={dir} maxLength={maxLength} className="field-input resize-y" />
      {hint && <span className="text-xs text-mist/55">{hint}</span>}
    </label>
  );
}

export function Select({ label, name, hint, className, required, defaultValue, options }: FieldBase & { defaultValue?: string | null; options: { value: string; label: string }[] }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="text-sm font-medium text-mist/85">{label}</span>
      <select name={name} defaultValue={defaultValue ?? ""} required={required} className="field-input">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <span className="text-xs text-mist/55">{hint}</span>}
    </label>
  );
}

export function Checkbox({ label, name, defaultChecked, hint }: { label: string; name: string; defaultChecked?: boolean; hint?: React.ReactNode }) {
  return (
    <label className="flex items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-1 size-4 accent-[#bbccd7]" />
      <span className="flex flex-col">
        <span className="text-sm text-mist/90">{label}</span>
        {hint && <span className="text-xs text-mist/55">{hint}</span>}
      </span>
    </label>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "ok" | "warn" | "danger" | "info"; children: React.ReactNode }) {
  const tones = {
    neutral: "border-line text-mist/70",
    ok: "border-ok/40 text-ok",
    warn: "border-amber-300/40 text-amber-200",
    danger: "border-danger/40 text-danger",
    info: "border-ice/40 text-ice",
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: "DRAFT" | "PUBLISHED" }) {
  return <Badge tone={status === "PUBLISHED" ? "ok" : "warn"}>{status === "PUBLISHED" ? "Published" : "Draft"}</Badge>;
}

/** Flash message from ?ok= / ?error= after a server action redirect. */
export function Flash({ ok, error }: { ok?: string | string[]; error?: string | string[] }) {
  const okText = typeof ok === "string" ? ok : null;
  const errText = typeof error === "string" ? error : null;
  if (!okText && !errText) return null;
  return (
    <div role="status" className={`mb-6 rounded-xl border px-4 py-3 text-sm ${errText ? "border-danger/40 bg-danger/10 text-mist" : "border-ok/40 bg-ok/10 text-mist"}`}>
      {errText ?? okText}
    </div>
  );
}

/**
 * Locale tabs for translation editors. Each tab shows whether that language has text yet and
 * whether it's reviewed.
 */
export function LocaleTabs({ basePath, current, states }: { basePath: string; current: Locale; states: Partial<Record<Locale, "reviewed" | "draft">> }) {
  return (
    <nav aria-label="Language" className="mb-5 flex flex-wrap gap-1.5">
      {locales.map((l) => {
        const state = states[l];
        const active = l === current;
        return (
          <Link
            key={l}
            href={`${basePath}${basePath.includes("?") ? "&" : "?"}locale=${l}`}
            aria-current={active ? "page" : undefined}
            title={`${localeNames[l]}: ${state === "reviewed" ? "reviewed" : state === "draft" ? "draft translation" : "missing"}`}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
              active ? "border-mist bg-mist text-ink" : "border-line text-mist/75 hover:border-ice/60"
            }`}
          >
            <span>{l}</span>
            <span aria-hidden className={`size-1.5 rounded-full ${state === "reviewed" ? "bg-ok" : state === "draft" ? "bg-amber-300" : "bg-danger"}`} />
          </Link>
        );
      })}
    </nav>
  );
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[640px] text-left text-sm rtl:text-right">
        <thead className="bg-ink-3 text-xs uppercase tracking-wider text-mist/60">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft (hidden)" },
  { value: "PUBLISHED", label: "Published" },
];
export const CATEGORY_OPTIONS = [
  { value: "WEBSITE", label: "Website" },
  { value: "APP", label: "App" },
  { value: "SOFTWARE", label: "Software" },
];
