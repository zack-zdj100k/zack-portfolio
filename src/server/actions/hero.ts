"use server";

import { prisma } from "@/server/db";
import { saveImage, saveModel } from "@/server/services/media";
import { ActionError, oneOf, str } from "./helpers";
import { adminAction } from "./run";

const BACK = "/admin/hero";

export async function setHeroMode(fd: FormData) {
  await adminAction(fd, { back: BACK, entity: "SiteSettings", action: "hero-mode", success: "Hero option saved." }, async () => {
    await prisma.siteSettings.update({ where: { id: 1 }, data: { heroMode: oneOf(fd, "mode", ["DEPTH", "SEQUENCE", "MODEL"] as const, "DEPTH") } });
  });
}

/** Replaces the 3D artwork (option A texture and the static fallback). Transparency is kept. */
export async function uploadHeroImage(fd: FormData) {
  await adminAction(fd, { back: BACK, entity: "SiteSettings", action: "hero-image", success: "Hero artwork replaced." }, async () => {
    const media = await saveImage(fd.get("file") as File, { label: "Hero artwork", maxEdge: 1600 });
    await prisma.siteSettings.update({ where: { id: 1 }, data: { heroImageId: media.id } });
    return media.id;
  });
}

export async function uploadDepthMap(fd: FormData) {
  await adminAction(fd, { back: BACK, entity: "SiteSettings", action: "hero-depth", success: "Depth map replaced." }, async () => {
    const media = await saveImage(fd.get("file") as File, { label: "Hero depth map", maxEdge: 1024 });
    await prisma.siteSettings.update({ where: { id: 1 }, data: { heroDepthId: media.id } });
    return media.id;
  });
}

/** Option B: uploads a new set of frames, in file-name order, replacing the current set. */
export async function uploadFrames(fd: FormData) {
  await adminAction(fd, { back: BACK, entity: "HeroFrame", action: "replace", success: "Turntable frames replaced." }, async () => {
    const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length < 2) throw new ActionError("Select at least 2 frames (ideally 36 to 60 covering one full turn, in rotation order).");
    if (files.length > 60) throw new ActionError("Up to 60 frames.");
    files.sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }));
    const media = [];
    for (const [i, f] of files.entries()) media.push(await saveImage(f, { label: `Turntable frame ${i + 1}`, maxEdge: 1200 }));
    await prisma.$transaction([
      prisma.heroFrame.deleteMany({ where: { settingsId: 1 } }),
      prisma.heroFrame.createMany({ data: media.map((m, i) => ({ settingsId: 1, mediaId: m.id, sortOrder: i })) }),
    ]);
  });
}

/** Option C: a GLB model. */
export async function uploadHeroModel(fd: FormData) {
  await adminAction(fd, { back: BACK, entity: "SiteSettings", action: "hero-model", success: "3D model uploaded." }, async () => {
    const media = await saveModel(fd.get("file") as File);
    await prisma.siteSettings.update({ where: { id: 1 }, data: { heroModelId: media.id } });
    return media.id;
  });
}

export async function removeHeroModel(fd: FormData) {
  await adminAction(fd, { back: BACK, entity: "SiteSettings", action: "hero-model-remove", success: "3D model removed. The hero falls back to option B." }, async () => {
    await prisma.siteSettings.update({ where: { id: 1 }, data: { heroModelId: null } });
    return str(fd, "id", 60) || null;
  });
}
