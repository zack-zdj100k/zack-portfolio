"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Circle } from "lucide-react";
import { DeviceFrame } from "@/components/ui/DeviceFrame";
import { DASHBOARD_ICONS } from "./dashboard-icons";
import type { TourScreen } from "./DashboardTour";

/**
 * A project's real admin dashboard, explained while scrolling (same idea as the home page's
 * dashboard preview): the list of features scrolls on the left, and a sticky laptop shows the
 * screen of the active feature with its marker lit. Wide screens with motion only; phones and
 * reduced motion get <DashboardTour> (tabs + list) instead, chosen with CSS by the page.
 */
export function DashboardRun({
  screens,
  labels,
}: {
  screens: TourScreen[];
  labels: { address: string; kinds: Record<"CONCEPT" | "DEMO" | "VISUAL_EXPLORATION", string>; notes: Record<"CONCEPT" | "DEMO" | "VISUAL_EXPLORATION", string> };
}) {
  const items = screens.flatMap((s, si) => s.hotspots.map((h, hi) => ({ ...h, si, hi })));
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    // The feature crossing the middle of the viewport is the active one.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [items.length]);

  if (items.length === 0) return null;
  const current = items[Math.min(active, items.length - 1)];
  const screen = screens[current.si];

  return (
    <div className="grid grid-cols-[minmax(0,4fr)_minmax(0,8fr)] gap-12">
      <ol>
        {items.map((h, i) => {
          const Icon = DASHBOARD_ICONS[h.icon] ?? Circle;
          const on = i === active;
          const firstOfScreen = h.hi === 0;
          return (
            <li
              key={h.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              data-index={i}
              className="flex min-h-[48vh] flex-col justify-center gap-3"
            >
              {firstOfScreen && screens[h.si].title && (
                <span className="text-xs uppercase tracking-widest text-ice/80">
                  {screens[h.si].title} · {h.si + 1}/{screens.length}
                </span>
              )}
              <div className={`flex gap-4 border-s-2 ps-5 transition-[border-color,opacity] duration-300 ${on ? "border-ice" : "border-line opacity-55"}`}>
                <span
                  aria-hidden
                  className={`flex size-11 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${on ? "bg-ice text-ink" : "bg-ink-3 text-ice"}`}
                >
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="flex items-baseline gap-2 text-2xl font-bold leading-tight text-mist">
                    <span className="text-sm tabular-nums text-mist/50">{String(h.hi + 1).padStart(2, "0")}</span>
                    {h.label}
                  </h3>
                  <p className="max-w-md text-lg leading-relaxed text-mist/75">{h.body}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div>
        <div className="sticky top-[calc(50vh-260px)]">
          <DeviceFrame variant="laptop" address={labels.address} badge={screen.kind !== "REAL" ? labels.kinds[screen.kind] : null}>
            <div dir="ltr" className="relative bg-ink-3">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div key={screen.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="relative">
                  <Image
                    src={screen.src}
                    width={screen.width}
                    height={screen.height}
                    alt={screen.alt || screen.title}
                    sizes="(min-width: 1400px) 860px, 62vw"
                    className="block h-auto w-full"
                  />
                  {screen.hotspots.map((h, i) => {
                    const on = h.id === current.id;
                    return (
                      <button
                        key={h.id}
                        type="button"
                        tabIndex={-1}
                        aria-hidden
                        onClick={() => refs.current[items.findIndex((x) => x.id === h.id)]?.scrollIntoView({ block: "center", behavior: "smooth" })}
                        style={{ left: `${h.x}%`, top: `${h.y}%` }}
                        className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-bold tabular-nums shadow-[0_2px_10px_rgb(0_0_0/0.45)] transition-all duration-300 ${
                          on ? "z-10 size-8 bg-ice text-sm text-ink ring-8 ring-ice/30" : "size-6 bg-ink text-[11px] text-mist opacity-60 ring-2 ring-mist/70"
                        }`}
                      >
                        {i + 1}
                        {on && <span className="absolute inset-0 animate-ping rounded-full bg-ice/40" />}
                      </button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          </DeviceFrame>
          <div className="mt-6 flex flex-wrap justify-center gap-2" aria-hidden>
            {screens.map((s, si) => (
              <span
                key={s.id}
                className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wider transition-colors duration-300 ${
                  si === current.si ? "border-mist bg-mist text-ink" : "border-line text-mist/55"
                }`}
              >
                {s.title || si + 1}
              </span>
            ))}
          </div>
          {screen.kind !== "REAL" && <p className="mt-3 text-center text-sm text-mist/60">{labels.notes[screen.kind]}</p>}
        </div>
      </div>
    </div>
  );
}
