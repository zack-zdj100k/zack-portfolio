import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactCard } from "@/components/contact/ContactCard";
import { sortedCountries } from "@/lib/countries";
import type { Locale } from "@/lib/i18n/locales";
import { pageMetadata } from "@/lib/seo";
import { visitorCountry } from "@/server/services/content";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "contact" });
  return pageMetadata({ locale, path: "/contact", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function ContactPage({ params, searchParams }: PageProps<"/[locale]/contact">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const [t, country] = await Promise.all([getTranslations("contact"), visitorCountry()]);
  // Arriving from the pricing slider: ?budget=…&type=website|app|software
  const query = await searchParams;
  const budget = typeof query.budget === "string" ? query.budget.slice(0, 120) : undefined;
  const type = typeof query.type === "string" && ["website", "app", "software"].includes(query.type) ? query.type.toUpperCase() : undefined;

  return (
    <div>
      <PageHeader title={t("title")} intro={t("intro")} />
      <div className="container-page pb-24 md:pb-32">
        {/* Photo, direct channels (WhatsApp, phone, email, profiles), then the form */}
        <ContactCard locale={locale}>
          <section aria-labelledby="form-title" className="flex flex-col gap-6">
            <h2 id="form-title" className="text-sm uppercase tracking-widest text-mist/60">
              {t("formTitle")}
            </h2>
            <div className="rounded-[32px] border border-line bg-ink-2/60 p-6 sm:p-8 md:p-10">
              <ContactForm countries={sortedCountries(locale)} defaultCountry={country} defaultBudget={budget} defaultCategory={type} headingId="form-title" />
            </div>
          </section>
        </ContactCard>
      </div>
    </div>
  );
}
