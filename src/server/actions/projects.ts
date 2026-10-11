"use server";

import { prisma } from "@/server/db";
import { deleteMedia, saveImage } from "@/server/services/media";
import { ActionError, bool, lines, list, localeOf, oneOf, optStr, slugify, str } from "./helpers";
import { DASHBOARD_ICON_NAMES } from "@/components/projects/dashboard-icons";
import { adminAction } from "./run";

const CATEGORIES = ["WEBSITE", "APP", "SOFTWARE"] as const;
const ORIGINS = ["", "CLIENT", "PERSONAL", "CONCEPT"] as const;
const STAGES = ["CONCEPT", "IN_PROGRESS", "LAUNCHED"] as const;

export async function createProject(fd: FormData) {
  await adminAction(fd, { back: "/admin/projects", entity: "Project", action: "create", success: "Project created as a draft." }, async () => {
    const title = str(fd, "title", 120);
    if (!title) throw new ActionError("Title is required.");
    const slug = slugify(str(fd, "slug", 80) || title);
    if (!slug) throw new ActionError("Choose a web address (slug) using letters and numbers.");
    const last = await prisma.project.aggregate({ _max: { sortOrder: true } });
    const project = await prisma.project.create({
      data: {
        slug,
        category: oneOf(fd, "category", CATEGORIES, "WEBSITE"),
        stage: "CONCEPT",
        status: "DRAFT",
        sortOrder: (last._max.sortOrder ?? 0) + 1,
        technologies: [],
        translations: { create: { locale: "en", title, summary: "", features: [], reviewed: true } },
      },
    });
    return { id: project.id, back: `/admin/projects/${project.id}` };
  });
}

export async function saveProject(fd: FormData) {
  const id = str(fd, "id", 60);
  await adminAction(fd, { back: `/admin/projects/${id}`, entity: "Project", action: "update", success: "Project saved." }, async () => {
    const slug = slugify(str(fd, "slug", 80));
    if (!slug) throw new ActionError("The web address (slug) can't be empty.");
    const status = oneOf(fd, "status", ["DRAFT", "PUBLISHED"] as const, "DRAFT");
    const date = str(fd, "projectDate", 10);
    if (date && !/^\d{4}-\d{2}$/.test(date)) throw new ActionError("Date must be in YYYY-MM format.");
    if (status === "PUBLISHED") {
      const en = await prisma.projectTranslation.findUnique({ where: { projectId_locale: { projectId: id, locale: "en" } } });
      if (!en?.summary) throw new ActionError("Add an English summary before publishing.");
    }
    const origin = oneOf(fd, "origin", ORIGINS, "");
    await prisma.project.update({
      where: { id },
      data: {
        slug,
        category: oneOf(fd, "category", CATEGORIES, "WEBSITE"),
        origin: origin === "" ? null : origin,
        stage: oneOf(fd, "stage", STAGES, "CONCEPT"),
        status,
        featured: bool(fd, "featured"),
        projectDate: date ? new Date(`${date}-01T00:00:00Z`) : null,
        technologies: list(fd, "technologies", 30, 40),
      },
    });
    return id;
  });
}

export async function saveProjectTranslation(fd: FormData) {
  const id = str(fd, "id", 60);
  const locale = localeOf(fd);
  await adminAction(fd, { back: `/admin/projects/${id}?locale=${locale}`, entity: "ProjectTranslation", action: "update", success: "Text saved." }, async () => {
    const title = str(fd, "title", 120);
    if (!title) throw new ActionError("Title is required.");
    const data = {
      title,
      summary: str(fd, "summary", 600),
      problem: optStr(fd, "problem", 3000),
      role: optStr(fd, "role", 3000),
      solution: optStr(fd, "solution", 3000),
      challenge: optStr(fd, "challenge", 3000),
      outcome: optStr(fd, "outcome", 3000),
      features: lines(fd, "features", 20, 200),
      reviewed: bool(fd, "reviewed"),
    };
    await prisma.projectTranslation.upsert({
      where: { projectId_locale: { projectId: id, locale } },
      update: data,
      create: { projectId: id, locale, ...data },
    });
    return id;
  });
}

export async function addProjectImages(fd: FormData) {
  const id = str(fd, "id", 60);
  await adminAction(fd, { back: `/admin/projects/${id}`, entity: "ProjectImage", action: "add", success: "Images uploaded." }, async () => {
    const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length === 0) throw new ActionError("Select at least one image.");
    if (files.length > 12) throw new ActionError("Upload up to 12 images at a time.");
    const kind = oneOf(fd, "kind", ["REAL", "CONCEPT", "DEMO"] as const, "REAL");
    const alt = optStr(fd, "alt", 200);
    const last = await prisma.projectImage.aggregate({ where: { projectId: id }, _max: { sortOrder: true } });
    let order = (last._max.sortOrder ?? -1) + 1;
    for (const f of files) {
      const media = await saveImage(f, { alt: alt ? { en: alt } : undefined });
      await prisma.projectImage.create({ data: { projectId: id, mediaId: media.id, kind, sortOrder: order++ } });
    }
    return id;
  });
}

