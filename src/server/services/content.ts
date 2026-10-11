import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { prisma } from "@/server/db";
import { altFor } from "@/lib/media";
import { getAdmin } from "@/server/auth/session";
import { fallbackChain, type Locale } from "@/lib/i18n/locales";
import type { PublishStatus } from "@/server/generated/prisma/client";

export const PREVIEW_COOKIE = "zack_preview";

export async function getContentOverrides(locales: Locale[]) {
  return prisma.pageContent.findMany({ where: { locale: { in: locales } }, select: { key: true, locale: true, value: true } });
}

/** Drafts are visible only to a signed-in admin who switched preview on in the dashboard. */
export const isPreview = cache(async () => {
  if ((await cookies()).get(PREVIEW_COOKIE)?.value !== "1") return false;
  return (await getAdmin()) !== null;
});

async function visible(): Promise<{ in: PublishStatus[] }> {
  return { in: (await isPreview()) ? ["PUBLISHED", "DRAFT"] : ["PUBLISHED"] };
}

/** Best translation for `locale` along its fallback chain (es-MX → es → en), else the first row. */
export function pick<T extends { locale: string }>(rows: T[], locale: Locale): T | undefined {
  for (const l of fallbackChain(locale)) {
    const hit = rows.find((r) => r.locale === l);
    if (hit) return hit;
  }
  return rows[0];
}

export const getSettings = cache(async () => {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 1 },
    include: {
      heroImage: true,
      heroDepth: true,
      heroModel: true,
      ogImage: true,
      heroFrames: { orderBy: { sortOrder: "asc" }, include: { media: true } },
    },
  });
  const socials = await prisma.socialLink.findMany({ where: { visible: true }, orderBy: { sortOrder: "asc" } });
  return { settings, socials };
});

export const getLocaleSettings = cache(async () => prisma.localeSetting.findMany({ orderBy: { sortOrder: "asc" } }));

export const getProfile = cache(async (locale: Locale) => {
  const profile = await prisma.profile.findUnique({ where: { id: 1 }, include: { translations: true, portrait: true } });
  if (!profile) return null;
  const t = pick(profile.translations, locale);
  const skills = (profile.skills ?? {}) as Partial<Record<"frontend" | "backend" | "databases" | "tools", string[]>>;
  return {
    publicName: profile.publicName,
    fullName: profile.showFullName ? profile.fullName : null,
    portrait: profile.portrait,
    languages: profile.languages,
    skills,
    title: t?.title ?? "",
    intro: t?.intro ?? "",
    bio: t?.bio ?? null,
    location: t?.location ?? null,
    whyMe: t?.whyMe ?? [],
    interest: t?.interest ?? null,
  };
});

export const getExperience = cache(async (locale: Locale) => {
  const items = await prisma.experienceItem.findMany({
    where: { status: await visible() },
    orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }],
    include: { translations: true },
  });
  return items.map((i) => ({ ...i, t: pick(i.translations, locale) }));
});

const projectInclude = {
  translations: true,
  images: { where: { section: "GALLERY" as const }, orderBy: { sortOrder: "asc" as const }, include: { media: true } },
  links: { orderBy: { sortOrder: "asc" as const } },
};

export type PublicProject = Awaited<ReturnType<typeof getProjects>>[number];

export const getProjects = cache(async (locale: Locale) => {
  const rows = await prisma.project.findMany({
    where: { status: await visible() },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: projectInclude,
  });
  return rows.map((p) => ({ ...p, t: pick(p.translations, locale) }));
});

export const getProjectBySlug = cache(async (slug: string, locale: Locale) => {
  const all = await getProjects(locale);
  const index = all.findIndex((p) => p.slug === slug);
  if (index === -1) return null;
  const project = all[index];
  const next = all.length > 1 ? all[(index + 1) % all.length] : null;
  const [testimonials, screens] = await Promise.all([
    prisma.testimonial.findMany({
      where: { projectId: project.id, status: "PUBLISHED", clientApproved: true },
      include: { translations: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.projectImage.findMany({
      where: { projectId: project.id, section: "DASHBOARD" },
      orderBy: { sortOrder: "asc" },
      include: { media: true, hotspots: { orderBy: { sortOrder: "asc" } } },
    }),
  ]);
  // Dashboard tour: each screen with its markers, texts resolved along the language fallback chain.
  const dashboard = screens.map((s) => ({
    id: s.id,
    kind: s.kind,
    src: s.media.url,
    width: s.media.width ?? 1920,
    height: s.media.height ?? 1200,
    alt: altFor(s.media.alt, locale),
    title: altFor(s.title, locale),
    hotspots: s.hotspots.map((h) => ({ id: h.id, x: h.x, y: h.y, icon: h.icon, label: altFor(h.label, locale), body: altFor(h.body, locale) })),
  }));
  return { project, next, dashboard, testimonials: testimonials.map((x) => ({ ...x, t: pick(x.translations, locale) })) };
});

export const getServices = cache(async (locale: Locale) => {
  const rows = await prisma.service.findMany({
    where: { status: await visible() },
    orderBy: { sortOrder: "asc" },
    include: { translations: true, examples: { orderBy: { sortOrder: "asc" }, include: { translations: true } } },
  });
  return rows.map((s) => ({
    id: s.id,
    category: s.category,
    t: pick(s.translations, locale),
    examples: s.examples.map((e) => pick(e.translations, locale)?.label).filter((x): x is string => !!x),
  }));
});

export const getPackages = cache(async (locale: Locale) => {
  const rows = await prisma.pricingPackage.findMany({
    where: { status: await visible() },
    orderBy: { sortOrder: "asc" },
    include: { translations: true, prices: true },
  });
  return rows.map((p) => ({
    id: p.id,
    status: p.status,
    category: p.category,
    highlighted: p.highlighted,
    deliveryWeeksMin: p.deliveryWeeksMin,
    deliveryWeeksMax: p.deliveryWeeksMax,
    t: pick(p.translations, locale),
    prices: p.prices.map((x) => ({
      market: x.market,
      currency: x.currency,
      min: Number(x.minMinor),
      max: x.maxMinor === null ? null : Number(x.maxMinor),
      step: x.stepMinor === null ? null : Number(x.stepMinor),
    })),
  }));
});

export const getOffers = cache(async (locale: Locale) => {
  const rows = await prisma.countryOffer.findMany({
    where: { status: await visible() },
    orderBy: { sortOrder: "asc" },
    include: { translations: true },
  });
  return rows.map((o) => ({
    id: o.id,
    status: o.status,
    market: o.market,
    currency: o.currency,
    reward: Number(o.rewardMinor),
    category: o.category,
    minProjectValue: o.minProjectValueMinor === null ? null : Number(o.minProjectValueMinor),
    t: pick(o.translations, locale),
  }));
});

export const getTestimonials = cache(async (locale: Locale) => {
  const rows = await prisma.testimonial.findMany({
    where: { status: "PUBLISHED", clientApproved: true },
    orderBy: { sortOrder: "asc" },
    include: { translations: true, project: { select: { slug: true } } },
  });
  return rows.map((x) => ({ ...x, t: pick(x.translations, locale) }));
});

/** Visitor country from the host's geo header, when the host provides one. */
export async function visitorCountry(): Promise<string | null> {
  const h = await headers();
  const c = h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry");
  return c && /^[A-Z]{2}$/.test(c) ? c : null;
}
