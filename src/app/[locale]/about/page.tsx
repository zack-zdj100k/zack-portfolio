import type { Metadata } from "next";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { GhostLink, PrimaryLink } from "@/components/ui/buttons";
import { IdBadge } from "@/components/about/IdBadge";
import { SkillsTable } from "@/components/about/SkillsTable";
import { WhatIBuild } from "@/components/about/WhatIBuild";
import { HowItWorks } from "@/components/about/HowItWorks";
import { profileBits } from "@/components/about/profile-bits";
import type { Locale } from "@/lib/i18n/locales";
import { pageMetadata } from "@/lib/seo";
import { getExperience } from "@/server/services/content";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "about" });
  return pageMetadata({ locale, path: "/about", title: t("metaTitle"), description: t("metaDescription") });
}

const BUILD = ["websites", "apps", "software"] as const;
const STEPS = ["understand", "plan", "build", "review", "improve"] as const;

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const [t, tHome, format, experience, bits] = await Promise.all([
    getTranslations("about"),
    getTranslations("home"),
    getFormatter(),
    getExperience(locale),
    profileBits(locale),
  ]);
  const { profile } = bits;
  if (!profile) return null;

  return (
    <article aria-labelledby="page-title">
      <PageHeader title={t("title")} />

      {/* ID badge + bio + quick facts */}
      <section className="container-page grid items-start gap-12 pb-20 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 md:pb-32">
        <IdBadge data={bits.badge} className="md:-mt-10" />
        <div className="flex flex-col gap-8 md:pt-16">
          <Reveal>
            <p className="text-[clamp(2rem,4.5vw,3.6rem)] font-bold uppercase leading-none tracking-tight text-mist">
              {profile.fullName ?? profile.publicName}
            </p>
          </Reveal>
          {profile.bio && (
            <Reveal delay={0.05}>
              <p className="max-w-2xl text-lg leading-relaxed text-mist/80 md:text-xl">{profile.bio}</p>
            </Reveal>
          )}
          <Reveal delay={0.1}>
            <h2 className="mb-4 text-sm uppercase tracking-widest text-mist/60">{bits.factsTitle}</h2>
            <dl className="grid gap-x-8 gap-y-5 border-t border-line pt-6 sm:grid-cols-2">
              {bits.facts.map((f) => (
                <div key={f.label} className="flex flex-col gap-1">
                  <dt className="text-sm uppercase tracking-widest text-mist/60">{f.label}</dt>
                  <dd className="text-mist">{f.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      <WhatIBuild
        title={t("whatIBuild.title")}
        intro={t("whatIBuild.intro")}
        items={BUILD.map((key) => ({ title: t(`whatIBuild.${key}Title`), body: t(`whatIBuild.${key}Body`) }))}
      />

      {/* How I work: pinned notes */}
      <section aria-labelledby="work-title" className="py-20 md:py-28">
        <div className="container-page">
          <h2 id="work-title" className="text-[clamp(2.4rem,7vw,6rem)] font-black uppercase leading-none tracking-tight display-gradient">
            {t("howIWork.title")}
          </h2>
          <HowItWorks steps={STEPS.map((s) => ({ title: t(`howIWork.${s}Title`), description: t(`howIWork.${s}Body`) }))} />
        </div>
      </section>

      {/* Skills: periodic table */}
      {bits.skillGroups.length > 0 && (
        <section className="container-page pb-20 md:pb-28">
          <SkillsTable groups={bits.skillGroups} labels={bits.stackLabels} />
        </section>
      )}

      {/* Experience: only owner-provided entries */}
      {experience.length > 0 && (
        <section aria-labelledby="exp-title" className="container-page pb-20 md:pb-28">
          <h2 id="exp-title" className="mb-10 text-[clamp(2rem,5vw,4rem)] font-black uppercase leading-none text-mist">
            {t("experience.title")}
          </h2>
          <ol className="flex flex-col">
            {experience.map((e) => (
              <li key={e.id} className="grid gap-2 border-t border-line py-6 md:grid-cols-[220px_1fr]">
                <p className="text-mist/60">
                  {format.dateTime(e.startDate, { year: "numeric", month: "short" })} -{" "}
                  {e.endDate ? format.dateTime(e.endDate, { year: "numeric", month: "short" }) : t("experience.present")}
                </p>
                <div>
                  <h3 className="text-xl font-bold text-mist">
                    {e.t?.role}
                    {e.organization ? `, ${e.organization}` : ""}
                  </h3>
                  {e.t?.description && <p className="mt-2 max-w-2xl text-mist/70">{e.t.description}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {profile.whyMe.length > 0 && (
        <section className="container-page pb-20 md:pb-28">
          <h2 className="mb-8 text-[clamp(2rem,4vw,3.4rem)] font-black uppercase leading-none text-mist">{t("whyMe.title")}</h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {profile.whyMe.map((w) => (
              <li key={w} className="border-s border-ice/60 ps-4 text-lg text-mist/85">
                {w}
              </li>
            ))}
          </ul>
        </section>
      )}

      {profile.interest && (
        <section className="container-page pb-20">
          <h2 className="mb-4 text-2xl font-bold uppercase text-mist">{t("interest.title")}</h2>
          <p className="max-w-2xl text-lg text-mist/75">{profile.interest}</p>
        </section>
      )}

      <section className="container-page flex flex-col items-start gap-8 border-t border-line py-20 md:flex-row md:items-end md:justify-between md:py-28">
        <h2 className="max-w-3xl text-[clamp(2.2rem,6vw,5rem)] font-black uppercase leading-[0.95] text-mist">{t("cta.title")}</h2>
        <div className="flex flex-wrap gap-3">
          <PrimaryLink href="/contact">{tHome("hero.ctaPrimary")}</PrimaryLink>
          <GhostLink href="/projects">{t("cta.projects")}</GhostLink>
        </div>
      </section>
    </article>
  );
}
