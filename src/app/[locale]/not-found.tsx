import { getTranslations } from "next-intl/server";
import { PrimaryLink } from "@/components/ui/buttons";

export default async function NotFound() {
  const t = await getTranslations("common");
  return (
    <div className="container-page flex min-h-[70dvh] flex-col items-start justify-center gap-6 py-20">
      <p className="text-[clamp(5rem,20vw,16rem)] font-black leading-none display-gradient">404</p>
      <h1 className="text-3xl font-bold uppercase text-mist">{t("notFoundTitle")}</h1>
      <p className="text-lg text-mist/70">{t("notFoundBody")}</p>
      <PrimaryLink href="/">{t("notFoundCta")}</PrimaryLink>
    </div>
  );
}
