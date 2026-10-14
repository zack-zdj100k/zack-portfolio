import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { DeviceFrame } from "@/components/ui/DeviceFrame";
import { ExternalLink, PrimaryLink } from "@/components/ui/buttons";
import { ProjectTags } from "@/components/projects/labels";
import { DashboardTour } from "@/components/projects/DashboardTour";
import { ArchitectureFlow } from "@/components/projects/ArchitectureFlow";
import { ArchitectureClouds } from "@/components/projects/ArchitectureClouds";

// true: the frontend / backend / database / flow texts open as clouds along an animated route.
// false: the original plain grid of texts.
const ARCH_CLOUDS = true;
import { dir, type Locale } from "@/lib/i18n/locales";
import { altFor } from "@/lib/media";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { getProjectBySlug, getSkillGroups } from "@/server/services/content";
import { DashboardRun } from "@/components/projects/DashboardRun";
import { TechTiles, techKey } from "@/components/projects/TechTiles";
import { FlowGraph } from "@/components/projects/FlowGraph";
import { SequenceDiagram } from "@/components/projects/SequenceDiagram";
import { roadmapsFor } from "@/lib/roadmaps";

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
  const { project, next, dashboard, architecture, testimonials } = data;
  // Technology tiles take the colour of the skill group they belong to.
  const groupOf: Record<string, number> = {};
  (await getSkillGroups(locale)).forEach((g, gi) => g.skills.forEach((s) => (groupOf[techKey(s.name)] ??= gi)));
  const [t, tHome, tCommon, format] = await Promise.all([
    getTranslations("projects"),
    getTranslations("home"),
    getTranslations("common"),
    getFormatter(),
  ]);
  const d = project.t;
  const title = d?.title ?? project.slug;
  const roadmaps = roadmapsFor(project.slug, locale);
  const hasArchitecture = !!architecture && (architecture.chain.length > 0 || !!architecture.frontend || !!architecture.backend || !!architecture.database || !!architecture.flow);
  const wide = project.images.filter((i) => (i.media.width ?? 1) >= (i.media.height ?? 1));
  const tall = project.images.filter((i) => (i.media.width ?? 1) < (i.media.height ?? 1));
  const story = [
    ["problem", d?.problem],
    ["role", d?.role],
    ["solution", d?.solution],
    ["challenge", d?.challenge],
    ["outcome", d?.outcome],
  ].filter((x): x is [string, string] => !!x[1]);
  // Address bar text: the project's own live domain when it has one, else its name (never someone else's site).
  const live = project.links.find((l) => l.type === "LIVE")?.url;
  const address = live ? live.replace(/^https?:\/\//, "").replace(/\/$/, "") : title;
  const tourLabels = {
    address: `${title} · admin`,
    kinds: { CONCEPT: t("imageKind.CONCEPT"), DEMO: t("imageKind.DEMO"), VISUAL_EXPLORATION: t("imageKind.VISUAL_EXPLORATION") },
    notes: { CONCEPT: t("imageNote.CONCEPT"), DEMO: t("imageNote.DEMO"), VISUAL_EXPLORATION: t("imageNote.VISUAL_EXPLORATION") },
  };
  const hasMarkers = dashboard.some((s) => s.hotspots.length > 0);
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

      {/* Gallery: wide screenshots in a Mac-style window (the first on a laptop), then phone captures */}
      {project.images.length > 0 && (
        <section aria-label={t("detail.gallery")} className="container-page flex flex-col gap-8 md:gap-14">
          {wide.map((img, i) => (
            <Reveal key={img.id} delay={0.04 * i}>
              <figure>
                <DeviceFrame
                  variant={i === 0 ? "laptop" : "browser"}
                  address={address}
                  badge={img.kind !== "REAL" ? t(`imageKind.${img.kind}`) : null}
                  className={i === 0 ? "md:px-[3%]" : ""}
                >
                  <Image
                    src={img.media.url}
                    alt={altFor(img.media.alt, locale)}
                    width={img.media.width ?? 1600}
                    height={img.media.height ?? 1000}
                    priority={i === 0}
                    sizes="(min-width: 1400px) 1340px, 100vw"
                    className="block h-auto w-full"
                  />
                </DeviceFrame>
              </figure>
            </Reveal>
          ))}
          {tall.length > 0 && (
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              {tall.map((img) => (
                <figure key={img.id} className="flex w-[min(78vw,300px)] flex-col items-center gap-3">
                  <div className="relative w-full overflow-hidden rounded-[38px] border-[7px] border-[#1d2024] bg-ink-3 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.8)] ring-1 ring-white/10">
                    <span aria-hidden className="absolute left-1/2 top-2 z-10 h-4 w-[30%] -translate-x-1/2 rounded-full bg-[#0b0c0d]" />
                    <Image
                      src={img.media.url}
                      alt={altFor(img.media.alt, locale)}
                      width={img.media.width ?? 780}
                      height={img.media.height ?? 1688}
                      sizes="300px"
                      className="block h-auto w-full"
                    />
                  </div>
                  {img.kind !== "REAL" && <figcaption className="text-sm text-mist/60">{t(`imageKind.${img.kind}`)}</figcaption>}
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
                <TechTiles technologies={project.technologies} groupOf={groupOf} label={t("detail.technologies")} />
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

      {/* How it's built: plain-language architecture, request-flow graph, then the project's roadmap diagrams */}
      {(hasArchitecture || roadmaps.length > 0) && (
        <section aria-labelledby="arch-title" className="border-t border-line py-20 md:py-28">
          <div className="container-page flex flex-col gap-10 md:gap-14">
            <Reveal className="flex flex-col gap-5">
              <h2 id="arch-title" className="text-[clamp(2.2rem,6vw,5rem)] font-black uppercase leading-[0.95] tracking-tight display-gradient">
                {t("arch.title")}
              </h2>
              <p className="max-w-2xl text-lg leading-relaxed text-mist/75">{t("arch.intro")}</p>
              {architecture?.proposed && (
                <p className="flex max-w-2xl flex-col gap-1 rounded-2xl border border-ice/30 bg-ice/5 px-5 py-4 text-sm text-mist/80">
                  <span className="font-bold uppercase tracking-wider text-ice">{t("arch.proposed")}</span>
                  {t("arch.proposedNote")}
                </p>
              )}
            </Reveal>
            {architecture && architecture.chain.length > 0 && (
              <ArchitectureFlow
                chain={architecture.chain}
                rtl={dir(locale) === "rtl"}
                labels={{
                  graph: t("arch.graph"),
                  branchOf: t("arch.branches"),
                  kinds: {
                    CLIENT: t("arch.kinds.CLIENT"),
                    FRONTEND: t("arch.kinds.FRONTEND"),
                    API: t("arch.kinds.API"),
                    BACKEND: t("arch.kinds.BACKEND"),
                    DATABASE: t("arch.kinds.DATABASE"),
                    EXTERNAL: t("arch.kinds.EXTERNAL"),
                  },
                }}
              />
            )}
            {architecture && ARCH_CLOUDS && (
              <ArchitectureClouds
                label={t("arch.flow")}
                rtl={dir(locale) === "rtl"}
                stops={(
                  [
                    ["flow", "CLIENT", architecture.flow],
                    ["frontend", "FRONTEND", architecture.frontend],
                    ["backend", "BACKEND", architecture.backend],
                    ["database", "DATABASE", architecture.database],
                  ] as const
                )
                  .filter(([, , text]) => text)
                  .map(([key, kind, text]) => ({ key, station: t(`arch.kinds.${kind}`), title: t(`arch.${key}`), text: text as string }))}
              />
            )}
            {architecture && !ARCH_CLOUDS && (
              <dl className="grid gap-x-12 gap-y-10 md:grid-cols-2">
                {(
                    [
                    ["frontend", architecture.frontend],
                    ["backend", architecture.backend],
                    ["database", architecture.database],
                    ["flow", architecture.flow],
                  ] as const
                )
                  .filter(([, text]) => text)
                  .map(([key, text]) => (
                    <Reveal key={key} className="flex flex-col gap-3 border-t border-line pt-5">
                      <dt className="text-sm uppercase tracking-widest text-mist/60">{t(`arch.${key}`)}</dt>
                      <dd className="whitespace-pre-line text-lg leading-relaxed text-mist/85">{text}</dd>
                    </Reveal>
                  ))}
              </dl>
            )}
            {roadmaps.length > 0 && (
              <div className="flex flex-col gap-10 border-t border-line pt-10 md:gap-14 md:pt-12">
                <Reveal className="flex flex-col gap-3">
                  <h3 className="text-[clamp(1.6rem,3.5vw,2.6rem)] font-black uppercase leading-none text-mist">{t("arch.roadmap")}</h3>
                  <p className="max-w-2xl text-lg leading-relaxed text-mist/75">{t("arch.roadmapIntro")}</p>
                </Reveal>
                {roadmaps.map((r) => (
                  <figure key={r.key} className="flex flex-col gap-8">
                    <figcaption className="flex flex-col gap-2">
                      <span className="text-xl font-bold text-mist md:text-2xl">{r.title}</span>
                      <span className="max-w-2xl leading-relaxed text-mist/70">{r.intro}</span>
                    </figcaption>
                    {r.diagram.type === "flow" ? (
                      <FlowGraph diagram={r.diagram} labels={{ title: r.title, leadsTo: t("arch.leadsTo") }} />
                    ) : (
                      <SequenceDiagram diagram={r.diagram} labels={{ title: r.title, self: t("arch.self") }} />
                    )}
                  </figure>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

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
            {/* The scroll-synced run (laptop, tablet or phone frame by screen size). Reduced motion: tabs + list. */}
            {hasMarkers && (
              <div className="hidden motion-safe:block">
                <DashboardRun screens={dashboard} labels={tourLabels} />
              </div>
            )}
            <div className={hasMarkers ? "motion-safe:hidden" : ""}>
              <DashboardTour screens={dashboard} labels={{ ...tourLabels, screens: t("detail.screens") }} />
            </div>
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
