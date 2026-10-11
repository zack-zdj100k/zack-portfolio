import type { AdminHref } from "@/components/admin/nav-items";

/**
 * Public "Admin Dashboard Preview": which demo screen stands for each real admin page.
 * Typed against the admin navigation, so adding an admin page without deciding here (show it, or
 * `null` = deliberately not shown) fails the type check. Demo screens use made-up data only.
 */
export const SHOWCASE_FEATURES = ["projects", "uploads", "pricing", "referral", "inquiries", "translations", "profile", "process", "skills", "ai"] as const;
export type ShowcaseFeature = (typeof SHOWCASE_FEATURES)[number];

export const ADMIN_SHOWCASE: Record<AdminHref, ShowcaseFeature | null> = {
  "/admin": null, // overview of the other pages
  "/admin/inquiries": "inquiries",
  "/admin/referrals": "referral",
  "/admin/profile": "profile",
  "/admin/skills": "skills",
  "/admin/process": "process",
  "/admin/hero": null, // specific to this portfolio
  "/admin/projects": "projects",
  "/admin/services": "pricing",
  "/admin/ai-services": "ai",
  "/admin/referral": "referral",
  "/admin/testimonials": null,
  "/admin/content": "translations",
  "/admin/media": "uploads",
  "/admin/languages": "translations",
  "/admin/settings": null, // access code and contact details: never shown publicly
};

/** Features in display order that are backed by at least one real admin page. */
export const showcaseFeatures = (): ShowcaseFeature[] => SHOWCASE_FEATURES.filter((f) => Object.values(ADMIN_SHOWCASE).includes(f));
