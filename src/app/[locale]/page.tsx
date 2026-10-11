import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HeroStage } from "@/components/hero/HeroStage";
import type { HeroAssets, HeroMode } from "@/components/hero/types";
import { ProjectStrip } from "@/components/home/ProjectStrip";
import { ProjectStack } from "@/components/projects/ProjectStack";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Reveal } from "@/components/ui/Reveal";
import { GhostLink } from "@/components/ui/buttons";
import { ServiceCards } from "@/components/pricing/ServiceCards";
import { LampAbout } from "@/components/home/LampAbout";
import { IdBadge } from "@/components/about/IdBadge";
import { SkillsTable } from "@/components/about/SkillsTable";
import { profileBits } from "@/components/about/profile-bits";
import { HowItWorks } from "@/components/about/HowItWorks";
import { PricingBlock } from "@/components/pricing/PricingBlock";
import { GoodToKnow } from "@/components/pricing/GoodToKnow";
import { ContactCard } from "@/components/contact/ContactCard";
import { ContactForm } from "@/components/contact/ContactForm";
import { sortedCountries } from "@/lib/countries";
import type { Locale } from "@/lib/i18n/locales";
import { pageMetadata } from "@/lib/seo";
import { getOffers, getProfile, getProjects, getServices, getSettings, visitorCountry } from "@/server/services/content";
import heroManifest from "../../../public/hero/manifest.json";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const [t, profile] = await Promise.all([getTranslations({ locale, namespace: "home" }), getProfile(locale)]);
  return pageMetadata({
    locale,
    path: "/",
    title: `${profile?.publicName ?? "ZACK"} | ${profile?.title ?? ""}`,
    description: t("metaDescription"),
  });
}

const HERO_MODES: HeroMode[] = ["DEPTH", "SEQUENCE", "MODEL"];
const STEPS = ["understand", "plan", "build", "review", "improve"] as const;

