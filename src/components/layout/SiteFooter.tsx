import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/i18n/locales";
import { getLocaleSettings, getProfile, getSettings } from "@/server/services/content";
import { visibleNav, type NavKey } from "./nav-items";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { BackToTop, SoundToggle } from "./FooterControls";
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

  const contact = "text-mist/70 transition-colors hover:text-mist";

  return (
    <footer className="relative overflow-hidden border-t border-line bg-ink">
      {/* Soft light from above, echoing the lamp on the home page. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(50%_100%_at_50%_0%,rgb(187_204_215/0.08),transparent)]" />
      <div className="container-page relative flex flex-col items-center gap-8 py-16 text-center md:py-24">
        <Link href="/" className="text-[clamp(3rem,10vw,7rem)] font-black uppercase leading-none tracking-tight display-gradient">
          {name}
        </Link>
        <Link href="/contact" className="text-lg text-mist underline decoration-ice/50 underline-offset-4 hover:decoration-ice">
          {t("startProject")}
        </Link>

        <nav aria-label={t("siteLinks")}>
          <ul className="flex flex-wrap justify-center gap-x-7 gap-y-3">
            {visibleNav(hidden).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm uppercase tracking-widest text-mist/65 transition-colors hover:text-mist">
                  {tNav(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {(settings?.contactEmail || (settings?.showPhone && settings.phone) || (settings?.showWhatsapp && settings.whatsapp)) && (
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {settings?.contactEmail && (
              <a href={`mailto:${settings.contactEmail}`} className={`break-all ${contact}`}>
                {settings.contactEmail}
              </a>
            )}
            {settings?.showPhone && settings.phone && (
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className={contact} dir="ltr">
                {settings.phone}
              </a>
            )}
            {settings?.showWhatsapp && settings.whatsapp && (
              <a href={whatsappHref(settings.whatsapp, tCommon("whatsappMessage", { name }))} className={contact} rel="noopener" target="_blank">
                WhatsApp
              </a>
            )}
          </div>
        )}

        {socials.length > 0 && (
          <ul className="flex flex-wrap justify-center gap-3">
            {socials.map((s) => (
              <li key={s.id}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer me"
                  aria-label={socialLabel(s.kind, s.label)}
                  className="flex size-12 items-center justify-center rounded-full border border-line bg-ink-2 text-mist/80 transition-[border-color,color,transform] hover:-translate-y-0.5 hover:border-ice/60 hover:text-mist"
                >
                  <SocialIcon kind={s.kind} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      {note && (
        <p role="note" className="container-page relative border-t border-line py-4 text-center text-sm text-mist/70">
          {note}
        </p>
      )}
      <div className="container-page relative flex flex-col items-center gap-5 border-t border-line pb-28 pt-6 text-sm text-mist/60 md:flex-row md:justify-between md:pb-6">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <p>
            © {new Date().getFullYear()} {name}
          </p>
          <Link href="/privacy" className="hover:text-mist">
            {t("privacy")}
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <LanguageSwitcher enabledLocales={enabled} variant="footer" />
          <SoundToggle label={t("sound")} />
          <BackToTop label={t("backToTop")} />
        </div>
      </div>
    </footer>
  );
}
