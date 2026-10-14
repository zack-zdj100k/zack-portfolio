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

/** First non-empty value of one field along the fallback chain, so a half-translated row never hides English text. */
export function pickField<T extends { locale: string }, K extends keyof T>(rows: T[], locale: Locale, field: K): string | null {
  for (const l of fallbackChain(locale)) {
    const v = rows.find((r) => r.locale === l)?.[field];
    if (typeof v === "string" && v.trim()) return v;
  }
  return null;
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
  return {
    publicName: profile.publicName,
    fullName: profile.showFullName ? profile.fullName : null,
    portrait: profile.portrait,
    languages: profile.languages,
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
  const [testimonials, screens, nodes] = await Promise.all([
    prisma.testimonial.findMany({
      where: { projectId: project.id, status: "PUBLISHED", clientApproved: true },
      include: { translations: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.projectImage.findMany({
      where: { projectId: project.id, section: "DASHBOARD" },
      orderBy: { sortOrder: "asc" },
      include: { media: true, hotspots: { orderBy: { sortOrder: "asc" }, include: { media: true } } },
    }),
    project.architectureStatus === "HIDDEN" ? [] : prisma.architectureNode.findMany({ where: { projectId: project.id }, orderBy: { sortOrder: "asc" } }),
  ]);
  // "How it's built": texts per field along the fallback chain, nodes as a main chain + branches.
  const archNode = (n: (typeof nodes)[number]) => ({
    id: n.id,
    kind: n.kind,
    technology: n.technology,
    label: altFor(n.label, locale) || null,
    body: altFor(n.body, locale) || null,
  });
  const architecture =
    project.architectureStatus === "HIDDEN"
      ? null
      : {
          proposed: project.architectureStatus === "PROPOSED",
          frontend: pickField(project.translations, locale, "frontendText"),
          backend: pickField(project.translations, locale, "backendText"),
          database: pickField(project.translations, locale, "databaseText"),
          flow: pickField(project.translations, locale, "flowText"),
          chain: nodes
            .filter((n) => !n.parentId)
            .map((n) => ({ ...archNode(n), branches: nodes.filter((b) => b.parentId === n.id).map(archNode) })),
        };
  // Dashboard tour: each screen with its markers, texts resolved along the language fallback chain.
  const dashboard = screens.map((s) => ({
    id: s.id,
    kind: s.kind,
    src: s.media.url,
    width: s.media.width ?? 1920,
    height: s.media.height ?? 1200,
    alt: altFor(s.media.alt, locale),
    title: altFor(s.title, locale),
    hotspots: s.hotspots.map((h) => ({
      id: h.id,
      x: h.x,
      y: h.y,
      icon: h.icon,
      label: altFor(h.label, locale),
      body: altFor(h.body, locale),
      // The feature's own screenshot, when one was added.
      image: h.media ? { src: h.media.url, width: h.media.width ?? 1920, height: h.media.height ?? 1200 } : null,
    })),
  }));
  return { project, next, dashboard, architecture, testimonials: testimonials.map((x) => ({ ...x, t: pick(x.translations, locale) })) };
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

export type PublicOffer = Awaited<ReturnType<typeof getOffers>>[number];

/**
 * Referral offers, one entry per eligible country. Only countries the owner listed are returned
 * (there is no "every other country" offer). Both the programme and the country must be published,
 * and the country marked available.
 */
export const getOffers = cache(async (locale: Locale) => {
  const statuses = await visible();
  const rows = await prisma.referralOfferCountry.findMany({
    where: { status: statuses, available: true, offer: { status: statuses } },
    orderBy: [{ offer: { sortOrder: "asc" } }, { country: "asc" }],
    include: { translations: true, offer: { include: { translations: true } } },
  });
  return rows.map((c) => {
    // Along the language fallback chain first, then any language the owner wrote it in.
    const any = (rows: { eligibility: string | null; payoutConditions: string | null; terms: string | null }[], field: "eligibility" | "payoutConditions" | "terms") =>
      rows.map((r) => r[field]).find((v) => v?.trim()) ?? null;
    const text = (field: "eligibility" | "payoutConditions" | "terms") =>
      pickField(c.translations, locale, field) ?? pickField(c.offer.translations, locale, field) ?? any(c.translations, field) ?? any(c.offer.translations, field) ?? "";
    return {
      id: c.id,
      status: c.status === "PUBLISHED" && c.offer.status === "PUBLISHED" ? ("PUBLISHED" as const) : ("DRAFT" as const),
      country: c.country,
      currency: c.currency,
      reward: Number(c.rewardMinor),
      categories: c.categories,
      minProjectValue: c.minProjectValueMinor === null ? null : Number(c.minProjectValueMinor),
      eligibility: text("eligibility"),
      payoutConditions: text("payoutConditions"),
      terms: text("terms"),
    };
  });
});

/** Skill groups with their visible skills, "How I use it" text and the projects that show it. */
export const getSkillGroups = cache(async (locale: Locale) => {
  const groups = await prisma.skillGroup.findMany({
    where: { visible: true },
    orderBy: { sortOrder: "asc" },
    include: {
      translations: true,
      skills: {
        where: { visible: true },
        orderBy: { sortOrder: "asc" },
        include: { translations: true, projects: { include: { project: { include: { translations: true } } } } },
      },
    },
  });
  const statuses = (await visible()).in;
  return groups
    .map((g) => ({
      key: g.key,
      name: pickField(g.translations, locale, "name") ?? g.key,
      skills: g.skills.map((s) => ({
        id: s.id,
        name: s.name,
        symbol: s.symbol,
        usage: pickField(s.translations, locale, "usage"),
        projects: s.projects
          .filter((sp) => statuses.includes(sp.project.status))
          .sort((a, b) => a.project.sortOrder - b.project.sortOrder)
          .map((sp) => ({ slug: sp.project.slug, title: pickField(sp.project.translations, locale, "title") ?? sp.project.slug })),
      })),
    }))
    .filter((g) => g.skills.length > 0);
});

export const getProcessSteps = cache(async (locale: Locale) => {
  const steps = await prisma.processStep.findMany({ where: { visible: true }, orderBy: { sortOrder: "asc" }, include: { translations: true, media: true } });
  return steps
    .map((s) => ({
      id: s.id,
      icon: s.icon,
      image: s.media ? { src: s.media.url, width: s.media.width ?? 800, height: s.media.height ?? 600, alt: altFor(s.media.alt, locale) } : null,
      title: pickField(s.translations, locale, "title") ?? "",
      description: pickField(s.translations, locale, "description") ?? "",
    }))
    .filter((s) => s.title);
});

export type PublicAiService = Awaited<ReturnType<typeof getAiServices>>[number];

export const getAiServices = cache(async (locale: Locale) => {
  const rows = await prisma.aiService.findMany({
    where: { status: { not: "HIDDEN" }, publishStatus: await visible() },
    orderBy: { sortOrder: "asc" },
    include: { translations: true, media: true },
  });
  return rows.map((s) => ({
    id: s.id,
    key: s.key,
    status: s.status as "AVAILABLE" | "COMING_SOON",
    draft: s.publishStatus === "DRAFT",
    cta: s.cta,
    waitlistEnabled: s.status === "COMING_SOON" && s.waitlistEnabled,
    financial: s.financial,
    icon: s.icon,
    image: s.media ? { src: s.media.url, width: s.media.width ?? 800, height: s.media.height ?? 600, alt: altFor(s.media.alt, locale) } : null,
    title: pickField(s.translations, locale, "title") ?? s.key,
    description: pickField(s.translations, locale, "description") ?? "",
    ctaLabel: pickField(s.translations, locale, "ctaLabel"),
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
