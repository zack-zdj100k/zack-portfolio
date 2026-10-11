import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { ExternalLink, PrimaryLink } from "@/components/ui/buttons";
import { ProjectTags } from "@/components/projects/labels";
import { DashboardTour } from "@/components/projects/DashboardTour";
import type { Locale } from "@/lib/i18n/locales";
import { altFor } from "@/lib/media";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { getProjectBySlug } from "@/server/services/content";

export async function generateMetadata({ params }: PageProps<"/[locale]/projects/[slug]">): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const data = await getProjectBySlug(slug, locale);
  if (!data) return {};
  const { project } = data;
  const cover = project.images[0]?.media.url;
  return pageMetadata({
    locale,
    path: `/projects/${slug}`,
    title: project.t?.title ?? slug,
    description: project.t?.summary ?? "",
    image: cover ? (cover.startsWith("http") ? cover : `${siteUrl}${cover}`) : null,
  });
}

export default async function ProjectPage({ params }: PageProps<"/[locale]/projects/[slug]">) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  setRequestLocale(locale);
  const data = await getProjectBySlug(slug, locale);
  if (!data) notFound();
  const { project, next, dashboard, testimonials } = data;
  const [t, tHome, tCommon, format] = await Promise.all([
    getTranslations("projects"),
    getTranslations("home"),
    getTranslations("common"),
    getFormatter(),
  ]);
  const d = project.t;
  const title = d?.title ?? project.slug;
  const wide = project.images.filter((i) => (i.media.width ?? 1) >= (i.media.height ?? 1));
  const tall = project.images.filter((i) => (i.media.width ?? 1) < (i.media.height ?? 1));
  const story = [
    ["problem", d?.problem],
    ["role", d?.role],
    ["solution", d?.solution],
    ["challenge", d?.challenge],
    ["outcome", d?.outcome],
  ].filter((x): x is [string, string] => !!x[1]);
  const linkLabel = { LIVE: t("detail.live"), DEMO: t("detail.demo"), REPO: t("detail.repo") } as const;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    description: d?.summary,
    url: `${siteUrl}/${locale}/projects/${project.slug}`,
    keywords: project.technologies.join(", "),
  };

  return (
    <article aria-labelledby="project-title">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="container-page pb-12 pt-8 md:pb-16 md:pt-12">
        <Link href="/projects" className="mb-10 inline-flex items-center gap-2 text-sm uppercase tracking-widest text-mist/60 hover:text-mist">
          <ArrowLeft aria-hidden className="size-4 rtl:-scale-x-100" />
          {t("detail.back")}
        </Link>
        <Reveal>
          <ProjectTags category={project.category} origin={project.origin} stage={project.stage} />
          <h1 id="project-title" className="mt-5 text-[clamp(2.8rem,10vw,9rem)] font-black uppercase leading-[0.9] tracking-tight display-gradient">
            {title}
          </h1>
        </Reveal>
        {d?.summary && (
          <Reveal delay={0.08}>
            <p className="mt-6 max-w-3xl text-xl leading-relaxed text-mist/80 md:text-2xl">{d.summary}</p>
          </Reveal>
        )}
        {project.links.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            {project.links.map((l) => (
              <ExternalLink key={l.id} href={l.url} newTabLabel={tCommon("newTab")}>
                {linkLabel[l.type]}
              </ExternalLink>
            ))}
          </div>
        )}
      </header>

      {/* Gallery: wide screenshots, then phone-sized captures side by side */}
      {project.images.length > 0 && (
        <section aria-label={t("detail.gallery")} className="container-page flex flex-col gap-4 md:gap-6">
          {wide.map((img, i) => (
            <Reveal key={img.id} delay={0.04 * i}>
              <figure className="flex flex-col gap-2">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[24px] bg-ink-3 md:rounded-[40px]">
                  <Image src={img.media.url} alt={altFor(img.media.alt, locale)} fill priority={i === 0} sizes="(min-width: 1400px) 1340px, 100vw" className="object-cover object-top" />
                </div>
                {img.kind !== "REAL" && <figcaption className="px-2 text-sm text-mist/60">{t(`imageKind.${img.kind}`)}</figcaption>}
              </figure>
            </Reveal>
          ))}
          {tall.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {tall.map((img) => (
                <figure key={img.id} className="flex flex-col gap-2">
                  <div className="relative aspect-[390/844] overflow-hidden rounded-[24px] border border-line bg-ink-3">
                    <Image src={img.media.url} alt={altFor(img.media.alt, locale)} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover object-top" />
                  </div>
                  {img.kind !== "REAL" && <figcaption className="px-1 text-sm text-mist/60">{t(`imageKind.${img.kind}`)}</figcaption>}
                </figure>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Facts + story */}
      <section className="container-page grid gap-12 py-20 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-20 md:py-28">
        <dl className="flex flex-col gap-6 self-start md:sticky md:top-28">
          <Fact label={t("detail.type")} value={t(`category.${project.category}`)} />
          <Fact label={t("detail.status")} value={t(`stage.${project.stage}`)} />
          {project.projectDate && <Fact label={t("detail.date")} value={format.dateTime(project.projectDate, { year: "numeric", month: "long" })} />}
          {project.technologies.length > 0 && (
            <div className="flex flex-col gap-2">
              <dt className="text-sm uppercase tracking-widest text-mist/60">{t("detail.technologies")}</dt>
              <dd>
                <ul className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <li key={tech} className="rounded-full border border-line px-3 py-1 text-sm text-mist/85">
                      {tech}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
        <div className="flex flex-col gap-14">
          {story.map(([key, text]) => (
            <Reveal key={key}>
              <h2 className="mb-4 text-[clamp(1.5rem,3vw,2.4rem)] font-bold uppercase text-mist">{t(`detail.${key}`)}</h2>
              <p className="max-w-2xl whitespace-pre-line text-lg leading-relaxed text-mist/75">{text}</p>
            </Reveal>
          ))}
          {d && d.features.length > 0 && (
            <Reveal>
              <h2 className="mb-6 text-[clamp(1.5rem,3vw,2.4rem)] font-bold uppercase text-mist">{t("detail.features")}</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {d.features.map((f) => (
                  <li key={f} className="rounded-2xl border border-line bg-ink-2 px-5 py-4 text-mist/85">
                    {f}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
          {testimonials.length > 0 && (
            <section aria-labelledby="feedback-title">
              <h2 id="feedback-title" className="mb-6 text-[clamp(1.5rem,3vw,2.4rem)] font-bold uppercase text-mist">
                {t("detail.feedback")}
              </h2>
              {testimonials.map((x) => (
                <figure key={x.id} className="border-s border-ice/60 ps-6">
                  <blockquote className="text-xl leading-relaxed text-mist">“{x.t?.quote}”</blockquote>
                  <figcaption className="mt-3 text-mist/60">
                    {x.authorName}
                    {x.authorRole ? `, ${x.authorRole}` : ""}
                  </figcaption>
                </figure>
              ))}
            </section>
          )}
        </div>
      </section>

      {/* The admin dashboard, icon by icon */}
      {dashboard.length > 0 && (
        <section aria-labelledby="dashboard-title" className="border-t border-line py-20 md:py-28">
          <div className="container-page flex flex-col gap-10 md:gap-14">
            <Reveal className="flex flex-col gap-5">
              <h2 id="dashboard-title" className="text-[clamp(2.2rem,6vw,5rem)] font-black uppercase leading-[0.95] tracking-tight display-gradient">
                {t("detail.dashboardTitle")}
              </h2>
              <p className="max-w-2xl text-lg leading-relaxed text-mist/75">{t("detail.dashboardIntro")}</p>
            </Reveal>
            <DashboardTour
              screens={dashboard}
              labels={{ screens: t("detail.screens"), demoNote: t("imageNote.DEMO"), conceptNote: t("imageNote.CONCEPT") }}
            />
          </div>
        </section>
      )}

      <section className="border-t border-line">
        <div className="container-page grid gap-10 py-16 md:grid-cols-2 md:items-end md:py-24">
          <div className="flex flex-col items-start gap-6">
            <h2 className="text-[clamp(2rem,4.5vw,3.8rem)] font-black uppercase leading-[0.95] text-mist">{t("detail.ctaTitle")}</h2>
            <PrimaryLink href="/contact">{tHome("hero.ctaPrimary")}</PrimaryLink>
          </div>
          {next && next.id !== project.id && (
            <Link href={`/projects/${next.slug}`} className="group flex flex-col items-start gap-2 md:items-end md:text-end">
              <span className="text-sm uppercase tracking-widest text-mist/60">{t("detail.next")}</span>
              <span className="flex items-center gap-3 text-[clamp(1.8rem,4vw,3.4rem)] font-black uppercase leading-none display-gradient">
                {next.t?.title ?? next.slug}
                <ArrowRight aria-hidden className="size-8 text-ice transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
              </span>
            </Link>
          )}
        </div>
      </section>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-sm uppercase tracking-widest text-mist/60">{label}</dt>
      <dd className="text-lg text-mist">{value}</dd>
    </div>
  );
}
