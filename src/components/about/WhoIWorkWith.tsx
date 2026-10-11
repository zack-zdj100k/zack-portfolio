import { getTranslations } from "next-intl/server";
import { Building2, Lightbulb, Rocket, Store } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const GROUPS = [
  { key: "companies", icon: Building2 },
  { key: "small", icon: Store },
  { key: "startups", icon: Rocket },
  { key: "individuals", icon: Lightbulb },
] as const;

/** Who the services are for: not only large companies. Text lives in messages (audience.*). */
export async function WhoIWorkWith({ headingLevel = 2, compact = false }: { headingLevel?: 2 | 3; compact?: boolean }) {
  const t = await getTranslations("audience");
  const H = `h${headingLevel}` as const;
  const Item = `h${headingLevel + 1}` as "h3" | "h4";

  if (compact) {
    return (
      <p className="max-w-2xl text-base leading-relaxed text-mist/70">
        {t("line")} {t("legit")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Reveal className="flex flex-col gap-3">
        <H className="text-[clamp(1.8rem,4vw,3.2rem)] font-black uppercase leading-none text-mist">{t("title")}</H>
        <p className="max-w-2xl text-lg leading-relaxed text-mist/70">{t("intro")}</p>
      </Reveal>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {GROUPS.map(({ key, icon: Icon }, i) => (
          <Reveal as="li" key={key} delay={0.05 * i} className="flex flex-col gap-3 rounded-[24px] border border-line bg-ink-2 p-6">
            <Icon aria-hidden className="size-6 text-ice" strokeWidth={1.75} />
            <Item className="text-xl font-bold leading-tight text-mist">{t(`${key}Title`)}</Item>
            <p className="text-mist/70">{t(`${key}Body`)}</p>
          </Reveal>
        ))}
      </ul>
      <p className="text-sm text-mist/55">{t("legit")}</p>
    </div>
  );
}
