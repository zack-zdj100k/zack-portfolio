"use server";

import { prisma } from "@/server/db";
import { COUNTRY_CODES } from "@/lib/countries";
import { ActionError, all, bool, currencyCode, int, localeOf, moneyMinor, oneOf, optStr, str } from "./helpers";
import { adminAction } from "./run";

const CATEGORIES = ["WEBSITE", "APP", "SOFTWARE"] as const;
const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "WON", "NOT_ELIGIBLE", "REWARD_DUE", "PAID"] as const;

const back = (fd: FormData) => `/admin/referral?locale=${str(fd, "locale", 10) || "en"}`;

function categories(fd: FormData) {
  return all(fd, "categories").filter((c): c is (typeof CATEGORIES)[number] => (CATEGORIES as readonly string[]).includes(c));
}

function countries(fd: FormData) {
  return all(fd, "countries", 250, 2)
    .map((c) => c.toUpperCase())
    .filter((c) => (COUNTRY_CODES as readonly string[]).includes(c));
}

type Texts = { payoutConditions: string | null; terms: string | null };
const filled = (rows: Texts[]) => rows.some((r) => r.payoutConditions?.trim()) && rows.some((r) => r.terms?.trim());

/**
 * An offer can go live once its payout conditions and terms are written in at least one language;
 * visitors reading another language fall back to it. `pending` is text being saved right now.
 */
async function offerHasTerms(offerId: string, pending?: { locale: string } & Texts) {
  const rows = await prisma.referralOfferTranslation.findMany({ where: { offerId, ...(pending ? { locale: { not: pending.locale } } : {}) } });
  return filled(pending ? [...rows, pending] : rows);
}

export async function createOffer(fd: FormData) {
  await adminAction(fd, { back: back(fd), entity: "ReferralOffer", action: "create", success: "Offer added as a draft. Now add its countries." }, async () => {
    const name = str(fd, "name", 120);
    if (!name) throw new ActionError("Give the offer an internal name.");
    const last = await prisma.referralOffer.aggregate({ _max: { sortOrder: true } });
    const offer = await prisma.referralOffer.create({
      data: {
        name,
        sortOrder: (last._max.sortOrder ?? -1) + 1,
        translations: { create: { locale: "en", eligibility: "", payoutConditions: "", terms: "", reviewed: true } },
      },
    });
    return offer.id;
  });
}

export async function saveOffer(fd: FormData) {
  const locale = localeOf(fd);
  await adminAction(fd, { back: back(fd), entity: "ReferralOffer", action: "update", success: "Offer saved." }, async () => {
    const id = str(fd, "id", 60);
    const name = str(fd, "name", 120);
    if (!name) throw new ActionError("The internal name can't be empty.");
    const status = oneOf(fd, "status", ["DRAFT", "PUBLISHED"] as const, "DRAFT");
    const text = { eligibility: str(fd, "eligibility", 3000), payoutConditions: str(fd, "payoutConditions", 3000), terms: str(fd, "terms", 5000) };
    if (status === "PUBLISHED") {
      if (!(await offerHasTerms(id, { locale, ...text }))) throw new ActionError("Write the payout conditions and terms before publishing.");
    }
    const data = { ...text, reviewed: bool(fd, "reviewed") };
    await prisma.$transaction([
      prisma.referralOffer.update({ where: { id }, data: { name, status, sortOrder: int(fd, "sortOrder", { max: 999 }) ?? 0 } }),
      prisma.referralOfferTranslation.upsert({ where: { offerId_locale: { offerId: id, locale } }, update: data, create: { offerId: id, locale, ...data } }),
    ]);
    if (status === "PUBLISHED") await assertNoCountryClash(id);
    return id;
  });
}

/** Publishes an offer and, in one go, its draft countries, so the countries just added go live. */
export async function publishOffer(fd: FormData) {
  await adminAction(fd, { back: back(fd), entity: "ReferralOffer", action: "publish", success: "Offer published: its countries are now live." }, async () => {
    const id = str(fd, "id", 60);
    if (!(await offerHasTerms(id))) throw new ActionError("Write the offer's payout conditions and terms, save the offer, then publish.");
    await prisma.$transaction([
      prisma.referralOffer.update({ where: { id }, data: { status: "PUBLISHED" } }),
      prisma.referralOfferCountry.updateMany({ where: { offerId: id, status: "DRAFT" }, data: { status: "PUBLISHED" } }),
    ]);
    await assertNoCountryClash(id);
    return id;
  });
}

export async function deleteOffer(fd: FormData) {
  await adminAction(fd, { back: back(fd), entity: "ReferralOffer", action: "delete", success: "Offer deleted. Existing referrals keep their saved reward." }, async () => {
    const id = str(fd, "id", 60);
    await prisma.referralOffer.delete({ where: { id } });
    return id;
  });
}

/** Adds the ticked countries to an offer, all with the same starting settings. */
export async function addOfferCountries(fd: FormData) {
  await adminAction(fd, { back: back(fd), entity: "ReferralOfferCountry", action: "create", success: "Countries added." }, async () => {
    const offerId = str(fd, "offerId", 60);
    const picked = countries(fd);
    if (picked.length === 0) throw new ActionError("Tick at least one country.");
    const reward = moneyMinor(fd, "reward");
    if (reward === null) throw new ActionError("Enter the reward amount.");
    const status = oneOf(fd, "status", ["DRAFT", "PUBLISHED"] as const, "PUBLISHED");
    const created = await prisma.referralOfferCountry.createMany({
      data: picked.map((country) => ({
        offerId,
        country,
        currency: currencyCode(fd, "currency"),
        rewardMinor: reward,
        categories: categories(fd),
        minProjectValueMinor: moneyMinor(fd, "minProjectValue"),
        status,
      })),
      skipDuplicates: true,
    });
    if (created.count === 0) throw new ActionError("Those countries are already in this offer.");
    if (status === "PUBLISHED") {
      if (!(await offerHasTerms(offerId))) {
        await prisma.referralOfferCountry.updateMany({ where: { offerId, country: { in: picked } }, data: { status: "DRAFT" } });
        throw new ActionError("Added as drafts: write the offer's payout conditions and terms, then publish the countries.");
      }
      await assertNoCountryClash(offerId);
    }
    return offerId;
  });
}

