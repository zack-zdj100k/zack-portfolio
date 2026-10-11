import type { MetadataRoute } from "next";
import { locales, localeTags } from "@/lib/i18n/locales";
import { siteUrl } from "@/lib/seo";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";

const STATIC_PATHS = ["", "/about", "/projects", "/services-pricing", "/referral", "/contact", "/privacy"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await prisma.project.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } });
  const paths = [
    ...STATIC_PATHS.map((p) => ({ path: p, lastModified: undefined as Date | undefined })),
    ...projects.map((p) => ({ path: `/projects/${p.slug}`, lastModified: p.updatedAt })),
  ];
  return paths.flatMap(({ path, lastModified }) =>
    locales.map((l) => ({
      url: `${siteUrl}/${l}${path}`,
      lastModified,
      alternates: { languages: Object.fromEntries(locales.map((x) => [localeTags[x], `${siteUrl}/${x}${path}`])) },
    })),
  );
}
