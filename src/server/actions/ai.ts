"use server";

import { prisma } from "@/server/db";
import { saveImage } from "@/server/services/media";
import { AI_ICON_NAMES } from "@/components/ai/ai-icons";
import { ActionError, bool, localeOf, oneOf, optStr, reorderWrites, slugify, str } from "./helpers";
import { adminAction } from "./run";

const back = (fd: FormData) => `/admin/ai-services?locale=${str(fd, "locale", 10) || "en"}`;

/** Words that would promise financial results. Blocked in every AI service text. */
const PROMISE = /\b(guaranteed?|risk[- ]free|sure (profit|win)|passive income|(\d+\s?%|double|triple) (returns?|profits?|gains?)|get rich)\b/i;

export async function createAiService(fd: FormData) {
  await adminAction(fd, { back: back(fd), entity: "AiService", action: "create", success: "Service added as a hidden draft." }, async () => {
    const title = str(fd, "title", 120);
    if (!title) throw new ActionError("Give the service a title.");
    const last = await prisma.aiService.aggregate({ _max: { sortOrder: true } });
    const base = slugify(title) || "service";
    let key = base;
    for (let n = 2; await prisma.aiService.findUnique({ where: { key } }); n++) key = `${base}-${n}`;
    const service = await prisma.aiService.create({
      data: { key, sortOrder: (last._max.sortOrder ?? -1) + 1, translations: { create: { locale: "en", title, description: "", reviewed: true } } },
    });
    return service.id;
  });
}

export async function saveAiService(fd: FormData) {
  const locale = localeOf(fd);
  await adminAction(fd, { back: back(fd), entity: "AiService", action: "update", success: "Service saved." }, async () => {
    const id = str(fd, "id", 60);
    const title = str(fd, "title", 120);
    const description = str(fd, "description", 1200);
    const ctaLabel = optStr(fd, "ctaLabel", 60);
    if (!title) throw new ActionError("The title can't be empty.");
    if ([title, description, ctaLabel ?? ""].some((x) => PROMISE.test(x))) {
      throw new ActionError("Remove wording that promises returns, profits or guaranteed results.");
    }
    const status = oneOf(fd, "status", ["AVAILABLE", "COMING_SOON", "HIDDEN"] as const, "HIDDEN");
    const publishStatus = oneOf(fd, "publishStatus", ["DRAFT", "PUBLISHED"] as const, "DRAFT");
    // Only Coming Soon items get a waitlist; available ones get the contact button.
    const cta = status === "COMING_SOON" ? (bool(fd, "waitlistEnabled") ? "WAITLIST" : "NONE") : oneOf(fd, "cta", ["CONTACT", "NONE"] as const, "CONTACT");
    if (publishStatus === "PUBLISHED") {
      const en = locale === "en" ? { description } : await prisma.aiServiceTranslation.findUnique({ where: { serviceId_locale: { serviceId: id, locale: "en" } } });
      if (!en?.description) throw new ActionError("Write the English description before publishing.");
    }
    const data = { title, description, ctaLabel, reviewed: bool(fd, "reviewed") };
    await prisma.$transaction([
      prisma.aiService.update({
        where: { id },
        data: {
          status,
          publishStatus,
          cta,
          waitlistEnabled: status === "COMING_SOON" && bool(fd, "waitlistEnabled"),
          financial: bool(fd, "financial"),
          icon: oneOf(fd, "icon", ["", ...AI_ICON_NAMES], "") || null,
        },
      }),
      prisma.aiServiceTranslation.upsert({ where: { serviceId_locale: { serviceId: id, locale } }, update: data, create: { serviceId: id, locale, ...data } }),
    ]);
    return id;
  });
}

export async function uploadAiImage(fd: FormData) {
  await adminAction(fd, { back: back(fd), entity: "AiService", action: "image", success: "Visual added." }, async () => {
    const id = str(fd, "id", 60);
    const alt = optStr(fd, "alt", 200);
    const media = await saveImage(fd.get("file") as File, { label: "AI service visual", alt: alt ? { en: alt } : undefined, maxEdge: 1600 });
    await prisma.aiService.update({ where: { id }, data: { mediaId: media.id } });
    return id;
  });
}

export async function removeAiImage(fd: FormData) {
  await adminAction(fd, { back: back(fd), entity: "AiService", action: "image-remove", success: "Visual removed (still in Media)." }, async () => {
    const id = str(fd, "id", 60);
    await prisma.aiService.update({ where: { id }, data: { mediaId: null } });
    return id;
  });
}

export async function moveAiService(fd: FormData) {
  await adminAction(fd, { back: back(fd), entity: "AiService", action: "reorder", success: "Order saved." }, async () => {
    const id = str(fd, "id", 60);
    const siblings = await prisma.aiService.findMany({ orderBy: { sortOrder: "asc" } });
    await prisma.$transaction(reorderWrites(siblings, id, str(fd, "op", 10), (sid, sortOrder) => prisma.aiService.update({ where: { id: sid }, data: { sortOrder } })));
    return id;
  });
}

export async function deleteAiService(fd: FormData) {
  await adminAction(fd, { back: back(fd), entity: "AiService", action: "delete", success: "Service deleted. Waitlist sign-ups stay in Inquiries." }, async () => {
    const id = str(fd, "id", 60);
    await prisma.aiService.delete({ where: { id } });
    return id;
  });
}
