"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Circle } from "lucide-react";
import { DeviceFrame } from "@/components/ui/DeviceFrame";
import { useMediaQuery } from "@/components/ui/motion";
import { DASHBOARD_ICONS } from "./dashboard-icons";
import type { TourScreen } from "./DashboardTour";
import { layerClass } from "@/components/ui/layers";

type Device = "phone" | "tablet" | "laptop";
type Labels = {
  address: string;
  kinds: Record<"CONCEPT" | "DEMO" | "VISUAL_EXPLORATION", string>;
  notes: Record<"CONCEPT" | "DEMO" | "VISUAL_EXPLORATION", string>;
};

// How far each device zooms into the screenshot. The view pans so the active marker sits in the
// middle (clamped to the screenshot's edges); the laptop shows the whole screen.
const ZOOM: Record<Device, number> = { phone: 3, tablet: 1.5, laptop: 1 };

/**
 * A project's real admin dashboard, explained while scrolling (same idea as the home page's
 * "Run your site yourself"). Laptop (desktop): features on the left, a sticky laptop on the right.
 * Tablet and phone: a sticky tablet or phone at the top, zoomed in and panning to the marker of the
 * feature being read below it. Reduced motion gets <DashboardTour> (tabs + list) instead.
 */
export function DashboardRun({ screens, labels }: { screens: TourScreen[]; labels: Labels }) {
  const desktop = useMediaQuery("(min-width: 1024px)");
  const tablet = useMediaQuery("(min-width: 768px)");
  const device: Device = desktop ? "laptop" : tablet ? "tablet" : "phone";

  const items = screens.flatMap((s, si) => s.hotspots.map((h, hi) => ({ ...h, si, hi })));
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
  const scrollTo = (id: string) => refs.current[items.findIndex((x) => x.id === id)]?.scrollIntoView({ block: "center", behavior: "smooth" });

  const view = <Screens screens={screens} current={current} zoom={ZOOM[device]} device={device} onMarker={scrollTo} shown={shown} onShown={setShown} />;
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
            className={`flex flex-col justify-center gap-3 ${device === "laptop" ? "min-h-[48vh]" : "min-h-[46vh] md:min-h-[40vh]"}`}
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
                <h3 className="flex items-baseline gap-2 text-xl font-bold leading-tight text-mist md:text-2xl">
                  <span className="text-sm tabular-nums text-mist/50">{String(h.hi + 1).padStart(2, "0")}</span>
                  {h.label}
                </h3>
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
  return (
    <div>
      <div className="sticky top-16 z-10 -mx-4 flex flex-col items-center gap-3 bg-ink/95 px-4 pb-4 pt-3 backdrop-blur-md sm:-mx-8 sm:px-8 md:top-20 md:-mx-10 md:px-10">
        {device === "phone" ? (
          <div className="relative w-[min(58vw,236px)] rounded-[2.4rem] bg-[#0b0c0e] p-[9px] shadow-[0_24px_50px_-20px_rgb(0_0_0/0.9)] ring-1 ring-white/15">
            <span aria-hidden className="absolute left-1/2 top-[15px] z-20 h-[18px] w-[34%] -translate-x-1/2 rounded-full bg-black" />
            <div className="relative aspect-[9/14] overflow-hidden rounded-[1.95rem]">{view}</div>
          </div>
        ) : (
          <div className="relative w-[min(86vw,560px)] rounded-[1.6rem] bg-[#0b0c0e] p-[14px] shadow-[0_24px_50px_-20px_rgb(0_0_0/0.9)] ring-1 ring-white/15">
            <span aria-hidden className="absolute left-1/2 top-[5px] z-20 size-1.5 -translate-x-1/2 rounded-full bg-[#2a2d32]" />
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
 * Every screen is rendered, stacked; the current one fades in over the last fully shown one (no
 * blank frame while switching). Each layer is zoomed and positioned so the active marker sits in the middle, clamped
 * so the view never runs past the screenshot's edges. Sizes use container units of the device screen.
 */
function Screens({
  screens,
  current,
  zoom,
  device,
  onMarker,
  shown,
  onShown,
}: {
  screens: TourScreen[];
  current: { id: string; si: number; x: number; y: number };
  zoom: number;
  device: Device;
  onMarker: (id: string) => void;
  /** The last screen that finished fading in; it stays opaque under the next one. */
  shown: number;
  onShown: (si: number) => void;
}) {
  const first = screens[0];
  return (
    <div
      dir="ltr"
      className={`relative w-full overflow-hidden bg-ink-3 [container-type:size] ${device === "laptop" ? "" : "h-full"}`}
      style={device === "laptop" ? { aspectRatio: `${first.width} / ${first.height}` } : undefined}
    >
      {screens.map((s, si) => {
        const on = si === current.si;
        const focus = on ? current : (s.hotspots[0] ?? { x: 50, y: 50 });
        const height = (zoom * 100 * s.height) / s.width; // in cqw
        return (
          <div
            key={s.id}
            aria-hidden={!on}
            onTransitionEnd={(e) => {
              if (on && e.propertyName === "opacity") onShown(si);
            }}
            className={`absolute inset-0 ${layerClass(si, current.si, shown)}`}
          >
            <div
              className="absolute transition-[left,top] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                width: `${zoom * 100}cqw`,
                left: `clamp(${(1 - zoom) * 100}cqw, calc(50cqw - ${focus.x * zoom}cqw), 0cqw)`,
                top: `clamp(calc(100cqh - ${height}cqw), calc(50cqh - ${(focus.y / 100) * height}cqw), 0cqh)`,
              }}
            >
              <Image
                src={s.src}
                width={s.width}
                height={s.height}
                alt={on ? s.alt || s.title : ""}
                sizes={device === "laptop" ? "(min-width: 1400px) 860px, 62vw" : device === "tablet" ? "860px" : "720px"}
                className="block h-auto w-full"
              />
              {s.hotspots.map((h, i) => {
                const lit = on && h.id === current.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    tabIndex={-1}
                    aria-hidden
                    onClick={() => onMarker(h.id)}
                    style={{ left: `${h.x}%`, top: `${h.y}%` }}
                    className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-bold tabular-nums shadow-[0_2px_10px_rgb(0_0_0/0.45)] transition-all duration-300 ${
                      lit ? "z-10 size-8 bg-ice text-sm text-ink ring-8 ring-ice/30" : "size-6 bg-ink text-[11px] text-mist opacity-60 ring-2 ring-mist/70"
                    }`}
                  >
                    {i + 1}
                    {lit && <span className="absolute inset-0 animate-ping rounded-full bg-ice/40" />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
