import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";
import { showcaseFeatures } from "@/lib/admin-showcase";
import { AdminShowcase } from "./AdminShowcase";

/** "Admin Dashboard Preview": a marketing demo of the dashboard, with made-up data. Never the real /admin. */
export async function AdminPreview() {
  const t = await getTranslations("showcase");
  const items = showcaseFeatures().map((key) => ({ key, title: t(`features.${key}.title`), body: t(`features.${key}.body`) }));
  return (
    <div className="flex flex-col gap-12 md:gap-16">
      <Reveal className="flex flex-col gap-5">
        <h2 id="showcase-title" className="max-w-5xl text-[clamp(2.4rem,7vw,6rem)] font-black uppercase leading-[0.92] tracking-tight display-gradient">
          {t("title")}
        </h2>
        <p className="max-w-2xl text-lg leading-relaxed text-mist/75">{t("intro")}</p>
        <p className="max-w-2xl text-sm text-mist/55">{t("note")}</p>
      </Reveal>
      <AdminShowcase items={items} labels={{ demo: t("demo"), address: t("address"), screenOf: t("screenOf") }} />
    </div>
  );
}