export async function updateProjectImage(fd: FormData) {
  const projectId = str(fd, "projectId", 60);
  await adminAction(fd, { back: `/admin/projects/${projectId}`, entity: "ProjectImage", action: "update", success: "Image updated." }, async () => {
    const imageId = str(fd, "imageId", 60);
    const image = await prisma.projectImage.findFirstOrThrow({ where: { id: imageId, projectId } });
    const op = str(fd, "op", 20);
    if (op === "remove") {
      await prisma.projectImage.delete({ where: { id: imageId } });
      // Delete the file too when nothing else uses it.
      if ((await prisma.projectImage.count({ where: { mediaId: image.mediaId } })) === 0) await deleteMedia(image.mediaId).catch(() => {});
      return imageId;
    }
    if (op === "up" || op === "down") {
      const siblings = await prisma.projectImage.findMany({ where: { projectId, section: image.section }, orderBy: { sortOrder: "asc" } });
      const i = siblings.findIndex((s) => s.id === imageId);
      const j = op === "up" ? i - 1 : i + 1;
      if (j >= 0 && j < siblings.length) {
        const reordered = [...siblings];
        [reordered[i], reordered[j]] = [reordered[j], reordered[i]];
        await prisma.$transaction(reordered.map((s, k) => prisma.projectImage.update({ where: { id: s.id }, data: { sortOrder: k } })));
      }
      return imageId;
    }
    // Save kind + English alt text.
    const media = await prisma.mediaAsset.findUniqueOrThrow({ where: { id: image.mediaId } });
    const alt = { ...((media.alt as Record<string, string>) ?? {}), en: str(fd, "alt", 200) };
    await prisma.$transaction([
      prisma.projectImage.update({ where: { id: imageId }, data: { kind: oneOf(fd, "kind", ["REAL", "CONCEPT", "DEMO"] as const, image.kind) } }),
      prisma.mediaAsset.update({ where: { id: media.id }, data: { alt } }),
    ]);
    return imageId;
  });
}

export async function saveProjectLinks(fd: FormData) {
  const id = str(fd, "id", 60);
  await adminAction(fd, { back: `/admin/projects/${id}`, entity: "ProjectLink", action: "update", success: "Links saved." }, async () => {
    const links: { type: "LIVE" | "DEMO" | "REPO"; url: string; sortOrder: number }[] = [];
    for (const [i, type] of (["LIVE", "DEMO", "REPO"] as const).entries()) {
      const url = str(fd, type, 300);
      if (!url) continue;
      try {
        const u = new URL(url);
        if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error();
      } catch {
        throw new ActionError(`The ${type.toLowerCase()} link must start with https://`);
      }
      links.push({ type, url, sortOrder: i });
    }
    await prisma.$transaction([
      prisma.projectLink.deleteMany({ where: { projectId: id } }),
      prisma.projectLink.createMany({ data: links.map((l) => ({ ...l, projectId: id })) }),
    ]);
    return id;
  });
}

export async function moveProject(fd: FormData) {
  await adminAction(fd, { back: "/admin/projects", entity: "Project", action: "reorder", success: "Order saved." }, async () => {
    const id = str(fd, "id", 60);
    const dir = str(fd, "dir", 4);
    const all = await prisma.project.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
    const i = all.findIndex((p) => p.id === id);
    const j = dir === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= all.length) return id;
    [all[i], all[j]] = [all[j], all[i]];
    await prisma.$transaction(all.map((p, k) => prisma.project.update({ where: { id: p.id }, data: { sortOrder: k } })));
    return id;
  });
}

export async function setProjectStatus(fd: FormData) {
  await adminAction(fd, { back: "/admin/projects", entity: "Project", action: "status", success: "Status changed." }, async () => {
    const id = str(fd, "id", 60);
    const status = oneOf(fd, "status", ["DRAFT", "PUBLISHED"] as const, "DRAFT");
    if (status === "PUBLISHED") {
      const en = await prisma.projectTranslation.findUnique({ where: { projectId_locale: { projectId: id, locale: "en" } } });
      if (!en?.summary) throw new ActionError("Add an English summary before publishing.");
    }
    await prisma.project.update({ where: { id }, data: { status } });
    return id;
  });
}

export async function deleteProject(fd: FormData) {
  await adminAction(fd, { back: "/admin/projects", entity: "Project", action: "delete", success: "Project deleted." }, async () => {
    const id = str(fd, "id", 60);
    const images = await prisma.projectImage.findMany({ where: { projectId: id }, select: { mediaId: true } });
    await prisma.project.delete({ where: { id } });
    for (const { mediaId } of images) {
      if ((await prisma.projectImage.count({ where: { mediaId } })) === 0) await deleteMedia(mediaId).catch(() => {});
    }
    return id;
  });
}

