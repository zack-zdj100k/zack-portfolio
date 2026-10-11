import "server-only";
import { z } from "zod";
import { COUNTRY_CODES } from "@/lib/countries";
import { isLocale } from "@/lib/i18n/locales";

// Error codes map to `forms.*` messages on the client, so validation errors are translated.
export type FieldError = "required" | "email" | "phone" | "contactRequired" | "tooLong" | "consent";

const text = (max: number) =>
  z
    .string({ error: "required" })
    .trim()
    .max(max, { error: "tooLong" })
    // Strip control characters (keep newlines and tabs).
    .transform((v) => v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ""));
const required = (max: number) => text(max).pipe(z.string().min(1, { error: "required" }));
const optional = (max: number) =>
  z
    .union([text(max), z.literal(""), z.null(), z.undefined()])
    .transform((v) => (v ? v : null));
const email = z
  .union([z.literal(""), z.null(), z.undefined(), z.string().trim().max(200, { error: "tooLong" }).pipe(z.email({ error: "email" }))])
  .transform((v) => (v ? v.toLowerCase() : null));
const phone = z
  .union([
    z.literal(""),
    z.null(),
    z.undefined(),
    z
      .string()
      .trim()
      .max(30, { error: "tooLong" })
      .regex(/^\+?[\d\s().-]{6,}$/, { error: "phone" }),
  ])
  .transform((v) => (v ? v : null));
const country = z.enum(COUNTRY_CODES, { error: "required" });
const category = z.enum(["WEBSITE", "APP", "SOFTWARE"]);
const consent = z.literal(true, { error: "consent" });
const locale = z.string().refine(isLocale).catch("en");

export const contactSchema = z
  .object({
    name: required(120),
    email,
    phone,
    country,
    projectCategory: z.union([category, z.literal(""), z.null(), z.undefined()]).transform((v) => (v ? v : null)),
    budget: optional(120),
    timeline: optional(120),
    message: required(5000),
    consent,
    locale,
  })
  .superRefine((v, ctx) => {
    if (!v.email && !v.phone) ctx.addIssue({ code: "custom", path: ["email"], message: "contactRequired" });
  });

export const referralSchema = z
  .object({
    referrerName: required(120),
    referrerEmail: email,
    referrerPhone: phone,
    referrerCountry: country,
    clientName: required(160),
    clientContact: required(200),
    clientCountry: z.union([country, z.literal(""), z.null(), z.undefined()]).transform((v) => (v ? v : null)),
    projectCategory: z.enum(["WEBSITE", "APP", "SOFTWARE"], { error: "required" }),
    message: optional(3000),
    consent,
    locale,
  })
  .superRefine((v, ctx) => {
    if (!v.referrerEmail && !v.referrerPhone) ctx.addIssue({ code: "custom", path: ["referrerEmail"], message: "contactRequired" });
  });

/** Zod issues → { field: code }, first error per field. */
export function fieldErrors(error: z.ZodError): Record<string, FieldError> {
  const out: Record<string, FieldError> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (out[key]) continue;
    const code = issue.message as FieldError;
    out[key] = ["required", "email", "phone", "contactRequired", "tooLong", "consent"].includes(code) ? code : "required";
  }
  return out;
}
