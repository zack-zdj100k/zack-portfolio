// Mac-style window / laptop around a screenshot. The chrome stays thin (a ~28-36 px bar) so the
// screenshot keeps nearly its full size; on phones the address bar and laptop base drop away.
// Plain component (no hooks): usable from server and client components.

type Props = {
  children: React.ReactNode;
  /** "browser": a window with a title bar. "laptop": the same window in a thin bezel on a base. */
  variant?: "browser" | "laptop";
  /** Text in the address bar (hidden on phones). Never a real third-party domain. */
  address?: string;
  /** Visible label for anything that isn't a real screenshot ("Concept", "Demo"...). */
  badge?: string | null;
  className?: string;
  /** Extra classes for the screen area (e.g. overflow handling). */
  screenClassName?: string;
};

export function DeviceFrame({ children, variant = "browser", address, badge, className = "", screenClassName = "" }: Props) {
  const frame = (
    <div className={`relative overflow-hidden rounded-[12px] border border-white/10 bg-[#16181b] shadow-[0_30px_60px_-30px_rgb(0_0_0/0.8)] md:rounded-[16px] ${variant === "laptop" ? "md:rounded-[10px]" : ""}`}>
      <div dir="ltr" className="flex h-7 items-center gap-3 border-b border-white/[0.06] bg-[#1d2024] px-3 md:h-9 md:px-4">
        <span aria-hidden className="flex shrink-0 gap-1.5">
          <span className="size-2 rounded-full bg-[#ff5f57] md:size-2.5" />
          <span className="size-2 rounded-full bg-[#febc2e] md:size-2.5" />
          <span className="size-2 rounded-full bg-[#28c840] md:size-2.5" />
        </span>
        {address && (
          <span className="mx-auto hidden h-5 min-w-0 max-w-[50%] items-center truncate rounded-md bg-white/[0.06] px-3 text-[11px] text-mist/55 sm:flex">{address}</span>
        )}
        {badge && (
          <span className="ms-auto shrink-0 rounded-full bg-ice px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink md:text-[11px]">{badge}</span>
        )}
      </div>
      <div className={`relative ${screenClassName}`}>{children}</div>
    </div>
  );

  if (variant === "browser") return <div className={className}>{frame}</div>;

  return (
    <div className={className}>
      {/* Bezel only from tablet up: on phones the window alone keeps the screenshot as wide as possible. */}
      <div className="md:rounded-t-[22px] md:border md:border-white/10 md:bg-[#0d0e10] md:p-[1.1%] md:pb-[1.4%]">{frame}</div>
      <div aria-hidden className="relative mx-[-3%] hidden h-3.5 rounded-b-[14px] bg-gradient-to-b from-[#3a3e44] to-[#1a1c1f] md:block lg:h-4">
        <span className="absolute left-1/2 top-0 h-1.5 w-[14%] -translate-x-1/2 rounded-b-md bg-[#121315]" />
      </div>
    </div>
  );
}
