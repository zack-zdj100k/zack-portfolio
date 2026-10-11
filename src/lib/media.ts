import { fallbackChain, type Locale } from "@/lib/i18n/locales";

/** Alt text for the locale (with fallbacks). Empty string = decorative image. */
export function altFor(alt: unknown, locale: Locale): string {
  if (!alt || typeof alt !== "object") return "";
  const map = alt as Record<string, string>;
  for (const l of fallbackChain(locale)) if (map[l]) return map[l];
  return "";
}
