/**
 * Initial content. Safe to re-run: it only creates rows that don't exist yet and never
 * overwrites what the owner edited in the admin.
 *
 * Content rules (from the owner's brief):
 * - No invented facts: unknown profile fields stay empty and hidden.
 * - Prices and referral terms are DRAFT until the owner publishes them in the admin.
 * - Project screenshots are real captures of the owner's local builds (kind REAL); project
 *   stage is IN_PROGRESS because none is confirmed as launched.
 * - Translations other than English are machine drafts (reviewed = false).
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type ImageKind, type Prisma } from "../src/server/generated/prisma/client";
import { fallbackChain, locales, type Locale } from "../src/lib/i18n/locales";
import { translations } from "./seed-i18n";
import manifest from "../public/hero/manifest.json";
import { DASHBOARD_TOURS, FEATURE_SHOTS } from "./data/dashboard-tours";
import { defaultAddOns } from "./data/package-add-ons";
import { AI_SERVICES, ARCHITECTURE, EARLIER_SKILL_GROUPS, PROCESS_STEPS, REFERRAL_TEXT, SKILL_GROUPS } from "./data/round6";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

const EN = {
  profile: {
    title: "Software engineer building websites, apps and desktop software for businesses, startups and new projects.",
    intro:
      "I plan and build software around the way your business works: websites that bring customers in, apps they use every day, and desktop tools your team relies on. Each project starts from your needs and its scope.",
    bio: "I'm Zack, a software engineer. I design and build websites, online shops, web platforms, apps and desktop software for businesses. I take a project from the first conversation to launch, explain the choices along the way, and keep the scope and price clear in writing.",
  },
  services: [
    {
      category: "WEBSITE",
      name: "Websites & platforms",
      description:
        "From a one-page site to a full platform: landing pages, business sites, online shops, restaurant and booking sites, marketplaces and appointment systems.",
      examples: [
        "Landing pages",
        "Business websites",
        "Online shops",
        "Restaurant websites",
        "Booking platforms",
        "Car marketplaces",
        "Medical & appointment platforms",
        "AI platforms",
      ],
    },
    {
      category: "APP",
      name: "Apps",
      description:
        "Applications for customers and staff: ordering, loyalty, internal tools and dashboards for shops, companies and restaurants.",
      examples: ["Shops", "Companies", "Restaurants", "Other businesses"],
    },
    {
      category: "SOFTWARE",
      name: "Desktop software",
      description:
        "Software installed on your computers for daily operations: sales, stock, orders, invoices and staff, working even when the internet is slow.",
      examples: ["Shops", "Companies", "Restaurants", "Cafés", "Other businesses"],
    },
  ],
  // Draft values from the owner's brief. Which price belongs to which package is a proposal.
  packages: [
    {
      category: "WEBSITE",
      name: "Landing page",
      description: "One focused page to present your business or one offer.",
      features: ["Responsive design", "Contact form", "Basic SEO setup", "6 months domain + hosting"],
      min: 40_000,
      max: null,
      step: null,
      weeks: [1, 2],
    },
    {
      category: "WEBSITE",
      name: "Business website",
      description: "A multi-page site you can update yourself.",
      features: ["Up to ~6 pages", "Admin to edit content", "Contact & WhatsApp", "6 months domain + hosting"],
      min: 50_000,
      max: 70_000,
      step: 5_000,
      weeks: [2, 4],
    },
    {
      category: "WEBSITE",
      name: "Online shop or booking",
      description: "Sell products or take bookings online, with an admin to manage them.",
      features: ["Catalogue or booking calendar", "Orders management", "Customer notifications", "6 months domain + hosting"],
      min: 75_000,
      max: 100_000,
      step: 5_000,
      weeks: [4, 6],
    },
    {
      category: null,
      name: "Custom platform or app",
      description: "Marketplaces, multi-user platforms, apps and desktop software.",
      features: ["Custom features", "User accounts & roles", "Admin dashboard", "6 months domain + hosting"],
      min: 110_000,
      max: 150_000,
      step: 10_000,
      weeks: [6, 10],
    },
  ],
  offers: [
    {
      market: "DZ",
      currency: "DZD",
      reward: 10_000,
      whenEarned:
        "When the business you referred signs the project agreement and pays its first instalment.",
      terms:
        "One reward per referred business. The business must be a new client and must agree to be contacted. Self-referrals don't qualify. The reward is paid after the first instalment is received.",
    },
    {
      market: "*",
      currency: "EUR",
      reward: 100,
      whenEarned:
        "When the business you referred signs the project agreement and pays its first instalment.",
      terms:
        "One reward per referred business. The business must be a new client and must agree to be contacted. Self-referrals don't qualify. The reward is paid after the first instalment is received.",
    },
  ],
};

const PROJECTS = [
  {
    slug: "king-253",
    title: "KING 253",
    origin: "CLIENT", // a client quote exists in the project's docs
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Drizzle ORM", "PostgreSQL"],
    summary: "An online streetwear clothing store: collections, product pages, cart, checkout and order tracking.",
    features: ["Collections and product pages", "Wishlist and customer accounts", "Checkout and order tracking", "Admin dashboard"],
    images: [
      ["0-d", "KING 253 home page"],
      ["1-d", "KING 253 collection page"],
      ["2-d", "KING 253 brand story page"],
      ["0-m", "KING 253 home page on a phone"],
    ],
  },
  {
    slug: "boulboul-art-wall",
    title: "Boulboul Art Wall",
    origin: "CLIENT", // a client quote exists in the project's docs
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL"],
    summary: "An online shop for wall art and decoration: artworks and LED mirrors priced by size, plus custom design requests.",
    features: ["Catalogue with size-based pricing", "Custom design requests with image upload", "Customer accounts and reviews", "Admin back-office"],
    images: [
      ["0-d", "Boulboul Art Wall home page"],
      ["1-d", "Boulboul Art Wall catalogue page"],
      ["2-d", "Boulboul Art Wall custom design form"],
      ["0-m", "Boulboul Art Wall home page on a phone"],
    ],
  },
  {
    slug: "zodic-car",
    title: "ZODIC CAR",
    origin: null,
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "NestJS", "Prisma", "PostgreSQL"],
    summary:
      "A car-selling platform inspired by local classified marketplaces, built to grow: detailed vehicle listings, search and filters, accounts and an admin panel.",
    features: ["Vehicle catalogue with search and filters", "Detailed specifications per car", "Customer dashboard and favourites", "Admin panel and REST API"],
    images: [
      ["0-d", "ZODIC CAR home page"],
      ["1-d", "ZODIC CAR vehicle catalogue"],
      ["2-d", "ZODIC CAR about page"],
      ["0-m", "ZODIC CAR home page on a phone"],
    ],
  },
] as const;

async function staticMedia(url: string, width: number | null, height: number | null, alt: Record<string, string> | null, label: string) {
  // Files shipped in /public are registered as LOCAL media with a "public:" key, so the admin can
  // reuse or replace them, but never deletes the file itself.
  const storageKey = `public:${url}`;
  return prisma.mediaAsset.upsert({
    where: { storageKey },
    update: {},
    create: {
      driver: "LOCAL",
      storageKey,
      url,
      kind: url.endsWith(".glb") ? "MODEL" : "IMAGE",
      mimeType: url.endsWith(".glb") ? "model/gltf-binary" : url.endsWith(".png") ? "image/png" : "image/webp",
      width,
      height,
      bytes: 0,
      alt: alt ?? undefined,
      label,
    },
  });
}

async function main() {
  // Locales: English is the reviewed reference; the others start as drafts.
  for (const [i, code] of locales.entries()) {
    await prisma.localeSetting.upsert({
      where: { code },
      update: {},
      create: { code, enabled: true, reviewed: code === "en", sortOrder: i },
    });
  }

  // Hero artwork. A: cutout + depth map. B: 360° turn (60 frames from the owner's video). C: GLB generated from the cutout
  // (TRELLIS, cleaned with scripts/clean-glb-texture.py). All three ship with the site; B is active (owner: 360° turn from his own video).
  const heroImage = await staticMedia("/hero/face-1280.webp", manifest.face.width, manifest.face.height, null, "Hero 3D artwork");
  const heroDepth = await staticMedia("/hero/depth.png", 512, 512, null, "Hero depth map");
  const heroModel = await staticMedia("/hero/model.glb", null, null, null, "Hero 3D model");
  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, heroMode: "SEQUENCE", heroImageId: heroImage.id, heroDepthId: heroDepth.id, heroModelId: heroModel.id },
  });
  if ((await prisma.heroFrame.count()) === 0) {
    for (const [i, f] of manifest.turn.frames.entries()) {
      const media = await staticMedia(`/hero/turn/${f}`, manifest.turn.width, manifest.turn.height, null, `360° frame ${i + 1}`);
      await prisma.heroFrame.create({ data: { settingsId: settings.id, mediaId: media.id, sortOrder: i } });
    }
  }

  // Profile
  // The owner's photo (sent for the contact page and ID badge); only set when the profile is created.
  const portrait = await staticMedia(
    "/profile/portrait.webp",
    941,
    1176,
    { en: "Portrait of ZACK in a black suit", fr: "Portrait de ZACK en costume noir", ar: "صورة ZACK ببدلة سوداء" },
    "Profile photo (owner)",
  );
  await prisma.profile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      publicName: "ZACK",
      portraitId: portrait.id,
      languages: [],
    },
  });
  for (const locale of locales) {
    const t = locale === "en" ? EN.profile : translations[locale]?.profile;
    if (!t) continue;
    await prisma.profileTranslation.upsert({
      where: { profileId_locale: { profileId: 1, locale } },
      update: {},
      create: { profileId: 1, locale, title: t.title, intro: t.intro, bio: t.bio, whyMe: [], reviewed: locale === "en" },
    });
  }

  // Services
  if ((await prisma.service.count()) === 0) {
    for (const [i, s] of EN.services.entries()) {
      const service = await prisma.service.create({
        data: { category: s.category as "WEBSITE", status: "PUBLISHED", sortOrder: i },
      });
      for (const locale of locales) {
        const t = locale === "en" ? s : translations[locale]?.services[i];
        if (!t) continue;
        await prisma.serviceTranslation.create({
          data: { serviceId: service.id, locale, name: t.name, description: t.description, reviewed: locale === "en" },
        });
      }
      for (const [j] of s.examples.entries()) {
        const ex = await prisma.serviceExample.create({ data: { serviceId: service.id, sortOrder: j } });
        for (const locale of locales) {
          const label = locale === "en" ? s.examples[j] : translations[locale]?.services[i].examples[j];
          if (!label) continue;
          await prisma.serviceExampleTranslation.create({ data: { exampleId: ex.id, locale, label, reviewed: locale === "en" } });
        }
      }
    }
  }

  // Pricing packages: DRAFT until the owner confirms them.
  if ((await prisma.pricingPackage.count()) === 0) {
    for (const [i, p] of EN.packages.entries()) {
      const pkg = await prisma.pricingPackage.create({
        data: {
          category: p.category as "WEBSITE" | null,
          status: "DRAFT",
          sortOrder: i,
          highlighted: i === 2,
          deliveryWeeksMin: p.weeks[0],
          deliveryWeeksMax: p.weeks[1],
          // DZD minor unit = 1/100 dinar.
          prices: {
            create: {
              market: "DZ",
              currency: "DZD",
              minMinor: BigInt(p.min * 100),
              maxMinor: p.max === null ? null : BigInt(p.max * 100),
              stepMinor: p.step === null ? null : BigInt(p.step * 100),
            },
          },
        },
      });
      for (const locale of locales) {
        const t = locale === "en" ? p : translations[locale]?.packages[i];
        if (!t) continue;
        await prisma.pricingPackageTranslation.create({
          data: { packageId: pkg.id, locale, name: t.name, description: t.description, features: [...t.features], reviewed: locale === "en" },
        });
      }
    }
  }

  // Referral offers: DRAFT until the owner approves the terms. Only explicitly listed countries are
  // eligible; the second programme starts with no countries until the owner picks them.
  if ((await prisma.referralOffer.count()) === 0) {
    for (const [i, o] of EN.offers.entries()) {
      const offer = await prisma.referralOffer.create({
        data: {
          name: o.market === "*" ? "Other countries (choose the eligible countries)" : `Offer ${o.market}`,
          status: "DRAFT",
          sortOrder: i,
          countries:
            o.market === "*"
              ? undefined
              : { create: { country: o.market, currency: o.currency, rewardMinor: BigInt(o.reward * 100), status: "DRAFT" } },
        },
      });
      for (const locale of locales) {
        const t = locale === "en" ? o : translations[locale]?.offers[i];
        if (!t) continue;
        const split = REFERRAL_TEXT[locale];
        await prisma.referralOfferTranslation.create({
          data: {
            offerId: offer.id,
            locale,
            eligibility: split?.eligibility ?? "",
            payoutConditions: split?.payoutConditions ?? t.whenEarned,
            terms: split?.terms ?? t.terms,
            reviewed: locale === "en",
          },
        });
      }
    }
  }

  // Projects
  for (const [i, p] of PROJECTS.entries()) {
    if (await prisma.project.findUnique({ where: { slug: p.slug } })) continue;
    const project = await prisma.project.create({
      data: {
        slug: p.slug,
        category: "WEBSITE",
        origin: p.origin,
        stage: "IN_PROGRESS",
        status: "PUBLISHED",
        featured: true,
        sortOrder: i,
        technologies: [...p.technologies],
      },
    });
    for (const locale of locales) {
      const t = locale === "en" ? p : translations[locale]?.projects[i];
      if (!t) continue;
      await prisma.projectTranslation.create({
        data: {
          projectId: project.id,
          locale,
          title: p.title,
          summary: t.summary,
          features: [...t.features],
          reviewed: locale === "en",
        },
      });
    }
    for (const [j, [file, alt]] of p.images.entries()) {
      const mobile = file.endsWith("-m");
      const altMap: Record<string, string> = { en: alt };
      for (const locale of locales) {
        const tr = translations[locale]?.projects[i]?.alts?.[j];
        if (tr) altMap[locale] = tr;
      }
      const media = await staticMedia(`/projects/${p.slug}/${file}.webp`, mobile ? 780 : 1600, mobile ? 1688 : 1000, altMap, `${p.title} ${file}`);
      await prisma.projectImage.create({
        data: { projectId: project.id, mediaId: media.id, kind: "REAL" as ImageKind, sortOrder: j },
      });
    }
  }

  await backfillTranslations();
  await seedDashboardTours();
  await backfillAddOns();
  await seedSkills();
  await seedProcessSteps();
  await seedAiServices();
  await seedArchitecture();
  await upgradeProfileTitles();
  console.log("Seed complete.");
}

/**
 * Round 6 wording (not only large companies): replaces the profile title only where it is still the
 * old seeded default, so anything the owner wrote stays as it is.
 */
