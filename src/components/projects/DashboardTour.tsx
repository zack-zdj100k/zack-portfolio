"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { Circle } from "lucide-react";
import { DASHBOARD_ICONS } from "./dashboard-icons";
import { DeviceFrame } from "@/components/ui/DeviceFrame";

export type TourScreen = {
  id: string;
  kind: "REAL" | "CONCEPT" | "DEMO" | "VISUAL_EXPLORATION";
  src: string;
  width: number;
  height: number;
  alt: string;
  title: string;
  hotspots: { id: string; x: number; y: number; icon: string; label: string; body: string }[];
};

/**
 * A project's admin dashboard, annotated: numbered markers sit on the real screenshot, and the list
 * beside it says what each icon does for the business. Hovering or focusing either side highlights
 * the pair. Several screens become tabs. The list is the accessible version; markers are a pointer aid.
 */
export function DashboardTour({
  screens,
  labels,
}: {
  screens: TourScreen[];
  labels: {
    screens: string;
    /** Address-bar text of the window frame (the project's name). */
    address: string;
    kinds: Record<"CONCEPT" | "DEMO" | "VISUAL_EXPLORATION", string>;
    notes: Record<"CONCEPT" | "DEMO" | "VISUAL_EXPLORATION", string>;
  };
}) {
  const [screenIndex, setScreenIndex] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const items = useRef<Record<string, HTMLLIElement | null>>({});
  const markers = useRef<Record<string, HTMLButtonElement | null>>({});
  const frame = useRef<HTMLDivElement>(null);
  const uid = useId();
  const screen = screens[screenIndex] ?? screens[0];
  if (!screen) return null;

  const select = (i: number) => {
    setScreenIndex(i);
    setActive(null);
  };
  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const next = (i + (rtl ? -dir : dir) + screens.length) % screens.length;
    select(next);
    document.getElementById(`${uid}-tab-${next}`)?.focus();
  };

  return (
    <div className="flex flex-col gap-6">
      {screens.length > 1 && (
        <div role="tablist" aria-label={labels.screens} className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {screens.map((s, i) => (
            <button
              key={s.id}
              id={`${uid}-tab-${i}`}
              type="button"
              role="tab"
              aria-selected={i === screenIndex}
              aria-controls={`${uid}-panel`}
              tabIndex={i === screenIndex ? 0 : -1}
              onClick={() => select(i)}
              onKeyDown={(e) => onTabKey(e, i)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm uppercase tracking-wider transition-colors ${
                i === screenIndex ? "border-mist bg-mist text-ink" : "border-line text-mist/70 hover:border-ice/60 hover:text-mist"
              }`}
            >
              {s.title || `${i + 1}`}
            </button>
          ))}
        </div>
      )}

      <div
        id={`${uid}-panel`}
        role={screens.length > 1 ? "tabpanel" : undefined}
        aria-labelledby={screens.length > 1 ? `${uid}-tab-${screenIndex}` : undefined}
        className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:gap-10"
      >
        <figure className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-24">
          {/* Phones: the screen keeps a readable size and pans sideways, so markers never pile up. */}
          <DeviceFrame address={labels.address} badge={screen.kind !== "REAL" ? labels.kinds[screen.kind] : null}>
          <div ref={frame} dir="ltr" className="overflow-x-auto bg-ink-3 md:overflow-hidden">
            <div className="relative min-w-[760px] md:min-w-0">
              <Image
                key={screen.src}
                src={screen.src}
                width={screen.width}
                height={screen.height}
                alt={screen.alt || screen.title}
                sizes="(min-width: 1400px) 900px, (min-width: 1024px) 64vw, (min-width: 768px) 100vw, 760px"
                className="block h-auto w-full"
              />
              {screen.hotspots.map((h, i) => {
                const on = active === h.id;
                return (
                  <button
                    key={h.id}
                    ref={(el) => {
                      markers.current[h.id] = el;
                    }}
                    type="button"
                    tabIndex={-1}
                    aria-hidden
                    onMouseEnter={() => setActive(h.id)}
                    onMouseLeave={() => setActive(null)}
                    onClick={() => {
                      setActive(h.id);
                      items.current[h.id]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
                    }}
                    style={{ left: `${h.x}%`, top: `${h.y}%` }}
                    className={`absolute flex size-[22px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[11px] font-bold tabular-nums shadow-[0_2px_10px_rgb(0_0_0/0.45)] transition-[transform,background-color,opacity] duration-200 lg:size-6 ${
                      on ? "z-10 scale-125 bg-ice text-ink ring-4 ring-ice/35" : `bg-ink text-mist ring-2 ring-mist/80 ${active ? "opacity-45" : ""}`
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
          </DeviceFrame>
          {screen.kind !== "REAL" && (
            <figcaption className="px-1 text-sm text-mist/60">{labels.notes[screen.kind]}</figcaption>
          )}
        </figure>

        <ol className="flex flex-col gap-2">
          {screen.hotspots.map((h, i) => {
            const Icon = DASHBOARD_ICONS[h.icon] ?? Circle;
            const on = active === h.id;
            return (
              <li
                key={h.id}
                ref={(el) => {
                  items.current[h.id] = el;
                }}
                tabIndex={0}
                onMouseEnter={() => setActive(h.id)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(h.id)}
                onClick={() => {
                  // Bring the matching marker into the panned screenshot on phones (horizontal only).
                  const m = markers.current[h.id];
                  const f = frame.current;
                  if (m && f && f.scrollWidth > f.clientWidth) f.scrollTo({ left: m.offsetLeft - f.clientWidth / 2, behavior: "smooth" });
                }}
                onBlur={() => setActive(null)}
                className={`grid scroll-mt-28 grid-cols-[auto_1fr] gap-x-3.5 gap-y-1 rounded-[20px] border p-4 outline-offset-2 transition-colors ${
                  on ? "border-ice/50 bg-ice/10" : "border-line bg-ink-2/60"
                }`}
              >
                <span
                  aria-hidden
                  className={`row-span-2 flex size-10 items-center justify-center rounded-full transition-colors ${on ? "bg-ice text-ink" : "bg-ink-3 text-ice"}`}
                >
                  <Icon className="size-[18px]" strokeWidth={1.75} />
                </span>
                <span className="flex items-baseline gap-2 font-bold text-mist">
                  <span className="text-xs tabular-nums text-mist/50">{String(i + 1).padStart(2, "0")}</span>
                  {h.label}
                </span>
                <span className="text-sm leading-relaxed text-mist/70">{h.body}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
