import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/server/db";
import { saveContentOverrides } from "@/server/actions/settings";
import { Card, Flash, LocaleTabs, PageTitle } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/buttons";
import { editLocale } from "@/components/admin/params";
import { dir, fallbackChain, localeNames, type Locale } from "@/lib/i18n/locales";

export const metadata: Metadata = { title: "Page text" };

type Messages = { [k: string]: string | Messages };

function flatten(obj: Messages, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") out[key] = v;
    else Object.assign(out, flatten(v, key));
  }
  return out;
}

async function fileDefaults(locale: Locale) {
  // Same layering as the site: English, then the parent language, then the locale itself.
  const merged: Record<string, string> = {};
  for (const l of [...fallbackChain(locale)].reverse()) {
    try {
      Object.assign(merged, flatten((await import(`@/messages/${l}.json`)).default as Messages));
    } catch {
      // no file for this locale
    }
  }
  return merged;
}

const SECTIONS: { prefix: string; title: string }[] = [
  { prefix: "home.", title: "Home page" },
  { prefix: "about.", title: "About page" },
  { prefix: "projects.", title: "Projects" },
  { prefix: "pricing.", title: "Services & pricing" },
  { prefix: "referral.", title: "Referral page" },
  { prefix: "contact.", title: "Contact page" },
  { prefix: "forms.", title: "Form messages" },
  { prefix: "privacy.", title: "Privacy page" },
  { prefix: "nav.", title: "Navigation" },
  { prefix: "footer.", title: "Footer" },
  { prefix: "common.", title: "Common" },
];

export default async function ContentAdmin({ searchParams }: PageProps<"/admin/content">) {
  const sp = await searchParams;
  const locale = editLocale(sp);
  const section = SECTIONS.find((s) => s.prefix === sp.section) ?? SECTIONS[0];
  const [defaults, overrides] = await Promise.all([fileDefaults(locale), prisma.pageContent.findMany({ where: { locale } })]);
  const overrideMap = new Map(overrides.map((o) => [o.key, o.value]));
  const keys = Object.keys(defaults).filter((k) => k.startsWith(section.prefix));

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Page text"
        description="Every heading, button and message on the site. Change a text and save; clear a field to go back to the default. Texts in {curly braces} are filled in automatically, keep them as they are."
      />
      <Flash ok={sp.ok} error={sp.error} />
      <LocaleTabs basePath={`/admin/content?section=${section.prefix}`} current={locale} states={{}} />
      <nav aria-label="Section" className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <Link
            key={s.prefix}
            href={`/admin/content?section=${s.prefix}&locale=${locale}`}
            aria-current={s === section ? "page" : undefined}
            className={`rounded-full border px-3.5 py-1.5 text-sm ${s === section ? "border-mist bg-mist text-ink" : "border-line text-mist/75 hover:border-ice/60"}`}
          >
            {s.title}
          </Link>
        ))}
      </nav>
      <Card title={`${section.title}: ${localeNames[locale]}`} description={`${overrides.length} custom text(s) in this language.`}>
        <form action={saveContentOverrides} className="flex flex-col gap-4">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="back" value={`/admin/content?section=${section.prefix}&locale=${locale}`} />
          {keys.map((key) => {
            const fallback = defaults[key];
            const value = overrideMap.get(key) ?? fallback;
            const long = fallback.length > 80;
            return (
              <label key={key} className="grid gap-1.5 md:grid-cols-[260px_1fr] md:gap-4">
                <span className="flex flex-col pt-2 text-xs">
                  <code className="break-all text-mist/55">{key.slice(section.prefix.length)}</code>
                  {overrideMap.has(key) && <span className="text-ice">customised</span>}
                </span>
                <input type="hidden" name={`d:${key}`} value={fallback} />
                {long ? (
                  <textarea name={`v:${key}`} defaultValue={value} rows={3} dir={dir(locale)} className="field-input resize-y" />
                ) : (
                  <input name={`v:${key}`} defaultValue={value} dir={dir(locale)} className="field-input" />
                )}
              </label>
            );
          })}
          <div className="sticky bottom-4 mt-2">
            <SubmitButton>Save {section.title.toLowerCase()}</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
