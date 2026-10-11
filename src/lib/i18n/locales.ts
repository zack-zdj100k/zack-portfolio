// Supported site languages. Shared by server and client code (no secrets here).
//
// es-MX and es-CO are regional variants of Spanish: any text they don't override falls back to
// "es", then to English. pt-BR is Brazilian Portuguese. "nb" is Norwegian (Bokmål).

export const locales = [
  "en",
  "fr",
  "ar",
  "it",
  "tr",
  "es",
  "es-MX",
  "es-CO",
  "pt-BR",
  "ru",
  "uk",
  "nb",
  "nl",
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const rtlLocales: ReadonlySet<Locale> = new Set(["ar"]);

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export function dir(locale: Locale): "rtl" | "ltr" {
  return rtlLocales.has(locale) ? "rtl" : "ltr";
}

/** Lookup order for translated content: the locale, its parent language, then English. */
export function fallbackChain(locale: Locale): Locale[] {
  const chain: Locale[] = [locale];
  if (locale === "es-MX" || locale === "es-CO") chain.push("es");
  if (locale !== defaultLocale) chain.push(defaultLocale);
  return chain;
}

/** Native names, shown in the language switcher. */
export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  ar: "العربية",
  it: "Italiano",
  tr: "Türkçe",
  es: "Español",
  "es-MX": "Español (México)",
  "es-CO": "Español (Colombia)",
  "pt-BR": "Português (Brasil)",
  ru: "Русский",
  uk: "Українська",
  nb: "Norsk",
  nl: "Nederlands",
};

/** BCP-47 tags for <html lang> and hreflang. */
export const localeTags: Record<Locale, string> = {
  en: "en",
  fr: "fr",
  ar: "ar",
  it: "it",
  tr: "tr",
  es: "es",
  "es-MX": "es-MX",
  "es-CO": "es-CO",
  "pt-BR": "pt-BR",
  ru: "ru",
  uk: "uk",
  nb: "nb",
  nl: "nl",
};
