import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactCard } from "@/components/contact/ContactCard";
import { WhoIWorkWith } from "@/components/about/WhoIWorkWith";
import { sortedCountries } from "@/lib/countries";
import type { Locale } from "@/lib/i18n/locales";
import { pageMetadata } from "@/lib/seo";
import { getAiServices, visitorCountry } from "@/server/services/content";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "contact" });
  return pageMetadata({ locale, path: "/contact", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function ContactPage({ params, searchParams }: PageProps<"/[locale]/contact">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const [t, country, ai] = await Promise.all([getTranslations("contact"), visitorCountry(), getAiServices(locale)]);
  // Arriving from the pricing slider: ?budget=…&type=website|app|software
  const query = await searchParams;
  const budget = typeof query.budget === "string" ? query.budget.slice(0, 120) : undefined;
  const type = typeof query.type === "string" && ["website", "app", "software"].includes(query.type) ? query.type.toUpperCase() : undefined;
  // Arriving from an AI service's button: ?service=ai-agents (only services available now).
  const service = typeof query.service === "string" ? ai.find((s) => s.key === query.service && s.status === "AVAILABLE") : undefined;

  return (
    <div>
      <PageHeader title={t("title")} intro={t("intro")} />
      <div className="container-page pb-24 md:pb-32">
        <div className="-mt-4 mb-12 md:-mt-8 md:mb-16">
          <WhoIWorkWith compact />
        </div>
        {/* Photo, direct channels (WhatsApp, phone, email, profiles), then the form */}
        <ContactCard locale={locale}>
          <section aria-labelledby="form-title" className="flex flex-col gap-6">
            <h2 id="form-title" className="text-sm uppercase tracking-widest text-mist/60">
              {t("formTitle")}
            </h2>
            <div className="rounded-[32px] border border-line bg-ink-2/60 p-6 sm:p-8 md:p-10">
              <ContactForm
                countries={sortedCountries(locale)}
                defaultCountry={country}
                defaultBudget={budget}
                defaultCategory={type}
                aiService={service ? { id: service.id, title: service.title } : undefined}
                headingId="form-title"
              />
            </div>
          </section>
        </ContactCard>
      </div>
    </div>
  );
}
