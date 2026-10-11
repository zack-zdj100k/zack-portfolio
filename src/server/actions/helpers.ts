import "server-only";
import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { UploadError } from "@/server/services/media";

// FormData readers. Everything from the browser is untrusted: trim, cap lengths, whitelist enums.

export function str(fd: FormData, key: string, max = 500): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function optStr(fd: FormData, key: string, max = 500): string | null {
  return str(fd, key, max) || null;
}

export function bool(fd: FormData, key: string): boolean {
  return fd.get(key) === "on" || fd.get(key) === "true";
}

export function int(fd: FormData, key: string, { min = 0, max = 1_000_000 } = {}): number | null {
  const raw = str(fd, key, 20);
  if (raw === "") return null;
  const n = Number(raw);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

export function oneOf<T extends string>(fd: FormData, key: string, values: readonly T[], fallback: T): T {
  const v = str(fd, key, 40);
  return (values as readonly string[]).includes(v) ? (v as T) : fallback;
}

/** One entry per line, empty lines dropped. */
export function lines(fd: FormData, key: string, maxItems = 40, maxLen = 200): string[] {
  return str(fd, key, maxItems * (maxLen + 2))
    .split(/\r?\n/)
    .map((l) => l.trim().slice(0, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

/** Comma- or newline-separated list. */
export function list(fd: FormData, key: string, maxItems = 40, maxLen = 80): string[] {
  return str(fd, key, 4000)
    .split(/[,\n]/)
    .map((l) => l.trim().slice(0, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

export function localeOf(fd: FormData): Locale {
  const v = str(fd, "locale", 10);
  if (!isLocale(v)) throw new Error("Invalid locale");
  return v;
}

/** "40,000" / "40000.50" → minor units for the currency (2 decimals for DZD/EUR/USD). */
export function moneyMinor(fd: FormData, key: string): bigint | null {
  const raw = str(fd, key, 30).replace(/[\s,]/g, "");
  if (raw === "") return null;
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) return null;
  const [whole, frac = ""] = raw.split(".");
  return BigInt(whole) * BigInt(100) + BigInt((frac + "00").slice(0, 2));
}

export function currencyCode(fd: FormData, key: string): string {
  const v = str(fd, key, 3).toUpperCase();
  if (!/^[A-Z]{3}$/.test(v)) throw new ActionError("Currency must be a 3-letter code like DZD or EUR.");
  return v;
}

export function marketCode(fd: FormData, key: string): string {
  const v = str(fd, key, 2).toUpperCase();
  if (v === "*" || /^[A-Z]{2}$/.test(v)) return v;
  throw new ActionError('Country must be a 2-letter code (DZ, FR...) or "*" for all other countries.');
}

export function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Error with a message that is safe to show the admin. */
export class ActionError extends Error {}

/** Redirect back with a flash message. */
export function done(path: string, message: string): never {
  const sep = path.includes("?") ? "&" : "?";
  redirect(`${path}${sep}ok=${encodeURIComponent(message)}`);
}

export function fail(path: string, message: string): never {
  const sep = path.includes("?") ? "&" : "?";
  redirect(`${path}${sep}error=${encodeURIComponent(message)}`);
}

/** Turns known errors into a flash message; anything else becomes a generic message (no internals leak). */
export function errorMessage(e: unknown): string {
  if (e instanceof ActionError || e instanceof UploadError) return e.message;
  if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002") return "That value is already used (it must be unique).";
  console.error("admin action failed:", e instanceof Error ? e.message : e);
  return "Something went wrong. Nothing was changed.";
}

/** Only allow same-site relative return paths. */
export function safeBack(fd: FormData, fallback: string) {
  const v = str(fd, "back", 300);
  return v.startsWith("/admin") && !v.startsWith("//") ? v : fallback;
}

export function isRedirect(e: unknown) {
  return e && typeof e === "object" && "digest" in e && String((e as { digest: unknown }).digest).startsWith("NEXT_REDIRECT");
}

/**
 * Moves `id` one place up or down among its siblings (already sorted) and renumbers them 0..n.
 * `update` returns the Prisma write for one row so the whole move runs in one transaction.
 */
export function reorderWrites<T extends { id: string }, W>(siblings: T[], id: string, op: string, update: (id: string, sortOrder: number) => W): W[] {
  const i = siblings.findIndex((s) => s.id === id);
  const j = op === "up" ? i - 1 : op === "down" ? i + 1 : -1;
  if (i === -1 || j < 0 || j >= siblings.length) return [];
  const next = [...siblings];
  [next[i], next[j]] = [next[j], next[i]];
  return next.map((s, k) => update(s.id, k));
}

/** Every value of a repeated field (checkbox groups). */
export function all(fd: FormData, key: string, maxItems = 100, maxLen = 60): string[] {
  return fd
    .getAll(key)
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim().slice(0, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}