export async function saveOfferCountry(fd: FormData) {
  const locale = localeOf(fd);
  await adminAction(fd, { back: back(fd), entity: "ReferralOfferCountry", action: "update", success: "Country saved." }, async () => {
    const id = str(fd, "id", 60);
    const reward = moneyMinor(fd, "reward");
    if (reward === null) throw new ActionError("Enter the reward amount.");
    const status = oneOf(fd, "status", ["DRAFT", "PUBLISHED"] as const, "DRAFT");
    const row = await prisma.referralOfferCountry.update({
      where: { id },
      data: {
        available: bool(fd, "available"),
        currency: currencyCode(fd, "currency"),
        rewardMinor: reward,
        categories: categories(fd),
        minProjectValueMinor: moneyMinor(fd, "minProjectValue"),
        status,
      },
    });
    const text = { eligibility: optStr(fd, "eligibility", 3000), payoutConditions: optStr(fd, "payoutConditions", 3000), terms: optStr(fd, "terms", 5000) };
    const data = { ...text, reviewed: bool(fd, "reviewed") };
    await prisma.referralOfferCountryTranslation.upsert({
      where: { offerCountryId_locale: { offerCountryId: id, locale } },
      update: data,
      create: { offerCountryId: id, locale, ...data },
    });
    if (status === "PUBLISHED") {
      const offerRows = await prisma.referralOfferTranslation.findMany({ where: { offerId: row.offerId } });
      const ownRows = await prisma.referralOfferCountryTranslation.findMany({ where: { offerCountryId: id } });
      if (!filled([...offerRows, ...ownRows])) {
        await prisma.referralOfferCountry.update({ where: { id }, data: { status: "DRAFT" } });
        throw new ActionError("Saved as a draft: write the payout conditions and terms before publishing this country.");
      }
      await assertNoCountryClash(row.offerId);
    }
    return id;
  });
}

/** Updates several countries of one offer at once; empty fields stay unchanged. */
export async function bulkUpdateOfferCountries(fd: FormData) {
  await adminAction(fd, { back: back(fd), entity: "ReferralOfferCountry", action: "bulk-update", success: "Selected countries updated." }, async () => {
    const offerId = str(fd, "offerId", 60);
    const picked = countries(fd);
    if (picked.length === 0) throw new ActionError("Tick the countries to update.");
    const reward = moneyMinor(fd, "reward");
    const currency = str(fd, "currency", 3) ? currencyCode(fd, "currency") : null;
    const status = oneOf(fd, "status", ["", "DRAFT", "PUBLISHED"] as const, "");
    const available = oneOf(fd, "available", ["", "yes", "no"] as const, "");
    const cats = categories(fd);
    await prisma.referralOfferCountry.updateMany({
      where: { offerId, country: { in: picked } },
      data: {
        ...(reward !== null ? { rewardMinor: reward } : {}),
        ...(currency ? { currency } : {}),
        ...(status ? { status } : {}),
        ...(available ? { available: available === "yes" } : {}),
        ...(bool(fd, "setCategories") ? { categories: cats } : {}),
      },
    });
    if (status === "PUBLISHED") {
      if (!(await offerHasTerms(offerId))) {
        await prisma.referralOfferCountry.updateMany({ where: { offerId, country: { in: picked } }, data: { status: "DRAFT" } });
        throw new ActionError("Kept as drafts: write the offer's payout conditions and terms before publishing countries.");
      }
      await assertNoCountryClash(offerId);
    }
    return offerId;
  });
}

export async function removeOfferCountry(fd: FormData) {
  await adminAction(fd, { back: back(fd), entity: "ReferralOfferCountry", action: "delete", success: "Country removed from the offer. Existing referrals keep their saved reward." }, async () => {
    const id = str(fd, "id", 60);
    await prisma.referralOfferCountry.delete({ where: { id } });
    return id;
  });
}

/**
 * A country may be live in only one published offer, so a visitor never sees two rewards for the
 * same thing. Countries that clash are put back to draft and the admin is told which ones.
 */
async function assertNoCountryClash(offerId: string) {
  const mine = await prisma.referralOfferCountry.findMany({ where: { offerId, status: "PUBLISHED", offer: { status: "PUBLISHED" } } });
  if (mine.length === 0) return;
  const others = await prisma.referralOfferCountry.findMany({
    where: { offerId: { not: offerId }, status: "PUBLISHED", offer: { status: "PUBLISHED" }, country: { in: mine.map((m) => m.country) } },
    include: { offer: { select: { name: true } } },
  });
  if (others.length === 0) return;
  const clash = [...new Set(others.map((o) => o.country))];
  await prisma.referralOfferCountry.updateMany({ where: { offerId, country: { in: clash } }, data: { status: "DRAFT" } });
  throw new ActionError(`Already published in "${others[0].offer.name}": ${clash.join(", ")}. Those countries were set back to draft here.`);
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
