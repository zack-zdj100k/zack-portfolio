import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { GhostLink } from "@/components/ui/buttons";
import { ReferralExperience } from "@/components/referral/ReferralExperience";
import { sortedCountries } from "@/lib/countries";
import type { Locale } from "@/lib/i18n/locales";
import { pageMetadata } from "@/lib/seo";
import { getOffers, visitorCountry } from "@/server/services/content";

export async function generateMetadata({ params }: PageProps<"/[locale]/referral">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "referral" });
  return pageMetadata({ locale, path: "/referral", title: t("metaTitle"), description: t("metaDescription") });
}

const STEPS = [1, 2, 3] as const;

export default async function ReferralPage({ params }: PageProps<"/[locale]/referral">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const [t, tNav, offers, country] = await Promise.all([
    getTranslations("referral"),
    getTranslations("nav"),
    getOffers(locale),
    visitorCountry(),
  ]);

  return (
    <div>
      <PageHeader title={t("title")} intro={t("intro")} />

      <section aria-labelledby="how-title" className="container-page pb-20 md:pb-28">
        <h2 id="how-title" className="sr-only">
          {t("howTitle")}
        </h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((n, i) => (
            <Reveal
              as="li"
              key={n}
              delay={i * 0.08}
              className={`relative flex min-h-[220px] flex-col justify-end gap-3 overflow-hidden rounded-[28px] p-7 md:p-8 ${
                i === 1 ? "bg-mist text-ink" : "border border-line bg-ink-2 text-mist"
              }`}
            >
              <span aria-hidden className={`absolute end-6 top-2 text-[7rem] font-black leading-none ${i === 1 ? "text-ink/10" : "text-mist/[0.07]"}`}>
                {n}
              </span>
              <h3 className="text-2xl font-bold uppercase">{t(`step${n}Title`)}</h3>
              <p className={i === 1 ? "text-ink/75" : "text-mist/70"}>{t(`step${n}Body`)}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="container-page pb-24 md:pb-32">
        {offers.length === 0 ? (
          <div className="flex flex-col items-start gap-6 rounded-[28px] border border-line bg-ink-2 p-8 md:p-12">
            <p className="max-w-2xl text-xl text-mist">{t("pending")}</p>
            <GhostLink href="/contact">{tNav("contact")}</GhostLink>
          </div>
        ) : (
          <ReferralExperience
            countries={sortedCountries(locale)}
            defaultCountry={country}
            offers={offers}
          />
        )}
      </section>
    </div>
  );
}