const OLD_PROFILE_TITLES: Partial<Record<Locale, string>> = {
  "fr": "Ingénieur logiciel : sites web, applications et logiciels de bureau pour les entreprises.",
  "ar": "مهندس برمجيات يطوّر مواقع وتطبيقات وبرامج مكتبية للشركات.",
  "it": "Ingegnere del software: siti web, app e software desktop per le aziende.",
  "tr": "İşletmeler için web siteleri, uygulamalar ve masaüstü yazılımlar geliştiren yazılım mühendisi.",
  "es": "Ingeniero de software: sitios web, apps y software de escritorio para empresas.",
  "pt-BR": "Engenheiro de software: sites, aplicativos e softwares desktop para empresas.",
  "ru": "Инженер-программист: сайты, приложения и программы для ПК для бизнеса.",
  "uk": "Інженер-програміст: сайти, застосунки та програми для ПК для бізнесу.",
  "nb": "Programvareutvikler som lager nettsider, apper og skrivebordsprogrammer for bedrifter.",
  "nl": "Software engineer die websites, apps en desktopsoftware bouwt voor bedrijven.",
  "en": "Software engineer building websites, apps and desktop software for businesses."
};

async function upgradeProfileTitles() {
  for (const [locale, oldTitle] of Object.entries(OLD_PROFILE_TITLES)) {
    const next = locale === "en" ? EN.profile.title : translations[locale as Locale]?.profile.title;
    if (!next || !oldTitle) continue;
    await prisma.profileTranslation.updateMany({ where: { profileId: 1, locale, title: oldTitle }, data: { title: next } });
  }
}

