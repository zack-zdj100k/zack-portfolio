import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GlowLink } from "@/components/ui/GlowButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectTags } from "@/components/projects/labels";
import type { Locale } from "@/lib/i18n/locales";
import { altFor } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";
import { getProjects } from "@/server/services/content";

export async function generateMetadata({ params }: PageProps<"/[locale]/projects">): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = await getTranslations({ locale, namespace: "projects" });
  return pageMetadata({ locale, path: "/projects", title: t("metaTitle"), description: t("metaDescription") });
}

const FILTERS = [
  { value: null, key: "all" },
  { value: "WEBSITE", key: "category.WEBSITE" },
  { value: "APP", key: "category.APP" },
  { value: "SOFTWARE", key: "category.SOFTWARE" },
] as const;

export default async function ProjectsPage({ params, searchParams }: PageProps<"/[locale]/projects">) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const type = (await searchParams).type;
  const active = FILTERS.find((f) => f.value && typeof type === "string" && f.value === type.toUpperCase())?.value ?? null;
  const [t, all] = await Promise.all([getTranslations("projects"), getProjects(locale)]);
  const projects = active ? all.filter((p) => p.category === active) : all;

  return (
    <div>
      <PageHeader title={t("title")} intro={t("intro")} />

      <div className="container-page pb-24 md:pb-32">
        {/* Filters are plain links (?type=…): they work without JavaScript and can be shared. */}
        <nav aria-label={t("filterLabel")} className="mb-10 md:mb-14">
          <ul className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const selected = f.value === active;
              return (
                <li key={f.key}>
                  <GlowLink
                    href={f.value ? { pathname: "/projects", query: { type: f.value.toLowerCase() } } : "/projects"}
                    ariaCurrent={selected ? "page" : undefined}
                    scroll={false}
                    selected={selected}
                  >
                    {t(f.key)}
                  </GlowLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {projects.length === 0 ? (
          <p className="rounded-[28px] border border-dashed border-line px-6 py-16 text-center text-mist/60">{t("empty")}</p>
        ) : (
          <ul className="grid gap-x-6 gap-y-14 md:grid-cols-2 md:gap-y-20">
            {projects.map((p, i) => {
              const cover = p.images.find((img) => (img.media.width ?? 1) >= (img.media.height ?? 1)) ?? p.images[0];
              const title = p.t?.title ?? p.slug;
              return (
                // Every third card spans both columns, to break the grid rhythm.
                <Reveal as="li" key={p.id} delay={(i % 2) * 0.08} className={i % 3 === 0 ? "md:col-span-2" : ""}>
                  <Link href={`/projects/${p.slug}`} className="group flex flex-col gap-5">
                    <div className={`relative overflow-hidden rounded-[28px] bg-ink-3 md:rounded-[40px] ${i % 3 === 0 ? "aspect-[16/9] md:aspect-[21/9]" : "aspect-[16/10]"}`}>
                      {cover && (
                        <Image
                          src={cover.media.url}
                          alt={altFor(cover.media.alt, locale)}
                          fill
                          sizes={i % 3 === 0 ? "(min-width: 768px) 90vw, 100vw" : "(min-width: 768px) 45vw, 100vw"}
                          className="object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-3 px-1">
                      <ProjectTags category={p.category} origin={p.origin} stage={p.stage} />
                      <h2 className="text-[clamp(1.6rem,3.2vw,2.8rem)] font-bold uppercase leading-tight tracking-tight text-mist underline-offset-8 group-hover:underline group-hover:decoration-ice/50">
                        {title}
                      </h2>
                      {p.t?.summary && <p className="max-w-2xl text-lg text-mist/70">{p.t.summary}</p>}
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
