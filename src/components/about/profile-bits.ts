import "server-only";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/i18n/locales";
import { altFor } from "@/lib/media";
import { getProfile, getSettings } from "@/server/services/content";
import type { BadgeData } from "./IdBadge";

const FAMILIES = ["frontend", "backend", "databases", "tools"] as const;

/**
 * Everything the ID badge, the quick-facts list and the skills table need, from the profile.
 * Only facts the owner entered are included; empty ones are simply left out.
 */
export async function profileBits(locale: Locale) {
  const [t, tHome, profile, { settings }] = await Promise.all([
    getTranslations({ locale, namespace: "about" }),
    getTranslations({ locale, namespace: "home" }),
    getProfile(locale),
    getSettings(),
  ]);
  const name = profile?.fullName ?? profile?.publicName ?? "ZACK";
  const artwork = settings?.heroImage?.url ?? "/hero/face-1280.webp";
  const topStack = FAMILIES.flatMap((f) => profile?.skills[f]?.slice(0, 1) ?? []).slice(0, 4);

  const facts = [
    { label: t("role"), value: t("badge.role") },
    profile?.location ? { label: t("location"), value: profile.location } : null,
    profile?.languages.length ? { label: t("languages"), value: profile.languages.join(", ") } : null,
    { label: t("facts.focus"), value: t("facts.focusValue") },
    topStack.length ? { label: t("facts.stack"), value: topStack.join(", ") } : null,
  ].filter((f): f is { label: string; value: string } => !!f);

  const badge: BadgeData = {
    header: t("badge.header"),
    name,
    role: t("badge.role"),
    photo: profile?.portrait
      ? { src: profile.portrait.url, alt: altFor(profile.portrait.alt, locale) || name, isArtwork: false }
      : { src: artwork, alt: tHome("hero.imageAlt", { name: profile?.publicName ?? "ZACK" }), isArtwork: true },
    lines: [profile?.location, t("facts.focusValue")].filter((l): l is string => !!l),
  };

  const skillGroups = FAMILIES.filter((f) => (profile?.skills[f]?.length ?? 0) > 0).map((f) => ({
    family: f,
    label: t(`skills.${f}`),
    skills: profile!.skills[f]!,
  }));

  return {
    profile,
    facts,
    badge,
    skillGroups,
    stackLabels: { title: t("stack.title"), intro: t("stack.intro"), all: t("stack.all") },
    factsTitle: t("facts.title"),
  };
}
