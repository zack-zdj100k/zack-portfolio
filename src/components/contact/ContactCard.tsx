import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { SocialIcon, socialHandle, socialLabel, whatsappHref } from "@/components/ui/social";
import type { Locale } from "@/lib/i18n/locales";
import { altFor } from "@/lib/media";
import { getProfile, getSettings } from "@/server/services/content";
import heroManifest from "../../../public/hero/manifest.json";

/**
 * The owner's photo beside every direct channel (WhatsApp first: most visitors are on a phone, then
 * phone, email and each public profile) and the inquiry form passed as `children`. Only channels set
 * in Admin → Settings appear, so nothing here is ever a placeholder. Without a profile photo, the
 * hero artwork stands in. On wide screens the photo stays in view while the visitor fills the form.
 */
export async function ContactCard({
  locale,
  headingLevel = 2,
  children,
}: {
  locale: Locale;
  headingLevel?: 2 | 3;
  children?: React.ReactNode;
}) {
  const [t, tCommon, { settings, socials }, profile] = await Promise.all([
    getTranslations("contact"),
    getTranslations("common"),
    getSettings(),
    getProfile(locale),
  ]);
  const name = profile?.publicName ?? "ZACK";
  const Heading = headingLevel === 2 ? "h2" : "h3";

  const photo = profile?.portrait
    ? {
        src: profile.portrait.url,
        width: profile.portrait.width ?? 941,
        height: profile.portrait.height ?? 1176,
        alt: altFor(profile.portrait.alt, locale) || name,
        artwork: false,
      }
    : {
        src: settings?.heroImage?.url ?? "/hero/face-1280.webp",
        width: settings?.heroImage?.width ?? heroManifest.face.width,
        height: settings?.heroImage?.height ?? heroManifest.face.height,
        alt: "",
        artwork: true,
      };

  const channels = [
    settings?.showWhatsapp && settings.whatsapp
      ? { key: "whatsapp", href: whatsappHref(settings.whatsapp, tCommon("whatsappMessage", { name })), label: t("whatsapp"), value: settings.whatsapp, primary: true }
      : null,
    settings?.showPhone && settings.phone
      ? { key: "phone", href: `tel:${settings.phone.replace(/[^\d+]/g, "")}`, label: t("phone"), value: settings.phone, primary: false }
      : null,
    settings?.contactEmail ? { key: "email", href: `mailto:${settings.contactEmail}`, label: t("email"), value: settings.contactEmail, primary: false } : null,
  ].filter((c): c is NonNullable<typeof c> => !!c);
  const hasLinks = channels.length > 0 || socials.length > 0;

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
      <figure className="relative isolate overflow-hidden rounded-[32px] bg-ink-2 sm:max-w-md md:rounded-[40px] lg:sticky lg:top-28 lg:max-w-none">
        <div className={`relative aspect-[4/5] max-h-[72svh] w-full ${photo.artwork ? "bg-[radial-gradient(circle_at_50%_30%,rgb(187_204_215/0.18),transparent_65%)]" : ""}`}>
          <Image
            src={photo.src}
            width={photo.width}
            height={photo.height}
            alt={photo.alt}
            sizes="(min-width: 1024px) 480px, (min-width: 768px) 40vw, 92vw"
            className={`absolute inset-0 size-full ${photo.artwork ? "object-contain object-bottom pt-8" : "object-cover object-top"}`}
          />
        </div>
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/70 to-transparent p-6 pt-20 md:p-8 md:pt-24">
          <p className="text-[clamp(2rem,4vw,3rem)] font-black uppercase leading-none tracking-tight text-mist">{name}</p>
          {profile?.title && <p className="mt-2 max-w-sm text-mist/75">{profile.title}</p>}
        </figcaption>
      </figure>

      <div className="flex flex-col gap-12">
        {hasLinks && (
          <div className="flex flex-col gap-5">
            <Heading className="text-sm uppercase tracking-widest text-mist/60">{t("direct")}</Heading>
            {channels.length > 0 && (
              <ul className="flex flex-col gap-3">
                {channels.map((c) => (
                  <li key={c.key}>
                    <a
                      href={c.href}
                      {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className={`group flex items-center gap-4 rounded-[24px] p-4 transition-[background-color,border-color,transform] active:scale-[0.99] sm:p-5 ${
                        c.primary ? "bg-mist text-ink hover:bg-white" : "border border-line text-mist hover:border-ice/60"
                      }`}
                    >
                      <span
                        className={`flex size-12 shrink-0 items-center justify-center rounded-full ${c.primary ? "bg-ink text-mist" : "bg-ink-3 text-ice"}`}
                      >
                        {c.key === "whatsapp" ? (
                          <SocialIcon kind="WHATSAPP" className="size-5" />
                        ) : c.key === "phone" ? (
                          <Phone aria-hidden className="size-5" strokeWidth={1.75} />
                        ) : (
                          <Mail aria-hidden className="size-5" strokeWidth={1.75} />
                        )}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className={`text-sm ${c.primary ? "text-ink/70" : "text-mist/60"}`}>{c.label}</span>
                        <span className="truncate text-lg font-medium sm:text-xl" dir="ltr">
                          {c.value}
                        </span>
                      </span>
                      <ArrowUpRight aria-hidden className="size-5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" strokeWidth={1.75} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {socials.length > 0 && (
              <ul className="grid gap-3 sm:grid-cols-2">
                {socials.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer me"
                      className="group flex h-full items-center gap-3.5 rounded-[24px] border border-line p-4 text-mist transition-colors hover:border-ice/60"
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ink-3 text-mist">
                        <SocialIcon kind={s.kind} className="size-5" />
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="font-medium">{socialLabel(s.kind, s.label)}</span>
                        <span className="truncate text-sm text-mist/60" dir="ltr">
                          {socialHandle(s.url)}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
