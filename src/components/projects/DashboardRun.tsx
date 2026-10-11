"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Circle } from "lucide-react";
import { DeviceFrame } from "@/components/ui/DeviceFrame";
import { useMediaQuery } from "@/components/ui/motion";
import { layerClass } from "@/components/ui/layers";
import { DASHBOARD_ICONS } from "./dashboard-icons";
import type { TourScreen } from "./DashboardTour";

type Device = "phone" | "tablet" | "laptop";
type Labels = {
  address: string;
  kinds: Record<"CONCEPT" | "DEMO" | "VISUAL_EXPLORATION", string>;
  notes: Record<"CONCEPT" | "DEMO" | "VISUAL_EXPLORATION", string>;
};
type Item = TourScreen["hotspots"][number] & { si: number; hi: number };

// Zoom into the screen when a feature has no screenshot of its own (laptop / tablet / phone).
const FOCUS_ZOOM: Record<Device, number> = { laptop: 2, tablet: 2.2, phone: 3 };
// Zoom on a feature's own screenshot: whole page on laptop and tablet, its top on the phone.
// It is zoomed further when needed to fill the screen, so there is never an empty band under it.
const PAGE_ZOOM: Record<Device, number> = { laptop: 1, tablet: 1, phone: 1.9 };
// On the phone the page is read from just after its sidebar (in % of the screenshot's width).
const PAGE_LEFT: Record<Device, number> = { laptop: 0, tablet: 0, phone: 15 };
// Height / width of the device screens (the laptop takes the first screen's shape).
const SCREEN_RATIO: Record<Exclude<Device, "laptop">, number> = { tablet: 3 / 4, phone: 14 / 9 };

/**
 * A project's real admin dashboard, explained while scrolling (same idea as the home page's
 * "Run your site yourself"). Each feature shows its own page of the dashboard; a feature without a
 * screenshot of its own zooms into its area of the screen. No numbered markers.
 * Laptop (desktop): features on the left, a sticky laptop on the right. Tablet and phone: a sticky
 * tablet or phone at the top, the feature being read below it. Reduced motion gets <DashboardTour>.
 */
