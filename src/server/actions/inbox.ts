"use server";

import { prisma } from "@/server/db";
import { deleteMedia, mediaUsage, saveImage } from "@/server/services/media";
import { ActionError, bool, int, localeOf, oneOf, optStr, str } from "./helpers";
import { adminAction } from "./run";

// ── Contact inquiries ──────────────────────────────────────────────────────

export async function updateInquiry(fd: FormData) {
  const id = str(fd, "id", 60);
  await adminAction(fd, { back: `/admin/inquiries/${id}`, entity: "ContactInquiry", action: "update", success: "Inquiry updated." }, async () => {
    await prisma.contactInquiry.update({
      where: { id },
      data: {
        status: oneOf(fd, "status", ["NEW", "IN_PROGRESS", "REPLIED", "CLOSED"] as const, "NEW"),
        adminNotes: optStr(fd, "adminNotes", 5000),
      },
    });
    return id;
  });
}

export async function archiveInquiry(fd: FormData) {
  const id = str(fd, "id", 60);
  await adminAction(fd, { back: "/admin/inquiries", entity: "ContactInquiry", action: "archive", success: "Inquiry archive state changed." }, async () => {
    const row = await prisma.contactInquiry.findUniqueOrThrow({ where: { id } });
    await prisma.contactInquiry.update({ where: { id }, data: { archivedAt: row.archivedAt ? null : new Date() } });
    return id;
  });
}

export async function deleteInquiry(fd: FormData) {
  await adminAction(fd, { back: "/admin/inquiries", entity: "ContactInquiry", action: "delete", success: "Inquiry permanently deleted." }, async () => {
    const id = str(fd, "id", 60);
    await prisma.contactInquiry.delete({ where: { id } });
    return id;
  });
}

// ── Testimonials ───────────────────────────────────────────────────────────

export async function saveTestimonial(fd: FormData) {
  const locale = localeOf(fd);
  await adminAction(fd, { back: `/admin/testimonials?locale=${locale}`, entity: "Testimonial", action: "save", success: "Testimonial saved." }, async () => {
    const id = optStr(fd, "id", 60);
    const authorName = str(fd, "authorName", 120);
    const quote = str(fd, "quote", 1200);
    if (!authorName || !quote) throw new ActionError("Name and quote are required.");
    const clientApproved = bool(fd, "clientApproved");
    const status = oneOf(fd, "status", ["DRAFT", "PUBLISHED"] as const, "DRAFT");
    // A testimonial can only go public once the client has approved it.
    if (status === "PUBLISHED" && !clientApproved) throw new ActionError("Confirm the client approved publication before publishing.");
    const data = {
      authorName,
      authorRole: optStr(fd, "authorRole", 120),
      projectId: optStr(fd, "projectId", 60),
      clientApproved,
      status,
      sortOrder: int(fd, "sortOrder", { max: 999 }) ?? 0,
    };
    const row = id ? await prisma.testimonial.update({ where: { id }, data }) : await prisma.testimonial.create({ data });
    await prisma.testimonialTranslation.upsert({
      where: { testimonialId_locale: { testimonialId: row.id, locale } },
      update: { quote, reviewed: bool(fd, "reviewed") },
      create: { testimonialId: row.id, locale, quote, reviewed: bool(fd, "reviewed") },
    });
    return row.id;
  });
}

export async function deleteTestimonial(fd: FormData) {
  await adminAction(fd, { back: "/admin/testimonials", entity: "Testimonial", action: "delete", success: "Testimonial deleted." }, async () => {
    const id = str(fd, "id", 60);
    await prisma.testimonial.delete({ where: { id } });
    return id;
  });
}

// ── Media library ──────────────────────────────────────────────────────────

export async function uploadMedia(fd: FormData) {
  await adminAction(fd, { back: "/admin/media", entity: "MediaAsset", action: "upload", success: "Uploaded." }, async () => {
    const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    if (!files.length) throw new ActionError("Select at least one image.");
    for (const f of files.slice(0, 20)) await saveImage(f);
  });
}

export async function saveMediaAlt(fd: FormData) {
  await adminAction(fd, { back: "/admin/media", entity: "MediaAsset", action: "alt", success: "Description saved." }, async () => {
    const id = str(fd, "id", 60);
    const locale = localeOf(fd);
    const media = await prisma.mediaAsset.findUniqueOrThrow({ where: { id } });
    const alt = { ...((media.alt as Record<string, string>) ?? {}), [locale]: str(fd, "alt", 200) };
    await prisma.mediaAsset.update({ where: { id }, data: { alt } });
    return id;
  });
}

export async function removeMedia(fd: FormData) {
  await adminAction(fd, { back: "/admin/media", entity: "MediaAsset", action: "delete", success: "File deleted." }, async () => {
    const id = str(fd, "id", 60);
    if ((await mediaUsage(id)) > 0) throw new ActionError("This file is still used somewhere. Remove it from there first.");
    await deleteMedia(id);
    return id;
  });
}
