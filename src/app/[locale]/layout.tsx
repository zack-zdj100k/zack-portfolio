import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import type { NavKey } from "@/components/layout/nav-items";
import { NoticeBar } from "@/components/layout/NoticeBar";
import { MotionProvider } from "@/components/ui/motion";
import { dir, isLocale, localeTags } from "@/lib/i18n/locales";
import { siteUrl } from "@/lib/seo";
import { getLocaleSettings, getOffers, getProfile, getSettings, isPreview } from "@/server/services/content";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { whatsappHref } from "@/components/ui/social";
import { fontVariables } from "../fonts";
import { ZoomLock } from "@/components/layout/ZoomLock";
import "../globals.css";

// Content comes from the database and can change from the admin at any time.
export const dynamic = "force-dynamic";

// Zoom is locked on purpose (owner request); see ZoomLock for the cases the meta tag misses.
export const viewport: Viewport = { themeColor: "#0c0c0c", colorScheme: "dark", width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false };

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const profile = await getProfile(locale);
  const name = profile?.publicName ?? "ZACK";
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${name} | ${profile?.title ?? ""}`, template: `%s | ${name}` },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  const [t, localeSettings, preview, offers, { settings }, profile] = await Promise.all([
    getTranslations("common"),
    getLocaleSettings(),
    isPreview(),
    getOffers(locale),
    getSettings(),
    getProfile(locale),
  ]);
  const name = profile?.publicName ?? "ZACK";
  const whatsapp = settings?.showWhatsapp && settings.whatsapp ? settings.whatsapp : null;
  // Referral leads nowhere useful until an offer is published, so it leaves the navigation.
  const hidden: NavKey[] = offers.length > 0 ? [] : ["referral"];
  const setting = localeSettings.find((s) => s.code === locale);
  const unreviewed = locale !== "en" && setting?.reviewed !== true;
  const enabledLocales = localeSettings.filter((s) => s.enabled).map((s) => s.code);

  return (
    <html
      lang={localeTags[locale]}
      dir={dir(locale)}
      className={fontVariables}
    >
      <body className="min-h-dvh flex flex-col">
        <ZoomLock />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[100] focus:rounded-full focus:bg-mist focus:px-5 focus:py-3 focus:text-ink"
        >
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider>
          <MotionProvider>
          {preview && <NoticeBar tone="preview">{t("previewBanner")}</NoticeBar>}
          <SiteHeader enabledLocales={enabledLocales} hidden={hidden} />
          <main id="main" className="flex-1">
            {children}
          </main>
          {/* The "translated automatically" note sits in the footer: honest, without pushing the hero down. */}
          <SiteFooter hidden={hidden} note={unreviewed ? t("machineTranslation") : null} />
          {whatsapp && (
            <WhatsAppButton href={whatsappHref(whatsapp, t("whatsappMessage", { name }))} label={t("whatsappLabel", { name })} />
          )}
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
