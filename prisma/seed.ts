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
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type ImageKind, type Prisma } from "../src/server/generated/prisma/client";
import { locales } from "../src/lib/i18n/locales";
import { translations } from "./seed-i18n";
import manifest from "../public/hero/manifest.json";
import { DASHBOARD_TOURS } from "./data/dashboard-tours";
import { defaultAddOns } from "./data/package-add-ons";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

const EN = {
  profile: {
    title: "Software engineer building websites, apps and desktop software for businesses.",
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
      skills: {
        // Taken from the stacks of the owner's own projects; edit in Admin → Profile.
        frontend: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
        backend: ["Node.js", "NestJS", "REST APIs"],
        databases: ["PostgreSQL", "Prisma", "Drizzle ORM"],
        tools: ["Git", "Playwright", "Vitest", "Cloudinary"],
      },
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

  // Referral offers: DRAFT until the owner approves the terms.
  if ((await prisma.countryOffer.count()) === 0) {
    for (const [i, o] of EN.offers.entries()) {
      const offer = await prisma.countryOffer.create({
        data: { market: o.market, currency: o.currency, rewardMinor: BigInt(o.reward * 100), status: "DRAFT", sortOrder: i },
      });
      for (const locale of locales) {
        const t = locale === "en" ? o : translations[locale]?.offers[i];
        if (!t) continue;
        await prisma.countryOfferTranslation.create({
          data: { offerId: offer.id, locale, whenEarned: t.whenEarned, terms: t.terms, reviewed: locale === "en" },
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
  console.log("Seed complete.");
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
}

async function backfillTranslations() {
  const services = await prisma.service.findMany({ orderBy: { sortOrder: "asc" }, include: { examples: { orderBy: { sortOrder: "asc" } } } });
  const packages = await prisma.pricingPackage.findMany({ orderBy: { sortOrder: "asc" } });
  const offers = await prisma.countryOffer.findMany({ orderBy: { sortOrder: "asc" } });
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
      await prisma.countryOfferTranslation.upsert({
        where: { offerId_locale: { offerId: o.id, locale } },
        update: {},
        create: { offerId: o.id, locale, whenEarned: tr.whenEarned, terms: tr.terms, reviewed: false },
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
