"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { stackIcon, stackSymbol } from "@/lib/stack";

type Family = "frontend" | "backend" | "databases" | "tools";

// One tint per family, all from the site palette (ice → steel → slate → outline).
const FAMILY_STYLE: Record<Family, { tile: string; text: string; swatch: string }> = {
  frontend: { tile: "bg-ice", text: "text-ink", swatch: "bg-ice" },
  backend: { tile: "bg-steel", text: "text-mist", swatch: "bg-steel" },
  databases: { tile: "bg-[#2E3A46]", text: "text-mist", swatch: "bg-[#2E3A46]" },
  tools: { tile: "bg-ink-3 ring-1 ring-inset ring-line", text: "text-mist", swatch: "bg-ink-3 ring-1 ring-line" },
};

type Element = { n: number; name: string; symbol: string; family: Family };

/**
 * "Periodic table of my stack": each skill is an element tile coloured by family. Picking a family
 * lights its tiles up and dims the rest; hovering, focusing or tapping a tile shows its logo.
 */
export function SkillsTable({
  groups,
  labels,
}: {
  groups: { family: Family; label: string; skills: string[] }[];
  labels: { title: string; intro: string; all: string };
}) {
  const elements = useMemo<Element[]>(() => {
    let n = 0;
    return groups.flatMap((g) => g.skills.map((name) => ({ n: ++n, name, symbol: stackSymbol(name), family: g.family })));
  }, [groups]);
  const [family, setFamily] = useState<Family | null>(null);
  const [active, setActive] = useState<Element | null>(elements[0] ?? null);
  if (elements.length === 0) return null;
  const shown = active ?? elements[0];
  const icon = stackIcon(shown.name);
  const familyLabel = (f: Family) => groups.find((g) => g.family === f)?.label ?? f;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
      <div>
        <h2 className="max-w-3xl text-[clamp(2.2rem,5.5vw,4.8rem)] font-black uppercase leading-[0.95] tracking-tight display-gradient">{labels.title}</h2>
        <p className="mt-5 max-w-xl text-mist/70">{labels.intro}</p>

        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label={labels.title}>
          {[null, ...groups.map((g) => g.family)].map((f) => (
            <button
              key={f ?? "all"}
              type="button"
              aria-pressed={family === f}
              onClick={() => setFamily(f)}
              className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition-colors ${
                family === f ? "border-mist bg-mist text-ink" : "border-line text-mist/80 hover:border-ice/60"
              }`}
            >
              {f && <span aria-hidden className={`size-2.5 rounded-sm ${FAMILY_STYLE[f].swatch}`} />}
              {f ? familyLabel(f) : labels.all}
            </button>
          ))}
        </div>

        <ul className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(78px,1fr))] gap-2 sm:grid-cols-[repeat(auto-fill,minmax(92px,1fr))]">
          {elements.map((el) => {
            const dim = family !== null && el.family !== family;
            const style = FAMILY_STYLE[el.family];
            return (
              <li key={el.n}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(el)}
                  onFocus={() => setActive(el)}
                  onClick={() => setActive(el)}
                  aria-label={`${el.name}, ${familyLabel(el.family)}`}
                  className={`group relative flex aspect-square w-full flex-col justify-between rounded-xl p-2.5 text-start transition-[opacity,transform] duration-300 hover:-translate-y-0.5 ${style.tile} ${style.text} ${
                    dim ? "opacity-20" : "opacity-100"
                  } ${shown.n === el.n ? "outline outline-2 outline-offset-2 outline-ice" : ""}`}
                >
                  <span className="text-[0.65rem] tabular-nums opacity-70">{String(el.n).padStart(2, "0")}</span>
                  <span className="text-[1.65rem] font-bold leading-none sm:text-3xl">{el.symbol}</span>
                  <span className="truncate text-[0.62rem] opacity-80">{el.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Side panel: the hovered element, large. */}
      <div aria-live="polite" className="hidden min-h-[260px] flex-col items-center justify-center gap-4 rounded-[28px] border border-line bg-ink-2 p-8 text-center lg:flex">
        <AnimatePresence mode="wait">
          <motion.div
            key={shown.n}
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-4"
          >
            {icon ? (
              <svg role="img" aria-label={shown.name} viewBox="0 0 24 24" className="size-24" fill={icon.color}>
                <path d={icon.path} />
              </svg>
            ) : (
              <span className={`flex size-24 items-center justify-center rounded-2xl text-4xl font-bold ${FAMILY_STYLE[shown.family].tile} ${FAMILY_STYLE[shown.family].text}`}>
                {shown.symbol}
              </span>
            )}
            <span className="text-xl font-bold text-mist">{shown.name}</span>
            <span className="text-sm uppercase tracking-widest text-mist/60">{familyLabel(shown.family)}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