/** Skill groups from the owner's list. Groups that already exist (by key) are left as they are. */
async function seedSkills() {
  for (const [i, g] of SKILL_GROUPS.entries()) {
    if (await prisma.skillGroup.findUnique({ where: { key: g.key } })) continue;
    await prisma.skillGroup.create({
      data: {
        key: g.key,
        sortOrder: i,
        translations: {
          create: Object.entries(g.name).map(([locale, name]) => ({ locale, name: name!, reviewed: locale === "en" })),
        },
        skills: { create: g.skills.map((name, k) => ({ name, sortOrder: k })) },
      },
    });
  }
  // The earlier stack, after the new groups (names from the message files, every language).
  for (const [i, g] of EARLIER_SKILL_GROUPS.entries()) {
    const names = locales.flatMap((locale) => {
      const name = message(locale, `about.skills.${g.key}`);
      return name ? [{ locale, name, reviewed: locale === "en" }] : [];
    });
    const existing = await prisma.skillGroup.findUnique({ where: { key: g.key }, include: { translations: true } });
    if (!existing) {
      await prisma.skillGroup.create({
        data: {
          key: g.key,
          sortOrder: SKILL_GROUPS.length + i,
          translations: { create: names },
          skills: { create: g.skills.map((name, k) => ({ name, sortOrder: k })) },
        },
      });
      continue;
    }
    // Groups carried over by the migration only have an English name: add the other languages.
    const have = new Set(existing.translations.map((t) => t.locale));
    const missing = names.filter((n) => !have.has(n.locale));
    if (missing.length) await prisma.skillGroupTranslation.createMany({ data: missing.map((n) => ({ ...n, groupId: existing.id })) });
  }
}

