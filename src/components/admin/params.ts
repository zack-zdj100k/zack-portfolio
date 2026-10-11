import { isLocale, locales, type Locale } from "@/lib/i18n/locales";

type SP = Record<string, string | string[] | undefined>;

/** Locale being edited in a translation editor (?locale=fr), English by default. */
export function editLocale(sp: SP): Locale {
  const v = sp.locale;
  return typeof v === "string" && isLocale(v) ? v : "en";
}

export function translationStates<T extends { locale: string; reviewed: boolean }>(rows: T[]) {
  return Object.fromEntries(rows.map((r) => [r.locale, r.reviewed ? "reviewed" : "draft"])) as Partial<Record<Locale, "reviewed" | "draft">>;
}

export function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export function moneyInput(minor: bigint | number | null | undefined) {
  if (minor === null || minor === undefined) return "";
  const n = Number(minor) / 100;
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

/** Language state across many items: reviewed only if every item's translation is reviewed. */
export function aggregateStates(rows: { locale: string; reviewed: boolean }[]) {
  const out: Partial<Record<Locale, "reviewed" | "draft">> = {};
  for (const l of locales) {
    const mine = rows.filter((r) => r.locale === l);
    if (mine.length) out[l] = mine.every((r) => r.reviewed) ? "reviewed" : "draft";
  }
  return out;
}
