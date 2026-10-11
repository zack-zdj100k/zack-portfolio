import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

type Href = React.ComponentProps<typeof Link>["href"];

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium uppercase tracking-widest transition-[background-color,color,transform] duration-200 active:scale-[0.98]";

/** Solid pale-blue pill: the single primary action of a section. */
export function PrimaryLink({ href, children, className = "" }: { href: Href; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={`${base} bg-mist px-7 py-3.5 text-sm text-ink hover:bg-white md:px-9 md:py-4 md:text-base ${className}`}>
      {children}
    </Link>
  );
}

/** Outline pill for secondary actions on dark surfaces. */
export function GhostLink({ href, children, className = "", tone = "dark" }: { href: Href; children: React.ReactNode; className?: string; tone?: "dark" | "paper" }) {
  const colors = tone === "paper" ? "border-ink text-ink hover:bg-ink/5" : "border-mist/80 text-mist hover:bg-mist/10";
  return (
    <Link href={href} className={`${base} border-2 px-7 py-3 text-sm md:px-9 md:py-3.5 md:text-base ${colors} ${className}`}>
      {children}
    </Link>
  );
}

/** External link (live site, repository): opens in a new tab and says so to screen readers. */
export function ExternalLink({ href, children, newTabLabel }: { href: string; children: React.ReactNode; newTabLabel: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} border-2 border-mist/80 px-6 py-2.5 text-sm text-mist hover:bg-mist/10`}
    >
      {children}
      <ArrowUpRight aria-hidden className="size-4 rtl:-scale-x-100" strokeWidth={2} />
      <span className="sr-only">({newTabLabel})</span>
    </a>
  );
}