type Messages = { [k: string]: string | Messages };
const messageCache = new Map<string, Messages>();
function messages(locale: Locale): Messages {
  if (!messageCache.has(locale)) {
    messageCache.set(locale, JSON.parse(readFileSync(new URL(`../src/messages/${locale}.json`, import.meta.url), "utf8")) as Messages);
  }
  return messageCache.get(locale)!;
}
/** A message along the fallback chain (es-CO → es → en), like the site does. */
function message(locale: Locale, path: string): string | null {
  for (const l of fallbackChain(locale)) {
    let node: string | Messages | undefined = messages(l);
    for (const part of path.split(".")) node = typeof node === "object" ? node[part] : undefined;
    if (typeof node === "string") return node;
  }
  return null;
}

/** How I Work, moved from the message files into the database (same texts, every language). */
async function seedProcessSteps() {
  if ((await prisma.processStep.count()) > 0) return;
  for (const [i, step] of PROCESS_STEPS.entries()) {
    const translations = locales.flatMap((locale) => {
      const title = message(locale, `about.howIWork.${step.key}Title`);
      const description = message(locale, `about.howIWork.${step.key}Body`);
      return title && description ? [{ locale, title, description, reviewed: locale === "en" }] : [];
    });
    await prisma.processStep.create({ data: { icon: step.icon, sortOrder: i, translations: { create: translations } } });
  }
}

