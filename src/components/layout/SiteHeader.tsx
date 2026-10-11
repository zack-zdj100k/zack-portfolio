import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getProfile } from "@/server/services/content";
import type { Locale } from "@/lib/i18n/locales";
import { NavLinks } from "./NavLinks";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NavDial } from "./NavDial";
import { HeaderShell } from "./HeaderShell";
import type { NavKey } from "./nav-items";

export async function SiteHeader({ enabledLocales, hidden = [] }: { enabledLocales: string[]; hidden?: NavKey[] }) {
  const locale = (await getLocale()) as Locale;
  const [t, profile] = await Promise.all([getTranslations("nav"), getProfile(locale)]);
  const name = profile?.publicName ?? "ZACK";

  return (
    <HeaderShell>
      <div className="container-page flex h-16 items-center justify-between gap-6 md:h-20">
        <Link
          href="/"
          className="text-xl font-black uppercase tracking-tight text-mist md:text-2xl"
          aria-label={t("homeLabel", { name })}
        >
          {name}
        </Link>
        <nav aria-label={t("primary")} className="hidden lg:block">
          <NavLinks hidden={hidden} />
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher enabledLocales={enabledLocales} />
          <NavDial hidden={hidden} />
        </div>
      </div>
    </HeaderShell>
  );
}
