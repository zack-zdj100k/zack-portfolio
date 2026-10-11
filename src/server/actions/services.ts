"use server";

import { prisma } from "@/server/db";
import { ActionError, bool, currencyCode, int, lines, localeOf, marketCode, moneyMinor, oneOf, optStr, str } from "./helpers";
import { adminAction } from "./run";

const CATEGORIES = ["WEBSITE", "APP", "SOFTWARE"] as const;
const back = (locale?: string) => `/admin/services${locale ? `?locale=${locale}` : ""}`;

// ── Services ────────────────────────────────────────────────────────────────

export async function createService(fd: FormData) {
  await adminAction(fd, { back: back(), entity: "Service", action: "create", success: "Service added as a draft." }, async () => {
    const name = str(fd, "name", 120);
    if (!name) throw new ActionError("Name is required.");
    const last = await prisma.service.aggregate({ _max: { sortOrder: true } });
    const s = await prisma.service.create({
      data: {
        category: oneOf(fd, "category", CATEGORIES, "WEBSITE"),
        sortOrder: (last._max.sortOrder ?? 0) + 1,
        translations: { create: { locale: "en", name, description: "", reviewed: true } },
      },
    });
    return s.id;
  });
}

export async function saveService(fd: FormData) {
  const locale = localeOf(fd);
  await adminAction(fd, { back: back(locale), entity: "Service", action: "update", success: "Service saved." }, async () => {
    const id = str(fd, "id", 60);
    const name = str(fd, "name", 120);
    if (!name) throw new ActionError("Name is required.");
    await prisma.service.update({
      where: { id },
      data: {
        category: oneOf(fd, "category", CATEGORIES, "WEBSITE"),
        status: oneOf(fd, "status", ["DRAFT", "PUBLISHED"] as const, "DRAFT"),
        sortOrder: int(fd, "sortOrder", { max: 999 }) ?? 0,
      },
    });
    const data = { name, description: str(fd, "description", 1500), reviewed: bool(fd, "reviewed") };
    await prisma.serviceTranslation.upsert({
      where: { serviceId_locale: { serviceId: id, locale } },
      update: data,
      create: { serviceId: id, locale, ...data },
    });
    // Examples: one per line, edited per language. Lines are matched to examples by position.
    const labels = lines(fd, "examples", 30, 80);
    const existing = await prisma.serviceExample.findMany({ where: { serviceId: id }, orderBy: { sortOrder: "asc" } });
    if (locale === "en") {
      // English defines the list: add or remove example rows to match.
      for (const extra of existing.slice(labels.length)) await prisma.serviceExample.delete({ where: { id: extra.id } });
      for (let i = existing.length; i < labels.length; i++) await prisma.serviceExample.create({ data: { serviceId: id, sortOrder: i } });
    }
    const rows = await prisma.serviceExample.findMany({ where: { serviceId: id }, orderBy: { sortOrder: "asc" } });
    for (const [i, row] of rows.entries()) {
      const label = labels[i];
      if (!label) continue;
      await prisma.serviceExampleTranslation.upsert({
        where: { exampleId_locale: { exampleId: row.id, locale } },
        update: { label, reviewed: data.reviewed },
        create: { exampleId: row.id, locale, label, reviewed: data.reviewed },
      });
    }
    return id;
  });
}

export async function deleteService(fd: FormData) {
  await adminAction(fd, { back: back(), entity: "Service", action: "delete", success: "Service deleted." }, async () => {
    const id = str(fd, "id", 60);
    await prisma.service.delete({ where: { id } });
    return id;
  });
}

// ── Pricing packages ────────────────────────────────────────────────────────

export async function createPackage(fd: FormData) {
  await adminAction(fd, { back: back(), entity: "PricingPackage", action: "create", success: "Package added as a draft." }, async () => {
    const name = str(fd, "name", 120);
    if (!name) throw new ActionError("Name is required.");
    const last = await prisma.pricingPackage.aggregate({ _max: { sortOrder: true } });
    const p = await prisma.pricingPackage.create({
      data: { sortOrder: (last._max.sortOrder ?? 0) + 1, translations: { create: { locale: "en", name, features: [], reviewed: true } } },
    });
    return p.id;
  });
}

export async function savePackage(fd: FormData) {
  const locale = localeOf(fd);
  await adminAction(fd, { back: back(locale), entity: "PricingPackage", action: "update", success: "Package saved." }, async () => {
    const id = str(fd, "id", 60);
    const name = str(fd, "name", 120);
    if (!name) throw new ActionError("Name is required.");
    const category = oneOf(fd, "category", ["", ...CATEGORIES] as const, "");
    const wMin = int(fd, "deliveryWeeksMin", { min: 1, max: 104 });
    const wMax = int(fd, "deliveryWeeksMax", { min: 1, max: 104 });
    if (wMin && wMax && wMax < wMin) throw new ActionError("Maximum delivery weeks can't be less than the minimum.");
    await prisma.pricingPackage.update({
      where: { id },
      data: {
        category: category === "" ? null : category,
        status: oneOf(fd, "status", ["DRAFT", "PUBLISHED"] as const, "DRAFT"),
        highlighted: bool(fd, "highlighted"),
        sortOrder: int(fd, "sortOrder", { max: 999 }) ?? 0,
        deliveryWeeksMin: wMin,
        deliveryWeeksMax: wMax,
      },
    });
    const data = { name, description: optStr(fd, "description", 600), features: lines(fd, "features", 12, 120), addOns: lines(fd, "addOns", 10, 120), reviewed: bool(fd, "reviewed") };
    await prisma.pricingPackageTranslation.upsert({
      where: { packageId_locale: { packageId: id, locale } },
      update: data,
      create: { packageId: id, locale, ...data },
    });
    return id;
  });
}

export async function savePrice(fd: FormData) {
  await adminAction(fd, { back: back(), entity: "PackagePrice", action: "save", success: "Price saved." }, async () => {
    const packageId = str(fd, "packageId", 60);
    const market = marketCode(fd, "market");
    const currency = currencyCode(fd, "currency");
    const min = moneyMinor(fd, "min");
    const max = moneyMinor(fd, "max");
    const step = moneyMinor(fd, "step");
    if (min === null) throw new ActionError("Enter the minimum price as a number, e.g. 40000.");
    if (max !== null && max < min) throw new ActionError("The maximum can't be lower than the minimum.");
    if (step !== null && (step <= BigInt(0) || (max !== null && step > max - min)))
      throw new ActionError("The slider step must be above 0 and no bigger than the gap between minimum and maximum.");
    await prisma.packagePrice.upsert({
      where: { packageId_market: { packageId, market } },
      update: { currency, minMinor: min, maxMinor: max, stepMinor: step },
      create: { packageId, market, currency, minMinor: min, maxMinor: max, stepMinor: step },
    });
    return packageId;
  });
}

export async function deletePrice(fd: FormData) {
  await adminAction(fd, { back: back(), entity: "PackagePrice", action: "delete", success: "Price removed." }, async () => {
    const id = str(fd, "id", 60);
    await prisma.packagePrice.delete({ where: { id } });
    return id;
  });
}

export async function deletePackage(fd: FormData) {
  await adminAction(fd, { back: back(), entity: "PricingPackage", action: "delete", success: "Package deleted." }, async () => {
    const id = str(fd, "id", 60);
    await prisma.pricingPackage.delete({ where: { id } });
    return id;
  });
}
