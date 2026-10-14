"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Database, LayoutTemplate, MonitorSmartphone, Server, type LucideIcon } from "lucide-react";
import { useReduceMotion } from "@/components/ui/motion";

export type CloudStop = { key: "flow" | "frontend" | "backend" | "database"; station: string; title: string; text: string };

const ICONS: Record<CloudStop["key"], LucideIcon> = {
  flow: MonitorSmartphone,
  frontend: LayoutTemplate,
  backend: Server,
  database: Database,
};

const TRAVEL_MS = 900;
// Longer texts stay open longer, so they can be read before the packet moves on.
const dwell = (text: string) => Math.min(10000, Math.max(4000, text.length * 45));

/**
 * The plain-language architecture as a journey: a glowing packet leaves the visitor and stops at
 * the website, the server and the database. At each stop a thought cloud opens with that part's
 * explanation. Stops are buttons, so anyone can jump to one; hovering or focusing the cloud holds
 * it open. With reduced motion nothing moves on its own. Screen readers get the full text as a list.
 */
export function ArchitectureClouds({ stops, label, rtl = false }: { stops: CloudStop[]; label: string; rtl?: boolean }) {
  const reduce = useReduceMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const auto = !reduce && inView && !held && stops.length > 1;

  useEffect(() => {
    if (!auto) return;
    const timer = setTimeout(() => setActive((i) => (i + 1) % stops.length), TRAVEL_MS + dwell(stops[active].text));
    return () => clearTimeout(timer);
  }, [auto, active, stops]);

  if (stops.length === 0) return null;
  const n = stops.length;
  const center = (i: number) => ((i + 0.5) / n) * 100;
  const x = (i: number) => (rtl ? 100 - center(i) : center(i));
  const start = center(0);
  const span = center(n - 1) - start;

  return (
    <div ref={ref} className="flex flex-col gap-2">
      <p className="text-sm uppercase tracking-widest text-mist/60">{label}</p>

      {/* The route: stations on a line, the packet travelling between them. */}
      <div className="relative mt-4" aria-hidden={false}>
        <div aria-hidden className="absolute top-7 h-px bg-line sm:top-8" style={{ insetInlineStart: `${start}%`, width: `${span}%` }} />
        <motion.div
          aria-hidden
          className="absolute top-7 h-px bg-gradient-to-r from-ice/30 to-ice sm:top-8 rtl:bg-gradient-to-l"
          style={{ insetInlineStart: `${start}%` }}
          initial={false}
          animate={{ width: `${n > 1 ? (span * active) / (n - 1) : 0}%` }}
          transition={{ duration: reduce ? 0 : TRAVEL_MS / 1000, ease: [0.65, 0, 0.35, 1] }}
        />
        <motion.span
          aria-hidden
          className="absolute top-7 z-10 -ms-2 -mt-2 size-4 rounded-full bg-ice shadow-[0_0_0_6px_rgb(187_204_215/0.15),0_0_24px_rgb(187_204_215/0.9)] sm:top-8"
          style={{ left: 0 }}
          initial={false}
          animate={{ left: `${x(active)}%` }}
          transition={{ duration: reduce ? 0 : TRAVEL_MS / 1000, ease: [0.65, 0, 0.35, 1] }}
        />

        <ol className="relative grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
          {stops.map((s, i) => {
            const Icon = ICONS[s.key];
            const on = i === active;
            const passed = i <= active;
            return (
              <li key={s.key} className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={on}
                  className="group flex flex-col items-center gap-3 rounded-2xl px-1 pb-1 outline-none focus-visible:ring-2 focus-visible:ring-ice"
                >
                  <span
                    className={`relative z-20 flex size-14 items-center justify-center rounded-full border transition-[background-color,border-color,color,transform] duration-500 sm:size-16 ${
                      on ? "scale-110 border-ice bg-ice text-ink" : passed ? "border-ice/60 bg-ink-2 text-ice" : "border-line bg-ink-2 text-mist/55 group-hover:border-mist/40"
                    }`}
                  >
                    <Icon className="size-5 sm:size-6" strokeWidth={1.75} />
                  </span>
                  <span className={`text-center text-[11px] uppercase leading-tight tracking-widest transition-colors sm:text-xs ${on ? "text-mist" : "text-mist/55"}`}>
                    <span className="block tabular-nums text-mist/40">{String(i + 1).padStart(2, "0")}</span>
                    {s.station}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Every cloud sits in the same grid cell, so the block keeps the height of the longest one. */}
      <div
        aria-hidden
        className="mt-4 grid"
        onPointerEnter={() => setHeld(true)}
        onPointerLeave={() => setHeld(false)}
      >
        {stops.map((s, i) => (
          <Cloud key={s.key} stop={s} on={i === active} anchor={x(i)} reduce={reduce} timed={auto} />
        ))}
      </div>

      <dl className="sr-only">
        {stops.map((s) => (
          <div key={s.key}>
            <dt>{s.title}</dt>
            <dd>{s.text}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// Bumps along the top edge, spaced in pixels so the cloud keeps its shape at any width.
const puffs = (tail: number) =>
  [
    { o: 0, c: "-top-5 size-14" },
    { o: -42, c: "-top-3 size-10" },
    { o: 44, c: "-top-3.5 size-11" },
    { o: -76, c: "-top-1.5 size-7" },
    { o: 80, c: "-top-2 size-8" },
  ].map((p) => ({ ...p, x: `clamp(36px, calc(${tail}% + ${p.o}px), calc(100% - 36px))` }));

function Cloud({ stop, on, anchor, reduce, timed }: { stop: CloudStop; on: boolean; anchor: number; reduce: boolean; timed: boolean }) {
  // Keep the thought-bubble dots and puffs inside the card on narrow screens.
  const tail = anchor;
  return (
    <motion.div
      className="relative col-start-1 row-start-1 pt-10"
      initial={false}
      animate={on ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.92, y: 12 }}
      transition={reduce ? { duration: 0 } : on ? { delay: TRAVEL_MS / 1000 - 0.15, type: "spring", stiffness: 260, damping: 22 } : { duration: 0.2 }}
      style={{ visibility: on ? "visible" : "hidden", transformOrigin: `${tail}% 0%`, pointerEvents: on ? "auto" : "none" }}
    >
      {/* Thought-bubble trail rising to the station. */}
      <span className="absolute top-1 size-2.5 -translate-x-1/2 rounded-full border border-ice/40 bg-ink-2" style={{ left: `clamp(36px, ${tail}%, calc(100% - 36px))` }} />
      <span className="absolute top-4 size-4 -translate-x-1/2 rounded-full border border-ice/40 bg-ink-2" style={{ left: `clamp(36px, ${tail}%, calc(100% - 36px))` }} />

      <div className="relative">
        {/* Puffs: outlined copies behind the body draw the cloud edge; filled copies above it erase the body's top border. */}
        {puffs(tail).map((p, k) => (
          <span key={k} className={`absolute -translate-x-1/2 rounded-full border border-ice/40 bg-ink-2 ${p.c}`} style={{ left: p.x }} />
        ))}
        <div className="relative overflow-hidden rounded-[36px] border border-ice/40 bg-ink-2 px-6 pb-7 pt-6 shadow-[0_30px_80px_-40px_rgb(187_204_215/0.55)] sm:px-9 sm:pt-8">
          <h3 className="relative z-10 text-sm font-bold uppercase tracking-widest text-ice">{stop.title}</h3>
          <p className="relative z-10 mt-3 max-w-3xl whitespace-pre-line text-base leading-relaxed text-mist/85 sm:text-lg">{stop.text}</p>
        </div>
        {puffs(tail).map((p, k) => (
          <span key={k} aria-hidden className={`absolute -translate-x-1/2 rounded-full border border-transparent bg-ink-2 bg-clip-padding ${p.c}`} style={{ left: p.x }} />
        ))}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[36px]">
          {timed && on && (
            <motion.span
              aria-hidden
              className="absolute bottom-0 start-0 h-0.5 bg-ice/60"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ delay: TRAVEL_MS / 1000, duration: dwell(stop.text) / 1000, ease: "linear" }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