async function seedAiServices() {
  for (const [i, s] of AI_SERVICES.entries()) {
    if (await prisma.aiService.findUnique({ where: { key: s.key } })) continue;
    await prisma.aiService.create({
      data: {
        key: s.key,
        status: s.status,
        publishStatus: s.publish,
        cta: s.cta,
        financial: s.financial,
        icon: s.icon,
        sortOrder: i,
        translations: {
          create: Object.keys(s.title).map((locale) => ({
            locale,
            title: s.title[locale as Locale]!,
            description: s.description[locale as Locale] ?? "",
            reviewed: locale === "en",
          })),
        },
      },
    });
  }
}

/** Draft architecture (PROPOSED) for projects that have no graph yet. */
async function seedArchitecture() {
  for (const [slug, arch] of Object.entries(ARCHITECTURE)) {
    const project = await prisma.project.findUnique({ where: { slug }, include: { _count: { select: { architectureNodes: true } } } });
    if (!project || project._count.architectureNodes > 0) continue;
    for (const [i, n] of arch.nodes.entries()) {
      await prisma.architectureNode.create({ data: { projectId: project.id, kind: n.kind, technology: n.technology ?? null, label: n.label, sortOrder: i } });
    }
    for (const [locale, t] of Object.entries(arch.text)) {
      await prisma.projectTranslation.updateMany({
        where: { projectId: project.id, locale, frontendText: null },
        data: { frontendText: t.frontend, backendText: t.backend, databaseText: t.database, flowText: t.flow },
      });
    }
    if (project.architectureStatus === "HIDDEN") await prisma.project.update({ where: { id: project.id }, data: { architectureStatus: "PROPOSED" } });
  }
}

