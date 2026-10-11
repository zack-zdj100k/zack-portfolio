"use server";

import { prisma } from "@/server/db";
import { saveImage } from "@/server/services/media";
import { PROCESS_ICON_NAMES } from "@/components/about/process-icons";
import { ActionError, bool, localeOf, oneOf, optStr, reorderWrites, str } from "./helpers";
import { adminAction } from "./run";

const back = (fd: FormData) => `/admin/process?locale=${str(fd, "locale", 10) || "en"}`;

export async function createProcessStep(fd: FormData) {
  await adminAction(fd, { back: back(fd), entity: "ProcessStep", action: "create", success: "Step added at the end." }, async () => {
    const title = str(fd, "title", 80);
    const description = str(fd, "description", 600);
    if (!title || !description) throw new ActionError("Write the step's title and description.");
    const last = await prisma.processStep.aggregate({ _max: { sortOrder: true } });
    const step = await prisma.processStep.create({
      data: { sortOrder: (last._max.sortOrder ?? -1) + 1, translations: { create: { locale: "en", title, description, reviewed: true } } },
    });
    return step.id;
  });
}

export async function saveProcessStep(fd: FormData) {
  const locale = localeOf(fd);
  await adminAction(fd, { back: back(fd), entity: "ProcessStep", action: "update", success: "Step saved." }, async () => {
    const id = str(fd, "id", 60);
    const title = str(fd, "title", 80);
    const description = str(fd, "description", 600);
    if (!title || !description) throw new ActionError("Title and description can't be empty.");
    const data = { title, description, reviewed: bool(fd, "reviewed") };
    await prisma.$transaction([
      prisma.processStep.update({
        where: { id },
        data: { visible: bool(fd, "visible"), icon: oneOf(fd, "icon", ["", ...PROCESS_ICON_NAMES], "") || null },
      }),
      prisma.processStepTranslation.upsert({ where: { stepId_locale: { stepId: id, locale } }, update: data, create: { stepId: id, locale, ...data } }),
    ]);
    return id;
  });
}

export async function uploadProcessImage(fd: FormData) {
  await adminAction(fd, { back: back(fd), entity: "ProcessStep", action: "image", success: "Image added to the step." }, async () => {
    const id = str(fd, "id", 60);
    const alt = optStr(fd, "alt", 200);
    const media = await saveImage(fd.get("file") as File, { label: "How I work step", alt: alt ? { en: alt } : undefined, maxEdge: 1200 });
    await prisma.processStep.update({ where: { id }, data: { mediaId: media.id } });
    return id;
  });
}

export async function removeProcessImage(fd: FormData) {
  await adminAction(fd, { back: back(fd), entity: "ProcessStep", action: "image-remove", success: "Image removed from the step (still in Media)." }, async () => {
    const id = str(fd, "id", 60);
    await prisma.processStep.update({ where: { id }, data: { mediaId: null } });
    return id;
  });
}

export async function moveProcessStep(fd: FormData) {
  await adminAction(fd, { back: back(fd), entity: "ProcessStep", action: "reorder", success: "Order saved." }, async () => {
    const id = str(fd, "id", 60);
    const siblings = await prisma.processStep.findMany({ orderBy: { sortOrder: "asc" } });
    await prisma.$transaction(reorderWrites(siblings, id, str(fd, "op", 10), (sid, sortOrder) => prisma.processStep.update({ where: { id: sid }, data: { sortOrder } })));
    return id;
  });
}

export async function deleteProcessStep(fd: FormData) {
  await adminAction(fd, { back: back(fd), entity: "ProcessStep", action: "delete", success: "Step deleted." }, async () => {
    const id = str(fd, "id", 60);
    await prisma.processStep.delete({ where: { id } });
    return id;
  });
}
