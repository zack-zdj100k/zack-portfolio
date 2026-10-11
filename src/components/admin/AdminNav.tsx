"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "./nav-items";

type Item = { href: string; label: string; count?: "inquiries" | "referrals" };

const GROUPS: readonly { title: string | null; items: readonly Item[] }[] = ADMIN_NAV;

export function AdminNav({ counts }: { counts: { inquiries: number; referrals: number } }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:gap-5 lg:overflow-visible lg:pb-0">
      {GROUPS.map((group, gi) => (
        <div key={gi} className="flex shrink-0 gap-1 lg:flex-col">
          {group.title && <p className="hidden px-3 pb-1 text-xs uppercase tracking-widest text-mist/60 lg:block">{group.title}</p>}
          <ul className="flex gap-1 lg:flex-col">
            {group.items.map((item) => {
              const active = item.href === "/admin" ? pathname === "/admin" : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const count = item.count ? counts[item.count] : 0;
              return (
                <li key={item.href} className="shrink-0">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center justify-between gap-3 whitespace-nowrap rounded-xl px-3 py-2 text-sm ${
                      active ? "bg-mist text-ink" : "text-mist/75 hover:bg-ink-3 hover:text-mist"
                    }`}
                  >
                    {item.label}
                    {count > 0 && (
                      <span className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-ink text-mist" : "bg-ice/20 text-ice"}`}>
                        {count}
                        <span className="sr-only"> new</span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