/**
 * Adds missing seed translations to rows that already exist (e.g. a database seeded before a
 * language was added). Never overwrites a translation that is already there.
 */
/** Optional additions (prisma/data/package-add-ons.ts) for package translations that have none. */
async function backfillAddOns() {
  const rows = await prisma.pricingPackageTranslation.findMany({ where: { addOns: { isEmpty: true } }, include: { package: { select: { category: true } } } });
  for (const r of rows) {
    await prisma.pricingPackageTranslation.update({
      where: { packageId_locale: { packageId: r.packageId, locale: r.locale } },
      data: { addOns: defaultAddOns(r.package.category, r.locale) },
    });
  }
}

/** Dashboard tours (prisma/data/dashboard-tours.ts), added only to projects that have none yet. */
async function seedDashboardTours() {
  for (const [slug, screens] of Object.entries(DASHBOARD_TOURS)) {
    const project = await prisma.project.findUnique({ where: { slug } });
    if (!project) continue;
    if ((await prisma.projectImage.count({ where: { projectId: project.id, section: "DASHBOARD" } })) > 0) continue;
    for (const [i, screen] of screens.entries()) {
      const media = await staticMedia(screen.file, screen.width ?? 1920, screen.height ?? 1200, screen.alt, `${slug} dashboard: ${screen.title.en}`);
      await prisma.projectImage.create({
        data: {
          projectId: project.id,
          mediaId: media.id,
          kind: screen.kind,
          section: "DASHBOARD",
          title: screen.title,
          sortOrder: i,
          hotspots: {
            create: screen.hotspots.map((h, k) => ({ x: h.x, y: h.y, icon: h.icon, label: h.label, body: h.body, sortOrder: k })),
          },
        },
      });
    }
  }
  await seedFeatureShots();
}

