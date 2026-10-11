"use server";

import { prisma } from "@/server/db";
import { saveImage } from "@/server/services/media";
import { ActionError, bool, lines, list, localeOf, optStr, str } from "./helpers";
import { adminAction } from "./run";

export async function saveProfile(fd: FormData) {
  await adminAction(fd, { back: "/admin/profile", entity: "Profile", action: "update", success: "Profile saved." }, async () => {
    const publicName = str(fd, "publicName", 40);
    if (!publicName) throw new ActionError("Public name is required.");
    await prisma.profile.update({
      where: { id: 1 },
      data: {
        publicName,
        fullName: optStr(fd, "fullName", 120),
        showFullName: bool(fd, "showFullName"),
        languages: list(fd, "languages", 12, 40),
      },
    });
    return "1";
  });
}

export async function saveProfileTranslation(fd: FormData) {
  const locale = localeOf(fd);
  await adminAction(fd, { back: `/admin/profile?locale=${locale}`, entity: "ProfileTranslation", action: "update", success: "Translation saved." }, async () => {
    const title = str(fd, "title", 160);
    const intro = str(fd, "intro", 600);
    if (!title || !intro) throw new ActionError("Title and short introduction are required.");
    const data = {
      title,
      intro,
      bio: optStr(fd, "bio", 3000),
      location: optStr(fd, "location", 120),
      whyMe: lines(fd, "whyMe", 8, 240),
      interest: optStr(fd, "interest", 600),
      reviewed: bool(fd, "reviewed"),
    };
    await prisma.profileTranslation.upsert({
      where: { profileId_locale: { profileId: 1, locale } },
      update: data,
      create: { profileId: 1, locale, ...data },
    });
    return locale;
  });
}

export async function uploadPortrait(fd: FormData) {
  await adminAction(fd, { back: "/admin/profile", entity: "Profile", action: "portrait", success: "Photo uploaded." }, async () => {
    const file = fd.get("file") as File;
    const alt = optStr(fd, "alt", 200);
    const media = await saveImage(file, { label: "Profile photo", alt: alt ? { en: alt } : undefined, maxEdge: 1600 });
    await prisma.profile.update({ where: { id: 1 }, data: { portraitId: media.id } });
    return media.id;
  });
}

export async function removePortrait(fd: FormData) {
  await adminAction(fd, { back: "/admin/profile", entity: "Profile", action: "portrait-remove", success: "Photo removed from the profile." }, async () => {
    await prisma.profile.update({ where: { id: 1 }, data: { portraitId: null } });
  });
}

export async function saveExperience(fd: FormData) {
  await adminAction(fd, { back: "/admin/profile", entity: "ExperienceItem", action: "save", success: "Experience saved." }, async () => {
    const id = optStr(fd, "id", 60);
    const start = str(fd, "startDate", 10);
    const end = optStr(fd, "endDate", 10);
    const role = str(fd, "role", 160);
    if (!/^\d{4}-\d{2}$/.test(start) || (end && !/^\d{4}-\d{2}$/.test(end))) throw new ActionError("Dates must be in YYYY-MM format.");
    if (!role) throw new ActionError("Role is required.");
    const data = {
      startDate: new Date(`${start}-01T00:00:00Z`),
      endDate: end ? new Date(`${end}-01T00:00:00Z`) : null,
      organization: optStr(fd, "organization", 160),
      status: bool(fd, "published") ? ("PUBLISHED" as const) : ("DRAFT" as const),
    };
    const item = id ? await prisma.experienceItem.update({ where: { id }, data }) : await prisma.experienceItem.create({ data });
    // Experience is edited in English here; other languages fall back to it until translated.
    await prisma.experienceTranslation.upsert({
      where: { itemId_locale: { itemId: item.id, locale: "en" } },
      update: { role, description: optStr(fd, "description", 1500), reviewed: true },
      create: { itemId: item.id, locale: "en", role, description: optStr(fd, "description", 1500), reviewed: true },
    });
    return item.id;
  });
}

export async function deleteExperience(fd: FormData) {
  await adminAction(fd, { back: "/admin/profile", entity: "ExperienceItem", action: "delete", success: "Experience removed." }, async () => {
    const id = str(fd, "id", 60);
    await prisma.experienceItem.delete({ where: { id } });
    return id;
  });
}
