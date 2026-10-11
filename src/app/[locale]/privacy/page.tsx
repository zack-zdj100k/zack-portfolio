import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Locale } from "@/lib/i18n/locales";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return pageMetadata({ locale, path: "/privacy", title: t("metaTitle"), description: t("intro") });
}

const SECTIONS = ["collect", "use", "keep", "rights", "cookies"] as const;

export default async function PrivacyPage({ params }: PageProps<"/[locale]/privacy">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations("privacy");
  return (
    <article>
      <PageHeader title={t("title")} intro={t("intro")} />
      <div className="container-page flex max-w-3xl flex-col gap-10 pb-24 md:pb-32">
        {SECTIONS.map((s) => (
          <section key={s}>
            <h2 className="mb-3 text-2xl font-bold uppercase text-mist">{t(`${s}Title`)}</h2>
            <p className="text-lg leading-relaxed text-mist/75">{t(`${s}Body`)}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
