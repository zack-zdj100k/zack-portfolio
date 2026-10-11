import type { Metadata } from "next";
import { locales, localeTags, type Locale } from "@/lib/i18n/locales";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** Canonical + hreflang alternates + Open Graph for one public page. `path` has no locale ("/about"). */
export function pageMetadata(opts: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  image?: string | null;
}): Metadata {
  const path = opts.path === "/" ? "" : opts.path;
  const languages: Record<string, string> = Object.fromEntries(
    locales.map((l) => [localeTags[l], `${siteUrl}/${l}${path}`]),
  );
  languages["x-default"] = `${siteUrl}/en${path}`;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: `${siteUrl}/${opts.locale}${path}`, languages },
    openGraph: {
      type: "website",
      url: `${siteUrl}/${opts.locale}${path}`,
      title: opts.title,
      description: opts.description,
      locale: localeTags[opts.locale].replace("-", "_"),
      images: opts.image ? [{ url: opts.image }] : [{ url: "/hero/face-1280.webp" }],
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description },
  };
}
