import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { defaultLocale, fallbackChain, isLocale, type Locale } from "@/lib/i18n/locales";
import { getContentOverrides } from "@/server/services/content";

type Messages = { [key: string]: string | Messages };

async function loadFile(locale: Locale): Promise<Messages> {
  try {
    return (await import(`../messages/${locale}.json`)).default as Messages;
  } catch {
    return {};
  }
}

function deepMerge(base: Messages, over: Messages): Messages {
  const out: Messages = { ...base };
  for (const [k, v] of Object.entries(over)) {
    const prev = out[k];
    out[k] = typeof v === "object" && typeof prev === "object" ? deepMerge(prev, v) : v;
  }
  return out;
}

/** "home.hero.cta" → nested object, so DB overrides merge into the JSON shape. */
function setPath(target: Messages, key: string, value: string) {
  const parts = key.split(".");
  let node = target;
  for (const part of parts.slice(0, -1)) {
    if (typeof node[part] !== "object") node[part] = {};
    node = node[part] as Messages;
  }
  node[parts[parts.length - 1]] = value;
}

/**
 * Message lookup for one locale: JSON defaults along the fallback chain (en ← es ← es-MX), then
 * owner edits from /admin/content along the same chain. Most specific wins.
 */
export async function loadMessages(locale: Locale): Promise<Messages> {
  const chain = fallbackChain(locale).reverse();
  let messages: Messages = {};
  for (const l of chain) messages = deepMerge(messages, await loadFile(l));
  const overrides = await getContentOverrides(chain);
  for (const l of chain) {
    for (const row of overrides.filter((o) => o.locale === l)) setPath(messages, row.key, row.value);
  }
  return messages;
}

export default getRequestConfig(async ({ locale: explicit }) => {
  let candidate: string | undefined = explicit;
  if (!candidate) {
    try {
      candidate = await rootLocale();
    } catch {
      candidate = undefined;
    }
  }
  const locale: Locale = isLocale(candidate) ? candidate : defaultLocale;
  return {
    locale,
    messages: await loadMessages(locale),
    // A missing key renders its English text (already merged) rather than crashing the page.
    onError: () => {},
    getMessageFallback: ({ key }) => key,
  };
});
