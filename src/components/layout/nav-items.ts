export const NAV_ITEMS = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/projects", key: "projects" },
  { href: "/services-pricing", key: "services" },
  { href: "/referral", key: "referral" },
  { href: "/contact", key: "contact" },
] as const;

export type NavKey = (typeof NAV_ITEMS)[number]["key"];

/** Nav items minus hidden ones (Referral is hidden while no offer is published). */
export function visibleNav(hidden: readonly NavKey[] = []) {
  return NAV_ITEMS.filter((i) => !hidden.includes(i.key));
}

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
