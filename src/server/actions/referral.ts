"use server";

import { prisma } from "@/server/db";
import { ActionError, bool, currencyCode, int, localeOf, marketCode, moneyMinor, oneOf, optStr, str } from "./helpers";
import { adminAction } from "./run";

const CATEGORIES = ["", "WEBSITE", "APP", "SOFTWARE"] as const;
const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "WON", "NOT_ELIGIBLE", "REWARD_DUE", "PAID"] as const;

export async function createOffer(fd: FormData) {
  await adminAction(fd, { back: "/admin/referral", entity: "CountryOffer", action: "create", success: "Offer added as a draft." }, async () => {
    const reward = moneyMinor(fd, "reward");
    if (reward === null) throw new ActionError("Enter the reward amount.");
    const offer = await prisma.countryOffer.create({
      data: {
        market: marketCode(fd, "market"),
        currency: currencyCode(fd, "currency"),
        rewardMinor: reward,
        translations: { create: { locale: "en", whenEarned: "", terms: "", reviewed: true } },
      },
    });
    return offer.id;
  });
}

export async function saveOffer(fd: FormData) {
  const locale = localeOf(fd);
  await adminAction(fd, { back: `/admin/referral?locale=${locale}`, entity: "CountryOffer", action: "update", success: "Offer saved." }, async () => {
    const id = str(fd, "id", 60);
    const reward = moneyMinor(fd, "reward");
    if (reward === null) throw new ActionError("Enter the reward amount.");
    const status = oneOf(fd, "status", ["DRAFT", "PUBLISHED"] as const, "DRAFT");
    const whenEarned = str(fd, "whenEarned", 2000);
    const terms = str(fd, "terms", 5000);
    if (status === "PUBLISHED") {
      const en = locale === "en" ? { whenEarned, terms } : await prisma.countryOfferTranslation.findUnique({ where: { offerId_locale: { offerId: id, locale: "en" } } });
      if (!en?.whenEarned || !en.terms) throw new ActionError("Write the English 'when earned' and terms before publishing.");
    }
    const category = oneOf(fd, "category", CATEGORIES, "");
    await prisma.countryOffer.update({
      where: { id },
      data: {
        market: marketCode(fd, "market"),
        currency: currencyCode(fd, "currency"),
        rewardMinor: reward,
        category: category === "" ? null : category,
        minProjectValueMinor: moneyMinor(fd, "minProjectValue"),
        status,
        sortOrder: int(fd, "sortOrder", { max: 999 }) ?? 0,
      },
    });
    const data = { whenEarned, terms, reviewed: bool(fd, "reviewed") };
    await prisma.countryOfferTranslation.upsert({
      where: { offerId_locale: { offerId: id, locale } },
      update: data,
      create: { offerId: id, locale, ...data },
    });
    return id;
  });
}

export async function deleteOffer(fd: FormData) {
  await adminAction(fd, { back: "/admin/referral", entity: "CountryOffer", action: "delete", success: "Offer deleted. Existing referrals keep their saved reward." }, async () => {
    const id = str(fd, "id", 60);
    await prisma.countryOffer.delete({ where: { id } });
    return id;
  });
}

export async function updateReferral(fd: FormData) {
  const id = str(fd, "id", 60);
  await adminAction(fd, { back: `/admin/referrals/${id}`, entity: "Referral", action: "update", success: "Referral updated." }, async () => {
    const status = oneOf(fd, "status", STATUSES, "NEW");
    const current = await prisma.referral.findUniqueOrThrow({ where: { id } });
    await prisma.referral.update({
      where: { id },
      data: {
        status,
        adminNotes: optStr(fd, "adminNotes", 5000),
        paidAt: status === "PAID" ? (current.paidAt ?? new Date()) : null,
      },
    });
    return id;
  });
}

export async function archiveReferral(fd: FormData) {
  const id = str(fd, "id", 60);
  await adminAction(fd, { back: "/admin/referrals", entity: "Referral", action: "archive", success: "Referral archived." }, async () => {
    const r = await prisma.referral.findUniqueOrThrow({ where: { id } });
    await prisma.referral.update({ where: { id }, data: { archivedAt: r.archivedAt ? null : new Date() } });
    return id;
  });
}

export async function deleteReferral(fd: FormData) {
  await adminAction(fd, { back: "/admin/referrals", entity: "Referral", action: "delete", success: "Referral permanently deleted." }, async () => {
    const id = str(fd, "id", 60);
    await prisma.referral.delete({ where: { id } });
    return id;
  });
}
