"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { requireAdmin } from "@/server/auth/session";
import { isProd } from "@/server/env";
import { PREVIEW_COOKIE } from "@/server/services/content";
import { locales } from "@/lib/i18n/locales";
import { ActionError, bool, int, oneOf, optStr, str } from "./helpers";
import { adminAction } from "./run";

const SOCIAL_KINDS = ["GITHUB", "LINKEDIN", "INDEED", "WHATSAPP", "INSTAGRAM", "FACEBOOK", "X", "OTHER"] as const;

/** Lets the signed-in admin see DRAFT content on the public site (with a banner). */
export async function togglePreview() {
  await requireAdmin();
  const store = await cookies();
  if (store.get(PREVIEW_COOKIE)?.value === "1") store.delete(PREVIEW_COOKIE);
  else store.set(PREVIEW_COOKIE, "1", { httpOnly: true, sameSite: "lax", secure: isProd, path: "/", maxAge: 60 * 60 * 8 });
  redirect("/admin");
}

function httpsUrl(value: string | null, label: string) {
  if (!value) return null;
  try {
    const u = new URL(value);
    if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error();
    return u.toString();
  } catch {
    throw new ActionError(`${label} must be a full link starting with https://`);
  }
}

export async function saveSettings(fd: FormData) {
  await adminAction(fd, { back: "/admin/settings", entity: "SiteSettings", action: "update", success: "Settings saved." }, async () => {
    const email = optStr(fd, "contactEmail", 200);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ActionError("Contact email is not valid.");
    await prisma.siteSettings.update({
      where: { id: 1 },
      data: {
        contactEmail: email,
        phone: optStr(fd, "phone", 40),
        showPhone: bool(fd, "showPhone"),
        whatsapp: optStr(fd, "whatsapp", 40),
        showWhatsapp: bool(fd, "showWhatsapp"),
        siteUrl: httpsUrl(optStr(fd, "siteUrl", 200), "Site address"),
        defaultLocale: oneOf(fd, "defaultLocale", locales, "en"),
      },
    });
    return "1";
  });
}

export async function saveSocial(fd: FormData) {
  await adminAction(fd, { back: "/admin/settings", entity: "SocialLink", action: "save", success: "Link saved." }, async () => {
    const id = optStr(fd, "id", 60);
    const data = {
      kind: oneOf(fd, "kind", SOCIAL_KINDS, "OTHER"),
      label: optStr(fd, "label", 60),
      url: httpsUrl(str(fd, "url", 300), "Link")!,
      visible: bool(fd, "visible"),
      sortOrder: int(fd, "sortOrder", { max: 999 }) ?? 0,
    };
    if (!data.url) throw new ActionError("Link is required.");
    const row = id ? await prisma.socialLink.update({ where: { id }, data }) : await prisma.socialLink.create({ data });
    return row.id;
  });
}

export async function deleteSocial(fd: FormData) {
  await adminAction(fd, { back: "/admin/settings", entity: "SocialLink", action: "delete", success: "Link removed." }, async () => {
    const id = str(fd, "id", 60);
    await prisma.socialLink.delete({ where: { id } });
    return id;
  });
}

export async function saveLanguages(fd: FormData) {
  await adminAction(fd, { back: "/admin/languages", entity: "LocaleSetting", action: "update", success: "Languages saved." }, async () => {
    for (const code of locales) {
      const enabled = code === "en" ? true : bool(fd, `enabled:${code}`);
      const reviewed = bool(fd, `reviewed:${code}`);
      await prisma.localeSetting.upsert({
        where: { code },
        update: { enabled, reviewed },
        create: { code, enabled, reviewed },
      });
    }
  });
}

export async function saveContentOverrides(fd: FormData) {
  const locale = str(fd, "locale", 10);
  await adminAction(fd, { back: `/admin/content?locale=${locale}`, entity: "PageContent", action: "update", success: "Text saved." }, async () => {
    if (!(locales as readonly string[]).includes(locale)) throw new ActionError("Unknown language.");
    // Fields arrive as "v:<key>" with a hidden "d:<key>" holding the file default. Only differences are stored.
    for (const [name, value] of fd.entries()) {
      if (!name.startsWith("v:") || typeof value !== "string") continue;
      const key = name.slice(2);
      if (!/^[a-zA-Z0-9_.]{1,120}$/.test(key)) continue;
      const fallback = fd.get(`d:${key}`);
      const text = value.trim().slice(0, 5000);
      if (text === "" || text === fallback) {
        await prisma.pageContent.deleteMany({ where: { key, locale } });
      } else {
        await prisma.pageContent.upsert({ where: { key_locale: { key, locale } }, update: { value: text }, create: { key, locale, value: text } });
      }
    }
    return locale;
  });
}
