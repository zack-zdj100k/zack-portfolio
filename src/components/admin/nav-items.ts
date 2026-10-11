// Admin navigation. Shared with the public dashboard preview (src/lib/admin-showcase.ts), whose
// registry must name every entry here, so a new admin page can't be forgotten in the preview.

export const ADMIN_NAV = [
  { title: null, items: [{ href: "/admin", label: "Dashboard" }] },
  {
    title: "Inbox",
    items: [
      { href: "/admin/inquiries", label: "Inquiries", count: "inquiries" },
      { href: "/admin/referrals", label: "Referrals", count: "referrals" },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/profile", label: "Profile" },
      { href: "/admin/skills", label: "Skills" },
      { href: "/admin/process", label: "How I work" },
      { href: "/admin/hero", label: "Hero 3D" },
      { href: "/admin/projects", label: "Projects" },
      { href: "/admin/services", label: "Services & pricing" },
      { href: "/admin/ai-services", label: "AI services" },
      { href: "/admin/referral", label: "Referral offers" },
      { href: "/admin/testimonials", label: "Testimonials" },
      { href: "/admin/content", label: "Page text" },
      { href: "/admin/media", label: "Media" },
    ],
  },
  {
    title: "Site",
    items: [
      { href: "/admin/languages", label: "Languages" },
      { href: "/admin/settings", label: "Settings" },
    ],
  },
] as const;

export type AdminHref = (typeof ADMIN_NAV)[number]["items"][number]["href"];
