import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight, Hourglass, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";
import type { PublicAiService } from "@/server/services/content";
import { AI_ICONS } from "./ai-icons";
import { WaitlistForm } from "./WaitlistForm";

/**
 * AI services in two clearly separate groups: what is offered now, and what is coming. Coming Soon
 * items never get a price or a "start" button, only an optional waitlist. Finance and trading items
 * carry a fixed "no financial advice, no promised returns" note.
 */
export async function AiServices({
  services,
  countries,
  defaultCountry,
  headingLevel = 2,
}: {
  services: PublicAiService[];
  countries: { code: string; name: string }[];
  defaultCountry: string | null;
  headingLevel?: 2 | 3;
}) {
  if (services.length === 0) return null;
  const t = await getTranslations("ai");
  const tPricing = await getTranslations("pricing");
  const available = services.filter((s) => s.status === "AVAILABLE");
  const soon = services.filter((s) => s.status === "COMING_SOON");
  const H = `h${headingLevel}` as const;
  const Sub = `h${headingLevel + 1}` as "h3" | "h4";

  return (
    <div className="flex flex-col gap-14">
      <Reveal className="flex flex-col gap-5">
        <H id="ai-title" className="text-[clamp(2.4rem,7vw,6rem)] font-black uppercase leading-none tracking-tight display-gradient">
          {t("title")}
        </H>
        <p className="max-w-2xl text-lg leading-relaxed text-mist/75">{t("intro")}</p>
      </Reveal>

      {available.length > 0 && (
        <div>
          <Sub className="mb-5 flex items-center gap-2.5 text-sm uppercase tracking-widest text-mist/70">
            <span aria-hidden className="size-2 rounded-full bg-ok shadow-[0_0_0_4px_rgb(159_224_184/0.18)]" />
            {t("available")}
          </Sub>
          <ul className="grid gap-4 md:grid-cols-2">
            {available.map((s, i) => {
              const Icon = (s.icon && AI_ICONS[s.icon]) || Sparkles;
              return (
                <Reveal as="li" key={s.id} delay={0.06 * i} className="flex flex-col gap-5 overflow-hidden rounded-[28px] bg-mist p-7 text-ink md:p-9">
                  {s.image ? (
                    <Image src={s.image.src} alt={s.image.alt} width={s.image.width} height={s.image.height} sizes="(min-width: 768px) 45vw, 90vw" className="aspect-[16/9] w-full rounded-2xl object-cover" />
                  ) : (
                    <span aria-hidden className="flex size-14 items-center justify-center rounded-2xl bg-ink text-mist">
                      <Icon className="size-7" strokeWidth={1.75} />
                    </span>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-ink px-3 py-1 text-xs font-medium uppercase tracking-wider text-mist">{t("availableBadge")}</span>
                    {s.draft && <span className="rounded-full border border-ink/40 px-3 py-0.5 text-xs uppercase tracking-wider">{tPricing("draft")}</span>}
                  </div>
                  <p className="text-[clamp(1.6rem,3vw,2.4rem)] font-black uppercase leading-none">{s.title}</p>
                  {s.description && <p className="max-w-xl text-lg leading-relaxed text-ink/75">{s.description}</p>}
                  {s.financial && <p className="text-sm text-ink/65">{t("financialNote")}</p>}
                  {s.cta === "CONTACT" && (
                    <Link
                      href={{ pathname: "/contact", query: { service: s.key } }}
                      className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium uppercase tracking-widest text-mist transition-colors hover:bg-ink-3"
                    >
                      {s.ctaLabel || t("cta")}
                      <ArrowUpRight aria-hidden className="size-4 rtl:-scale-x-100" />
                    </Link>
                  )}
                </Reveal>
              );
            })}
          </ul>
        </div>
      )}

      {soon.length > 0 && (
        <div>
          <Sub className="mb-5 flex items-center gap-2.5 text-sm uppercase tracking-widest text-mist/70">
            <Hourglass aria-hidden className="size-4" />
            {t("comingSoon")}
          </Sub>
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {soon.map((s, i) => {
              const Icon = (s.icon && AI_ICONS[s.icon]) || Sparkles;
              return (
                <Reveal as="li" key={s.id} delay={0.06 * i} className="flex flex-col gap-4 rounded-[28px] border border-dashed border-line bg-ink-2/60 p-6 md:p-7">
                  <div className="flex items-start justify-between gap-3">
                    <span aria-hidden className="flex size-12 items-center justify-center rounded-xl border border-line text-mist/60">
                      <Icon className="size-6" strokeWidth={1.5} />
                    </span>
                    <span className="rounded-full border border-ice/40 px-3 py-1 text-xs font-medium uppercase tracking-wider text-ice">{t("comingSoonBadge")}</span>
                  </div>
                  {s.image && (
                    <Image src={s.image.src} alt={s.image.alt} width={s.image.width} height={s.image.height} sizes="(min-width: 1024px) 30vw, 90vw" className="aspect-[16/9] w-full rounded-xl object-cover opacity-70 grayscale" />
                  )}
                  {s.draft && <span className="w-fit rounded-full border border-line px-3 py-0.5 text-xs uppercase tracking-wider text-mist/70">{tPricing("draft")}</span>}
                  <p className="text-2xl font-bold uppercase leading-tight text-mist/85">{s.title}</p>
                  {s.description && <p className="leading-relaxed text-mist/65">{s.description}</p>}
                  {s.financial && <p className="text-sm text-mist/55">{t("financialNote")}</p>}
                  <p className="text-sm text-mist/50">{t("notYetAvailable")}</p>
                  {s.waitlistEnabled && (
                    <div className="mt-auto">
                      <WaitlistForm serviceId={s.id} serviceTitle={s.title} countries={countries} defaultCountry={defaultCountry} />
                    </div>
                  )}
                </Reveal>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
