"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { isActive, visibleNav, type NavKey } from "./nav-items";

export function NavLinks({ hidden = [] }: { hidden?: NavKey[] }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-1 xl:gap-2">
      {visibleNav(hidden).map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative block rounded-full px-3 py-2 text-[0.95rem] font-medium uppercase tracking-wider transition-colors duration-200 xl:px-4 ${
                active ? "text-mist" : "text-mist/70 hover:text-mist"
              }`}
            >
              {t(item.key)}
              <span
                aria-hidden
                className={`absolute inset-x-3 -bottom-0.5 h-px origin-left bg-ice transition-transform duration-300 xl:inset-x-4 ${
                  active ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