// ─── Dashboard tour ─────────────────────────────────────────────────────────

/** A percentage between 0 and 100 (marker position on a screenshot). */
function pct(fd: FormData, key: string): number {
  const n = Number(str(fd, key, 10).replace(",", "."));
  if (!Number.isFinite(n) || n < 0 || n > 100) throw new ActionError("Positions are percentages between 0 and 100.");
  return Math.round(n * 100) / 100;
}

/** Sets one language in a per-language text map, keeping the others. Empty text removes that language. */
function withLocale(map: unknown, locale: string, text: string | null) {
  const next = { ...((map as Record<string, string> | null) ?? {}) };
  if (text) next[locale] = text;
  else delete next[locale];
  return next;
}

/** Uploads admin screenshots as new dashboard-tour screens. */
export async function addDashboardScreens(fd: FormData) {
  const id = str(fd, "id", 60);
  await adminAction(fd, { back: `/admin/projects/${id}#dashboard`, entity: "ProjectImage", action: "add-dashboard", success: "Screen added. Now place its markers." }, async () => {
    const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length === 0) throw new ActionError("Select at least one screenshot.");
    if (files.length > 6) throw new ActionError("Upload up to 6 screens at a time.");
    const kind = oneOf(fd, "kind", ["REAL", "DEMO"] as const, "DEMO");
    const title = optStr(fd, "title", 60);
    const last = await prisma.projectImage.aggregate({ where: { projectId: id, section: "DASHBOARD" }, _max: { sortOrder: true } });
    let order = (last._max.sortOrder ?? -1) + 1;
    for (const f of files) {
      const media = await saveImage(f, { alt: title ? { en: title } : undefined });
      await prisma.projectImage.create({ data: { projectId: id, mediaId: media.id, kind, section: "DASHBOARD", title: title ? { en: title } : undefined, sortOrder: order++ } });
    }
    return id;
  });
}

/** Renames a dashboard screen (in the language being edited) or changes its label kind. */
export async function saveDashboardScreen(fd: FormData) {
  const projectId = str(fd, "projectId", 60);
  await adminAction(fd, { back: `/admin/projects/${projectId}#dashboard`, entity: "ProjectImage", action: "save-dashboard", success: "Screen saved." }, async () => {
    const imageId = str(fd, "imageId", 60);
    const locale = localeOf(fd);
    const image = await prisma.projectImage.findFirstOrThrow({ where: { id: imageId, projectId, section: "DASHBOARD" } });
    await prisma.projectImage.update({
      where: { id: imageId },
      data: { title: withLocale(image.title, locale, optStr(fd, "title", 60)), kind: oneOf(fd, "kind", ["REAL", "DEMO"] as const, "DEMO") },
    });
    return imageId;
  });
}

/** Creates or updates a marker. Text is saved for the language being edited. */
export async function saveHotspot(fd: FormData) {
  const projectId = str(fd, "projectId", 60);
  await adminAction(fd, { back: `/admin/projects/${projectId}#dashboard`, entity: "ProjectHotspot", action: "save", success: "Marker saved." }, async () => {
    const imageId = str(fd, "imageId", 60);
    const locale = localeOf(fd);
    await prisma.projectImage.findFirstOrThrow({ where: { id: imageId, projectId, section: "DASHBOARD" } });
    const hotspotId = optStr(fd, "hotspotId", 60);
    const icon = oneOf(fd, "icon", DASHBOARD_ICON_NAMES as [string, ...string[]], "circle-check");
    const label = str(fd, "label", 80);
    const body = str(fd, "body", 300);
    if (!label || !body) throw new ActionError("A marker needs a name and an explanation.");
    const position = { x: pct(fd, "x"), y: pct(fd, "y"), icon };
    if (hotspotId) {
      const h = await prisma.projectHotspot.findFirstOrThrow({ where: { id: hotspotId, imageId } });
      await prisma.projectHotspot.update({ where: { id: h.id }, data: { ...position, label: withLocale(h.label, locale, label), body: withLocale(h.body, locale, body) } });
      return h.id;
    }
    const last = await prisma.projectHotspot.aggregate({ where: { imageId }, _max: { sortOrder: true } });
    const created = await prisma.projectHotspot.create({
      data: { imageId, ...position, label: { [locale]: label }, body: { [locale]: body }, sortOrder: (last._max.sortOrder ?? -1) + 1 },
    });
    return created.id;
  });
}

export async function deleteHotspot(fd: FormData) {
  const projectId = str(fd, "projectId", 60);
  await adminAction(fd, { back: `/admin/projects/${projectId}#dashboard`, entity: "ProjectHotspot", action: "delete", success: "Marker removed." }, async () => {
    const hotspotId = str(fd, "hotspotId", 60);
    const h = await prisma.projectHotspot.findFirstOrThrow({ where: { id: hotspotId, image: { projectId } } });
    await prisma.projectHotspot.delete({ where: { id: h.id } });
    return h.id;
  });
}
