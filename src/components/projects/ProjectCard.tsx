import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { PublicProject } from "@/server/services/content";
import { altFor } from "@/lib/media";
import type { Locale } from "@/lib/i18n/locales";
import { ImageKindNote, ProjectTags } from "./labels";

/** Large showcase card used by the home page stack. */
export async function ProjectCard({ project, index, locale }: { project: PublicProject; index: number; locale: Locale }) {
  const t = await getTranslations("projects");
  const imgs = project.images.slice(0, 3);
  const title = project.t?.title ?? project.slug;

  return (
    <article className="rounded-[32px] border-2 border-mist/80 bg-ink p-4 sm:rounded-[44px] sm:p-6 md:rounded-[56px] md:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="flex items-end gap-4 md:gap-6">
          <span aria-hidden className="text-[clamp(2.6rem,8vw,7.5rem)] font-black leading-[0.8] display-gradient">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="flex flex-col gap-2 pb-1">
            <ProjectTags category={project.category} origin={project.origin} stage={project.stage} />
            <h3 className="text-[clamp(1.4rem,3vw,2.6rem)] font-bold uppercase leading-tight tracking-tight text-mist">{title}</h3>
          </div>
        </div>
        <ViewLink href={`/projects/${project.slug}`} label={t("viewProject")} title={title} className="hidden md:inline-flex" />
      </div>

      {imgs.length > 0 && (
        <div className={`mt-5 grid gap-3 md:mt-7 ${imgs.length >= 3 ? "grid-cols-[2fr_3fr]" : imgs.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
          {imgs.length >= 3 ? (
            <>
              <div className="flex flex-col gap-3">
                <Frame img={imgs[0]} locale={locale} className="h-[clamp(110px,16vw,230px)]" />
                <Frame img={imgs[1]} locale={locale} className="h-[clamp(140px,22vw,330px)]" />
              </div>
              <Frame img={imgs[2]} locale={locale} className="h-full min-h-[260px]" />
            </>
          ) : (
            imgs.map((img) => <Frame key={img.id} img={img} locale={locale} className="h-[clamp(200px,34vw,480px)]" />)
          )}
        </div>
      )}
      <div className="mt-3 px-2">
        <ImageKindNote kinds={imgs.map((i) => i.kind)} />
      </div>
      <ViewLink href={`/projects/${project.slug}`} label={t("viewProject")} title={title} className="mt-4 flex w-full md:hidden" />
    </article>
  );
}

function ViewLink({ href, label, title, className }: { href: string; label: string; title: string; className: string }) {
  return (
    <Link
      href={href}
      className={`shrink-0 items-center justify-center rounded-full border-2 border-mist/80 px-7 py-3 text-sm font-medium uppercase tracking-widest text-mist transition-colors hover:bg-mist/10 sm:text-base ${className}`}
    >
      {label}
      <span className="sr-only">: {title}</span>
    </Link>
  );
}

function Frame({ img, locale, className }: { img: PublicProject["images"][number]; locale: Locale; className: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[24px] bg-ink-3 sm:rounded-[32px] md:rounded-[40px] ${className}`}>
      <Image
        src={img.media.url}
        alt={altFor(img.media.alt, locale)}
        fill
        sizes="(min-width: 768px) 50vw, 90vw"
        className="object-cover object-top"
      />
    </div>
  );
}
