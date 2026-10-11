import { getTranslations } from "next-intl/server";
import { GlowLink } from "@/components/ui/GlowButton";
import { PackageCard, type CardPackage } from "@/components/pricing/PackageCard";
import { MarketTabs } from "@/components/pricing/MarketTabs";
import { countryName } from "@/lib/countries";
import type { Locale } from "@/lib/i18n/locales";
import { getPackages, getServices, visitorCountry } from "@/server/services/content";

const GROUPS = ["WEBSITE", "APP", "SOFTWARE", "CUSTOM"] as const;
type Group = (typeof GROUPS)[number];

/**
 * Market picker, then one section per kind of project (websites, mobile apps, desktop software, and
 * custom platforms when the admin has any), each package with its own price bar. A kind with no
 * listed package says so and offers a quote; no price is ever made up. Shared by the pricing page
 * and the home page.
 */
export async function PricingBlock({
  locale,
  marketParam,
}: {
  locale: Locale;
  marketParam?: string | null;
}) {
  const [t, packages, services, country] = await Promise.all([
    getTranslations("pricing"),
    getPackages(locale),
    getServices(locale),
    visitorCountry(),
  ]);

  // Markets that have at least one price, "*" (everyone else) last.
  const markets = [...new Set(packages.flatMap((p) => p.prices.map((x) => x.market)))].sort((a, b) =>
    a === "*" ? 1 : b === "*" ? -1 : a.localeCompare(b),
  );
  if (!markets.includes("*")) markets.push("*");
  const requested = marketParam ? marketParam.toUpperCase() : null;
  const market =
    requested && markets.includes(requested === "OTHER" ? "*" : requested)
      ? requested === "OTHER"
        ? "*"
        : requested
      : country && markets.includes(country)
        ? country
        : markets[0];
  const marketLabel = (m: string) => (m === "*" ? t("marketOther") : countryName(m, locale));

  const cardsFor = (market: string): (CardPackage & { group: Group })[] =>
    packages.map((p) => {
      const price = p.prices.find((x) => x.market === market) ?? p.prices.find((x) => x.market === "*") ?? null;
      const delivery = p.deliveryWeeksMin
        ? p.deliveryWeeksMax && p.deliveryWeeksMax !== p.deliveryWeeksMin
          ? t("deliveryRange", { min: p.deliveryWeeksMin, max: p.deliveryWeeksMax })
          : t("deliveryWeeks", { min: p.deliveryWeeksMin })
        : null;
      return {
        id: p.id,
        group: p.category ?? "CUSTOM",
        name: p.t?.name ?? "",
        description: p.t?.description ?? null,
        category: p.category,
        highlighted: p.highlighted,
        features: p.t?.features ?? [],
        addOns: p.t?.addOns ?? [],
        delivery,
        price: price ? { currency: price.currency, min: price.min, max: price.max, step: price.step } : null,
      };
    });

  const labels = {
    from: t.raw("from") as string,
    estimate: t("estimator.estimate"),
    less: t("estimator.less"),
    more: t("estimator.more"),
    sliderLabel: t.raw("estimator.sliderLabel") as string,
    includes: t("includes"),
    addOns: t("addOns"),
    delivery: t("delivery"),
    quote: t("quoteCta"),
    noPrice: t("noMarketPrice"),
  };
  const intro = (g: Group) => (g === "CUSTOM" ? null : (services.find((s) => s.category === g)?.t?.description ?? null));

  // One panel of packages per market; the picker switches between them without a server round trip.
  const panel = (market: string) => {
    const cards = cardsFor(market);
    const id = (g: Group) => `pricing-${market === "*" ? "other" : market.toLowerCase()}-${g}`;
    return (
      <div className="mt-12 flex flex-col gap-16 md:mt-16 md:gap-20">
        {GROUPS.map((g) => {
          const list = cards.filter((c) => c.group === g);
          // Custom platforms only appear when the admin has such a package.
          if (g === "CUSTOM" && list.length === 0) return null;
          return (
            <section key={g} aria-labelledby={id(g)} className="flex flex-col gap-6">
              <div className="flex flex-col gap-3 border-t border-line pt-8 md:flex-row md:items-end md:justify-between md:gap-10">
                <h3 id={id(g)} className="text-[clamp(1.8rem,4vw,3.2rem)] font-black uppercase leading-none tracking-tight text-mist">
                  {t(`groups.${g}`)}
                </h3>
                {intro(g) && <p className="max-w-md text-mist/65 md:text-end">{intro(g)}</p>}
              </div>
              {list.length > 0 ? (
                <ul className={`grid gap-4 md:grid-cols-2 ${list.length >= 3 ? "xl:grid-cols-3" : ""}`}>
                  {list.map((c) => (
                    <PackageCard key={c.id} pkg={c} labels={labels} locale={locale} />
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-start gap-5 rounded-[28px] border border-dashed border-line p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-2">
                    <p className="text-lg font-bold uppercase text-mist">{t("onRequest")}</p>
                    <p className="max-w-xl text-mist/65">{t("onRequestBody")}</p>
                  </div>
                  <GlowLink href={{ pathname: "/contact", query: { type: g.toLowerCase() } }} size="lg">
                    {t("quoteCta")}
                  </GlowLink>
                </div>
              )}
            </section>
          );
        })}
      </div>
    );
  };
  const shownMarkets = packages.length > 0 ? markets : [market];

  return (
    <>
      <MarketTabs
        label={t("marketLabel")}
        markets={shownMarkets.map((m) => ({ key: m, param: m === "*" ? "other" : m.toLowerCase(), name: marketLabel(m) }))}
        initial={market}
        panels={Object.fromEntries(shownMarkets.map((m) => [m, panel(m)]))}
      />

      <div className="mt-14 flex flex-col gap-5 rounded-[28px] border border-line bg-ink-2 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
        <p className="max-w-2xl text-mist/70">{t("estimator.disclaimer")}</p>
        <GlowLink href="/contact" size="lg">
          {t("quoteCta")}
        </GlowLink>
      </div>
    </>
  );
}