export default async function HomePage({ params, searchParams }: PageProps<"/[locale]">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const query = await searchParams;

  const [t, tAbout, tPricing, tContact, profile, { settings }, projects, services, offers, bits, country] = await Promise.all([
    getTranslations("home"),
    getTranslations("about"),
    getTranslations("pricing"),
    getTranslations("contact"),
    getProfile(locale),
    getSettings(),
    getProjects(locale),
    getServices(locale),
    getOffers(locale),
    profileBits(locale),
    visitorCountry(),
  ]);
  const note = (k: "scope" | "hosting" | "maintenance" | "goal") => ({ title: tPricing(`notes.${k}Title`), body: tPricing(`notes.${k}Body`) });
  const name = profile?.publicName ?? "ZACK";

  // ?hero=depth|sequence|model lets the owner compare the three options without saving.
  const requested = typeof query.hero === "string" ? (query.hero.toUpperCase() as HeroMode) : null;
  const mode: HeroMode = requested && HERO_MODES.includes(requested) ? requested : (settings?.heroMode ?? "DEPTH");

  const assets: HeroAssets = {
    image: settings?.heroImage
      ? { src: settings.heroImage.url, width: settings.heroImage.width ?? 1280, height: settings.heroImage.height ?? 1280 }
      : { src: "/hero/face-1280.webp", width: heroManifest.face.width, height: heroManifest.face.height },
    depthMap: settings?.heroDepth?.url ?? "/hero/depth.png",
    frames:
      settings && settings.heroFrames.length > 1
        ? settings.heroFrames.map((f) => f.media.url)
        : heroManifest.turn.frames.map((f) => `/hero/turn/${f}`),
    frameSize:
      settings && settings.heroFrames.length > 1
        ? { width: settings.heroFrames[0].media.width ?? 560, height: settings.heroFrames[0].media.height ?? 926 }
        : { width: heroManifest.turn.width, height: heroManifest.turn.height },
    startFrame: 0,
    model: settings?.heroModel?.url ?? null,
  };

  const featured = (projects.some((p) => p.featured) ? projects.filter((p) => p.featured) : projects).slice(0, 4);
  const stripImages = projects.flatMap((p) =>
    p.images.map((i) => ({ src: i.media.url, width: i.media.width ?? 1600, height: i.media.height ?? 1000 })),
  );

  return (
    <>
      <HeroStage
        mode={mode}
        assets={assets}
        copy={{
          greeting: t("hero.greeting"),
          name,
          title: profile?.title ?? "",
          ctaPrimary: t("hero.ctaPrimary"),
          ctaSecondary: t("hero.ctaSecondary"),
          reveal: [t("hero.reveal1"), t("hero.reveal2"), t("hero.reveal3")],
          imageAlt: t("hero.imageAlt", { name }),
        }}
      />

      <ProjectStrip images={stripImages} />

      {/* About: a pull-cord lamp lights up the content */}
      {/* The light cone is wider than a phone screen; clip it there so the page never scrolls sideways. */}
      <section aria-labelledby="about-title" className="container-page py-20 max-md:overflow-x-clip md:py-32">
        <LampAbout labels={{ on: t("about.lampOn"), off: t("about.lampOff"), hint: t("about.lampHint") }}>
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="flex flex-col gap-8">
              <h2 id="about-title" className="text-[clamp(3rem,7.5vw,6.5rem)] font-black uppercase leading-none tracking-tight display-gradient">
                {t("about.title")}
              </h2>
              {profile?.intro && <p className="max-w-[38rem] text-[clamp(1.1rem,1.8vw,1.4rem)] leading-relaxed text-mist">{profile.intro}</p>}
              <div>
                <h3 className="mb-4 text-sm uppercase tracking-widest text-mist/60">{bits.factsTitle}</h3>
                <dl className="grid max-w-xl gap-x-8 gap-y-3 sm:grid-cols-[auto_1fr]">
                  {bits.facts.map((f) => (
                    <div key={f.label} className="contents">
                      <dt className="text-mist/60">{f.label}</dt>
                      <dd className="text-mist">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <GhostLink href="/about">{t("about.cta")}</GhostLink>
              </div>
            </div>
            <IdBadge data={bits.badge} className="lg:-mt-24" />
          </div>
        </LampAbout>
      </section>

      {/* Skills as a periodic table */}
      {bits.skillGroups.length > 0 && (
        <section className="container-page pb-24 md:pb-32">
          <SkillsTable groups={bits.skillGroups} labels={bits.stackLabels} />
        </section>
      )}

      {/* How I work: the process, as pinned notes */}
      <section aria-labelledby="work-title" className="container-page pb-24 md:pb-32">
        <Reveal>
          <h2 id="work-title" className="text-[clamp(2.4rem,7vw,6rem)] font-black uppercase leading-none tracking-tight display-gradient">
            {tAbout("howIWork.title")}
          </h2>
        </Reveal>
        <HowItWorks steps={STEPS.map((k) => ({ title: tAbout(`howIWork.${k}Title`), description: tAbout(`howIWork.${k}Body`) }))} />
      </section>

      {/* Selected projects */}
      {featured.length > 0 && (
        <section
          aria-labelledby="projects-title"
          className="relative z-10 rounded-t-[40px] bg-ink pb-10 pt-16 sm:rounded-t-[50px] md:rounded-t-[60px] md:pt-24"
        >
          <div className="container-page">
            <Reveal>
              <h2
                id="projects-title"
                className="mb-10 max-w-5xl text-[clamp(2.6rem,7vw,6.5rem)] font-black uppercase leading-[0.92] tracking-tight display-gradient [text-wrap:balance] md:mb-16"
              >
                {t("projects.title")}
              </h2>
            </Reveal>
            <ProjectStack
              cards={await Promise.all(featured.map(async (p, i) => <ProjectCard key={p.id} project={p} index={i} locale={locale} />))}
            />
            <div className="mt-10 flex justify-center md:mt-16">
              <GhostLink href="/projects">{t("projects.cta")}</GhostLink>
            </div>
          </div>
        </section>
      )}

      {/* Services: the one light surface on the page */}
      {services.length > 0 && (
        <section
          aria-labelledby="services-title"
          className="surface-paper relative z-20 rounded-t-[40px] bg-paper px-0 py-20 text-paper-ink sm:rounded-t-[50px] sm:py-24 md:rounded-t-[60px] md:py-32"
        >
          <div className="container-page">
            <Reveal>
              <h2 id="services-title" className="mb-12 text-center text-[clamp(3rem,12vw,10rem)] font-black uppercase leading-none tracking-tight sm:mb-16 md:mb-24">
                {t("services.title")}
              </h2>
            </Reveal>
            <ServiceCards services={services} />
            <div className="mt-12 flex justify-center md:mt-16">
              <GhostLink href="/services-pricing" tone="paper">
                {t("services.cta")}
              </GhostLink>
            </div>
          </div>
        </section>
      )}

      {/* Pricing: market, budget slider and packages, then what every project includes */}
      <section
        id="pricing"
        aria-labelledby="pricing-title"
        className="relative z-30 -mt-10 rounded-t-[40px] bg-ink py-20 sm:rounded-t-[50px] md:rounded-t-[60px] md:py-28"
      >
        <div className="container-page">
          <Reveal>
            <h2 id="pricing-title" className="text-[clamp(2.6rem,8vw,7rem)] font-black uppercase leading-none tracking-tight display-gradient">
              {tPricing("pricingTitle")}
            </h2>
          </Reveal>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-mist/75">{tPricing("pricingIntro")}</p>
          <PricingBlock locale={locale} marketParam={typeof query.market === "string" ? query.market : null} basePath="/" />
          <div className="mt-20 md:mt-28">
            <h3 className="mb-8 text-[clamp(1.8rem,4vw,3.2rem)] font-black uppercase leading-none text-mist">{tPricing("notes.title")}</h3>
            <GoodToKnow scope={note("scope")} hosting={note("hosting")} maintenance={note("maintenance")} goal={note("goal")} cta={tPricing("quoteCta")} />
          </div>
        </div>
      </section>

      {/* Referral teaser: only once an offer is published (or in admin preview) */}
      {offers.length > 0 && (
        <section aria-labelledby="referral-title" className="relative z-30 bg-ink">
          <div className="container-page grid gap-8 border-t border-line py-20 md:grid-cols-[1.3fr_1fr] md:items-end md:py-28">
            <Reveal>
              <h2 id="referral-title" className="text-[clamp(2.6rem,7vw,6.5rem)] font-black uppercase leading-[0.92] tracking-tight display-gradient">
                {t("referral.title")}
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="flex flex-col items-start gap-6">
              <p className="max-w-md text-lg leading-relaxed text-mist/80">{t("referral.body")}</p>
              <GhostLink href="/referral">{t("referral.cta")}</GhostLink>
            </Reveal>
          </div>
        </section>
      )}

      {/* Contact: photo, every direct channel, and the inquiry form */}
      <section id="contact" aria-labelledby="contact-title" className="relative z-30 bg-ink">
        <div className="container-page flex flex-col gap-12 border-t border-line py-20 md:gap-20 md:py-32">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <Reveal>
              <h2 id="contact-title" className="max-w-4xl text-[clamp(2.6rem,8vw,7rem)] font-black uppercase leading-[0.92] tracking-tight text-mist">
                {t("contact.title")}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="max-w-md text-lg text-mist/75">{t("contact.body")}</p>
            </Reveal>
          </div>
          <ContactCard locale={locale} headingLevel={3}>
            <div className="flex flex-col gap-6">
              <h3 id="home-form-title" className="text-sm uppercase tracking-widest text-mist/60">
                {tContact("formTitle")}
              </h3>
              <div className="rounded-[32px] border border-line bg-ink-2/60 p-6 sm:p-8 md:p-10">
                <ContactForm countries={sortedCountries(locale)} defaultCountry={country} headingId="home-form-title" />
              </div>
            </div>
          </ContactCard>
        </div>
      </section>
    </>
  );
}