export function DashboardRun({ screens, labels }: { screens: TourScreen[]; labels: Labels }) {
  const desktop = useMediaQuery("(min-width: 1024px)");
  const tablet = useMediaQuery("(min-width: 768px)");
  const device: Device = desktop ? "laptop" : tablet ? "tablet" : "phone";

  const items: Item[] = screens.flatMap((s, si) => s.hotspots.map((h, hi) => ({ ...h, si, hi })));
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    // Desktop: the feature crossing the middle of the viewport is active. Tablet/phone: the device is
    // pinned at the top, so the active feature is the one crossing the line three quarters down.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
      },
      { rootMargin: device === "laptop" ? "-45% 0px -45% 0px" : "-74% 0px -25% 0px" },
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [items.length, device]);

  if (items.length === 0) return null;
  const current = items[Math.min(active, items.length - 1)];
  const screen = screens[current.si];
  const badge = screen.kind !== "REAL" ? labels.kinds[screen.kind] : null;

  // Only the layers that can be seen are mounted: the active one, the one under it, and the
  // neighbours (so the next screenshot is already loaded when it is needed).
  const mounted = new Set([shown, active - 1, active, active + 1]);
  const first = screens[0];
  const view = (
    <div
      dir="ltr"
      className={`relative w-full overflow-hidden bg-ink-3 [container-type:size] ${device === "laptop" ? "" : "h-full"}`}
      style={device === "laptop" ? { aspectRatio: `${first.width} / ${first.height}` } : undefined}
    >
      {items.map((h, i) =>
        mounted.has(i) ? (
          <div
            key={h.id}
            aria-hidden={i !== active}
            onTransitionEnd={(e) => {
              if (i === active && e.propertyName === "opacity") setShown(i);
            }}
            className={`absolute inset-0 ${layerClass(i, active, shown)}`}
          >
            <Shot item={h} screen={screens[h.si]} device={device} ratio={device === "laptop" ? first.height / first.width : SCREEN_RATIO[device]} />
          </div>
        ) : null,
      )}
    </div>
  );

  const tabs = (
    <div className="flex flex-wrap justify-center gap-1.5" aria-hidden>
      {screens.map((s, si) => (
        <span
          key={s.id}
          className={`rounded-full border px-2.5 py-0.5 text-[11px] uppercase tracking-wider transition-colors duration-300 md:px-3 md:py-1 md:text-xs ${
            si === current.si ? "border-mist bg-mist text-ink" : "border-line text-mist/55"
          }`}
        >
          {s.title || si + 1}
        </span>
      ))}
    </div>
  );

  const list = (
    <ol className={device === "laptop" ? "" : "relative z-0"}>
      {items.map((h, i) => {
        const Icon = DASHBOARD_ICONS[h.icon] ?? Circle;
        const on = i === active;
        return (
          <li
            key={h.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-index={i}
            className={`flex flex-col justify-center gap-3 ${device === "laptop" ? "min-h-[32vh]" : "min-h-[34vh] md:min-h-[30vh]"}`}
          >
            {h.hi === 0 && screens[h.si].title && (
              <span className="text-xs uppercase tracking-widest text-ice/80">
                {screens[h.si].title} · {h.si + 1}/{screens.length}
              </span>
            )}
            <div className={`flex gap-4 border-s-2 ps-4 transition-[border-color,opacity] duration-300 md:ps-5 ${on ? "border-ice" : "border-line opacity-55"}`}>
              <span
                aria-hidden
                className={`flex size-10 shrink-0 items-center justify-center rounded-full transition-colors duration-300 md:size-11 ${on ? "bg-ice text-ink" : "bg-ink-3 text-ice"}`}
              >
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold leading-tight text-mist md:text-2xl">{h.label}</h3>
                <p className="max-w-md leading-relaxed text-mist/75 md:text-lg">{h.body}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );

  if (device === "laptop") {
    return (
      <div className="grid grid-cols-[minmax(0,4fr)_minmax(0,8fr)] gap-12">
        {list}
        <div>
          <div className="sticky top-[calc(50vh-260px)]">
            <DeviceFrame variant="laptop" address={labels.address} badge={badge}>
              {view}
            </DeviceFrame>
            <div className="mt-6">{tabs}</div>
            {badge && <p className="mt-3 text-center text-sm text-mist/60">{labels.notes[screen.kind as keyof Labels["notes"]]}</p>}
          </div>
        </div>
      </div>
    );
  }

  // Tablet and phone: the device stays pinned under the site header while the features scroll.
  // Solid background (no backdrop blur: it is costly to repaint on every scroll frame).
  return (
    <div>
      <div className="sticky top-16 z-10 -mx-4 flex flex-col items-center gap-3 bg-ink px-4 pb-4 pt-3 sm:-mx-8 sm:px-8 md:top-20 md:-mx-10 md:px-10">
        {device === "phone" ? (
          <div className="relative w-[min(58vw,236px)] rounded-[2.4rem] bg-[#0b0c0e] p-[9px] shadow-[0_24px_50px_-20px_rgb(0_0_0/0.9)] ring-1 ring-white/15">
            <span aria-hidden className="absolute left-1/2 top-[15px] z-30 h-[18px] w-[34%] -translate-x-1/2 rounded-full bg-black" />
            <div className="relative aspect-[9/14] overflow-hidden rounded-[1.95rem]">{view}</div>
          </div>
        ) : (
          <div className="relative w-[min(86vw,560px)] rounded-[1.6rem] bg-[#0b0c0e] p-[14px] shadow-[0_24px_50px_-20px_rgb(0_0_0/0.9)] ring-1 ring-white/15">
            <span aria-hidden className="absolute left-1/2 top-[5px] z-30 size-1.5 -translate-x-1/2 rounded-full bg-[#2a2d32]" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[0.7rem]">{view}</div>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {badge && <span className="rounded-full bg-ice px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink">{badge}</span>}
          {tabs}
        </div>
      </div>
      {list}
      {badge && <p className="pb-4 text-center text-sm text-mist/60">{labels.notes[screen.kind as keyof Labels["notes"]]}</p>}
    </div>
  );
}

/**
 * What one feature shows: its own screenshot (filling the device from its top left; on the phone
 * from just after the sidebar), or, without one, the screen it belongs to, zoomed so the feature's
 * area sits in the middle (clamped to the edges) with a soft highlight. Sizes use container units of the device screen.
 */
function Shot({ item, screen, device, ratio }: { item: Item; screen: TourScreen; device: Device; ratio: number }) {
  const own = item.image;
  const img = own ?? { src: screen.src, width: screen.width, height: screen.height };
  const zoom = own ? Math.max(PAGE_ZOOM[device], ratio / (img.height / img.width)) : FOCUS_ZOOM[device];
  const focus = own ? { x: PAGE_LEFT[device] + 50 / zoom, y: 0 } : { x: item.x, y: item.y };
  const height = (zoom * 100 * img.height) / img.width; // in cqw
  return (
    <div
      className="absolute"
      style={{
        width: `${zoom * 100}cqw`,
        left: `clamp(${(1 - zoom) * 100}cqw, calc(50cqw - ${focus.x * zoom}cqw), 0cqw)`,
        top: own ? "0" : `clamp(calc(100cqh - ${height}cqw), calc(50cqh - ${(focus.y / 100) * height}cqw), 0cqh)`,
      }}
    >
      <Image
        src={img.src}
        width={img.width}
        height={img.height}
        alt={own ? item.label : screen.alt || screen.title}
        sizes={device === "laptop" ? "(min-width: 1400px) 860px, 62vw" : device === "tablet" ? "860px" : "720px"}
        className="block h-auto w-full"
      />
      {!own && (
        <span
          aria-hidden
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
          className="pointer-events-none absolute size-16 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_2px_rgb(187_204_215/0.85),0_0_0_9999px_rgb(12_12_12/0.35),0_0_40px_8px_rgb(187_204_215/0.35)]"
        />
      )}
    </div>
  );
}
