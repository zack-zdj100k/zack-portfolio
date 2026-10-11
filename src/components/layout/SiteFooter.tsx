import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/i18n/locales";
import { getLocaleSettings, getProfile, getSettings } from "@/server/services/content";
import { visibleNav, type NavKey } from "./nav-items";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SocialIcon, socialLabel, whatsappHref } from "@/components/ui/social";

export async function SiteFooter({ hidden = [], note }: { hidden?: NavKey[]; note?: string | null }) {
  const locale = (await getLocale()) as Locale;
  const [t, tNav, tCommon, profile, { settings, socials }, localeSettings] = await Promise.all([
    getTranslations("footer"),
    getTranslations("nav"),
    getTranslations("common"),
    getProfile(locale),
    getSettings(),
    getLocaleSettings(),
  ]);
  const name = profile?.publicName ?? "ZACK";
  const enabled = localeSettings.filter((s) => s.enabled).map((s) => s.code);

  return (
    <footer className="border-t border-line bg-ink">
      <div className="container-page grid gap-12 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:py-20">
        <div className="flex flex-col gap-4">
          <p className="text-4xl font-black uppercase tracking-tight display-gradient md:text-5xl">{name}</p>
          <div className="mt-2">
            <LanguageSwitcher enabledLocales={enabled} variant="footer" />
          </div>
        </div>

        <nav aria-label={t("siteLinks")}>
          <ul className="flex flex-col gap-2.5">
            {visibleNav(hidden).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-mist/70 transition-colors hover:text-mist">
                  {tNav(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-3">
          {settings?.contactEmail && (
            <a href={`mailto:${settings.contactEmail}`} className="break-all text-mist/80 hover:text-mist">
              {settings.contactEmail}
            </a>
          )}
          {settings?.showPhone && settings.phone && (
            <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="text-mist/80 hover:text-mist" dir="ltr">
              {settings.phone}
            </a>
          )}
          {settings?.showWhatsapp && settings.whatsapp && (
            <a href={whatsappHref(settings.whatsapp, tCommon("whatsappMessage", { name }))} className="text-mist/80 hover:text-mist" rel="noopener" target="_blank">
              WhatsApp
            </a>
          )}
          {socials.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-2">
              {socials.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer me"
                    aria-label={socialLabel(s.kind, s.label)}
                    className="flex size-11 items-center justify-center rounded-full border border-line text-mist/80 transition-colors hover:border-ice/60 hover:text-mist"
                  >
                    <SocialIcon kind={s.kind} />
                  </a>
                </li>
              ))}
            </ul>
          )}
          <Link href="/contact" className="mt-2 text-mist underline decoration-ice/50 underline-offset-4 hover:decoration-ice">
            {t("startProject")}
          </Link>
        </div>
      </div>
      {note && (
        <p role="note" className="container-page border-t border-line py-4 text-sm text-mist/70">
          {note}
        </p>
      )}
      <div className="container-page flex flex-col gap-3 border-t border-line py-6 text-sm text-mist/60 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {name}
        </p>
        <Link href="/privacy" className="hover:text-mist">
          {t("privacy")}
        </Link>
      </div>
    </footer>
  );
}
