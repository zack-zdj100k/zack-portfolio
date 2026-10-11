import { Link } from "@/i18n/navigation";

type Href = React.ComponentProps<typeof Link>["href"];

function hexToRgba(hex: string, alpha = 1) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/**
 * Glowing-edge button (owner's chosen design): dark gradient face, a soft glow sweeping in from the
 * right, and a lit bar on the right edge that slides away on hover. `selected` makes the glow ice
 * blue and the label bright; unselected options glow in muted steel.
 */
function glowStyle(color: string) {
  return {
    "--glow-color": hexToRgba(color),
    "--glow-color-via": hexToRgba(color, 0.075),
    "--glow-color-to": hexToRgba(color, 0.2),
  } as React.CSSProperties;
}

const base = [
  "relative z-0 inline-flex items-center justify-center overflow-hidden whitespace-nowrap rounded-md border border-e-0 border-line",
  "bg-gradient-to-t from-ink to-ink-3 font-medium uppercase tracking-widest transition-colors duration-200",
  // glow wash
  "after:absolute after:inset-0 after:-z-10 after:rounded-[inherit] after:bg-gradient-to-r after:from-transparent after:from-40% after:via-[var(--glow-color-via)] after:via-70% after:to-[var(--glow-color-to)] after:shadow-[inset_0_1px_0_rgb(215_226_234/0.12)]",
  // edge bar
  "before:absolute before:end-0 before:top-1/2 before:h-[60%] before:w-[5px] before:-translate-y-1/2 before:rounded-s before:bg-[var(--glow-color)] before:shadow-[-2px_0_10px_var(--glow-color)] before:transition-transform before:duration-200 hover:before:translate-x-full rtl:hover:before:-translate-x-full",
].join(" ");

const sizes = {
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-8 text-sm md:text-base",
};

export function GlowLink({
  href,
  children,
  selected = true,
  size = "md",
  className = "",
  scroll,
  ariaCurrent,
}: {
  href: Href;
  children: React.ReactNode;
  selected?: boolean;
  size?: keyof typeof sizes;
  className?: string;
  scroll?: boolean;
  ariaCurrent?: "page" | "true";
}) {
  return (
    <Link
      href={href}
      scroll={scroll}
      aria-current={ariaCurrent}
      style={glowStyle(selected ? "#bbccd7" : "#646973")}
      className={`${base} ${sizes[size]} ${selected ? "text-mist" : "text-mist/70 hover:text-mist"} ${className}`}
    >
      {children}
    </Link>
  );
}

export function GlowButton({
  children,
  selected = true,
  size = "md",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean; size?: keyof typeof sizes }) {
  return (
    <button
      type="button"
      {...props}
      style={glowStyle(selected ? "#bbccd7" : "#646973")}
      className={`${base} ${sizes[size]} ${selected ? "text-mist" : "text-mist/70 hover:text-mist"} ${className}`}
    >
      {children}
    </button>
  );
}