/**
 * Gives each dashboard feature its own screenshot, matched by its English label. Only features
 * without a screenshot get one, so uploads made in the admin are kept (a screenshot removed in the
 * admin comes back on the next seed). Features the owner renamed are skipped.
 */
async function seedFeatureShots() {
  for (const [slug, shots] of Object.entries(FEATURE_SHOTS)) {
    const hotspots = await prisma.projectHotspot.findMany({
      where: { mediaId: null, image: { section: "DASHBOARD", project: { slug } } },
    });
    for (const h of hotspots) {
      const en = (h.label as Record<string, string> | null)?.en;
      const file = en ? shots.files[en] : undefined;
      if (!file) continue;
      const alt = h.label as Record<string, string>;
      const media = await staticMedia(`/projects/${slug}/features/${file}.webp`, shots.width, shots.height, alt, `${slug} feature: ${en}`);
      await prisma.projectHotspot.update({ where: { id: h.id }, data: { mediaId: media.id } });
    }
  }
}

async function backfillTranslations() {
  const services = await prisma.service.findMany({ orderBy: { sortOrder: "asc" }, include: { examples: { orderBy: { sortOrder: "asc" } } } });
  const packages = await prisma.pricingPackage.findMany({ orderBy: { sortOrder: "asc" } });
  const offers = await prisma.referralOffer.findMany({ orderBy: { sortOrder: "asc" } });
  for (const locale of locales) {
    const t = translations[locale];
    if (!t) continue;
    for (const [i, s] of services.slice(0, EN.services.length).entries()) {
      const tr = t.services[i];
      await prisma.serviceTranslation.upsert({
        where: { serviceId_locale: { serviceId: s.id, locale } },
        update: {},
        create: { serviceId: s.id, locale, name: tr.name, description: tr.description, reviewed: false },
      });
      for (const [j, ex] of s.examples.entries()) {
        if (!tr.examples[j]) continue;
        await prisma.serviceExampleTranslation.upsert({
          where: { exampleId_locale: { exampleId: ex.id, locale } },
          update: {},
          create: { exampleId: ex.id, locale, label: tr.examples[j], reviewed: false },
        });
      }
    }
    for (const [i, p] of packages.slice(0, EN.packages.length).entries()) {
      const tr = t.packages[i];
      await prisma.pricingPackageTranslation.upsert({
        where: { packageId_locale: { packageId: p.id, locale } },
        update: {},
        create: { packageId: p.id, locale, name: tr.name, description: tr.description, features: tr.features, reviewed: false },
      });
    }
    for (const [i, o] of offers.slice(0, EN.offers.length).entries()) {
      const tr = t.offers[i];
      await prisma.referralOfferTranslation.upsert({
        where: { offerId_locale: { offerId: o.id, locale } },
        update: {},
        create: { offerId: o.id, locale, eligibility: "", payoutConditions: tr.whenEarned, terms: tr.terms, reviewed: false },
      });
    }
    for (const [i, def] of PROJECTS.entries()) {
      const project = await prisma.project.findUnique({ where: { slug: def.slug }, include: { images: { orderBy: { sortOrder: "asc" }, include: { media: true } } } });
      if (!project) continue;
      const tr = t.projects[i];
      await prisma.projectTranslation.upsert({
        where: { projectId_locale: { projectId: project.id, locale } },
        update: {},
        create: { projectId: project.id, locale, title: def.title, summary: tr.summary, features: tr.features, reviewed: false },
      });
      for (const [j, img] of project.images.entries()) {
        const alt = { ...((img.media.alt as Record<string, string> | null) ?? {}) };
        if (alt[locale] || !tr.alts[j]) continue;
        alt[locale] = tr.alts[j];
        await prisma.mediaAsset.update({ where: { id: img.mediaId }, data: { alt } });
      }
    }
  }
}

main()
  .catch((e: Prisma.PrismaClientKnownRequestError | Error) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
