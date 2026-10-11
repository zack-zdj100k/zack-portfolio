import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { ServiceCards } from "@/components/pricing/ServiceCards";
import { GoodToKnow } from "@/components/pricing/GoodToKnow";
import { PricingBlock } from "@/components/pricing/PricingBlock";
import type { Locale } from "@/lib/i18n/locales";
import { pageMetadata } from "@/lib/seo";
import { AiServices } from "@/components/ai/AiServices";
import { AdminPreview } from "@/components/showcase/AdminPreview";
import { WhoIWorkWith } from "@/components/about/WhoIWorkWith";
import { sortedCountries } from "@/lib/countries";
import { getAiServices, getServices, visitorCountry } from "@/server/services/content";

export async function generateMetadata({ params }: PageProps<"/[locale]/services-pricing">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "pricing" });
  return pageMetadata({ locale, path: "/services-pricing", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function ServicesPricingPage({ params, searchParams }: PageProps<"/[locale]/services-pricing">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const query = await searchParams;
  const [t, services, ai, country] = await Promise.all([getTranslations("pricing"), getServices(locale), getAiServices(locale), visitorCountry()]);

  const note = (k: "scope" | "hosting" | "maintenance" | "goal") => ({ title: t(`notes.${k}Title`), body: t(`notes.${k}Body`) });

  return (
    <div>
      <PageHeader title={t("title")} intro={t("intro")} />
      <section className="container-page pb-20 md:pb-28">
        <WhoIWorkWith />
      </section>

      <section aria-labelledby="services-title" className="surface-paper rounded-t-[40px] bg-paper py-20 text-ink md:rounded-t-[60px] md:py-28">
        <div className="container-page">
          <h2 id="services-title" className="mb-12 text-[clamp(2.4rem,8vw,7rem)] font-black uppercase leading-none tracking-tight md:mb-20">
            {t("servicesTitle")}
          </h2>
          <ServiceCards services={services} showExamples />
        </div>
      </section>

      {ai.length > 0 && (
        <section aria-labelledby="ai-title" className="relative -mt-8 rounded-t-[40px] bg-ink pb-12 pt-20 md:rounded-t-[60px] md:pb-16 md:pt-28">
          <div className="container-page">
            <AiServices services={ai} countries={sortedCountries(locale)} defaultCountry={country} />
          </div>
        </section>
      )}

      <section
        aria-labelledby="showcase-title"
        className={`relative bg-ink py-20 md:py-28 ${ai.length > 0 ? "border-t border-line" : "-mt-8 rounded-t-[40px] md:rounded-t-[60px]"}`}
      >
        <div className="container-page">
          <AdminPreview />
        </div>
      </section>

      <section
        aria-labelledby="pricing-title"
        className="relative border-t border-line bg-ink py-20 md:py-28"
      >
        <div className="container-page">
          <h2 id="pricing-title" className="text-[clamp(2.4rem,8vw,7rem)] font-black uppercase leading-none tracking-tight display-gradient">
            {t("pricingTitle")}
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-mist/75">{t("pricingIntro")}</p>

          <PricingBlock locale={locale} marketParam={typeof query.market === "string" ? query.market : null} />

          <div className="mt-20 md:mt-28">
            <h2 className="mb-8 text-[clamp(1.8rem,4vw,3.2rem)] font-black uppercase leading-none text-mist">{t("notes.title")}</h2>
            <GoodToKnow scope={note("scope")} hosting={note("hosting")} maintenance={note("maintenance")} goal={note("goal")} cta={t("quoteCta")} />
          </div>
        </div>
      </section>
    </div>
  );
}
