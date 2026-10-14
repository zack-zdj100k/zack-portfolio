"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { stackIcon, stackSymbol } from "@/lib/stack";
import { tint } from "./skill-tints";
import { playTile } from "@/lib/sfx";

/** family = index of the skill's first group (its colour); families = every group it is in. */
type Element = { n: number; name: string; symbol: string; family: number; families: number[] };

/**
 * "Periodic table of my stack": each skill is an element tile coloured by family. Picking a family
 * lights its tiles up and dims the rest; hovering, focusing or tapping a tile shows its logo.
 * A skill listed in several families (TypeScript in web and backend) is one tile, lit by each.
 */
export function SkillsTable({
  groups,
  labels,
}: {
  groups: { label: string; skills: { name: string; symbol?: string | null }[] }[];
  labels: { title: string; intro: string; all: string };
}) {
  const elements = useMemo<Element[]>(() => {
    const byName = new Map<string, Element>();
    groups.forEach((g, gi) =>
      g.skills.forEach((s) => {
        const key = s.name.trim().toLowerCase();
        const seen = byName.get(key);
        if (seen) {
          if (!seen.families.includes(gi)) seen.families.push(gi);
        } else {
          byName.set(key, { n: byName.size + 1, name: s.name, symbol: s.symbol || stackSymbol(s.name), family: gi, families: [gi] });
        }
      }),
    );
    return [...byName.values()];
  }, [groups]);
  const [family, setFamily] = useState<number | null>(null);
  const [active, setActive] = useState<Element | null>(elements[0] ?? null);
  const grid = useRef<HTMLUListElement>(null);
  const current = useRef(active?.n);
  const pick = (el: Element) => {
    if (current.current !== el.n) playTile(el.n - 1, el.family);
    current.current = el.n;
    setActive(el);
  };

  // Touch screens have no hover: each row of tiles crossing the middle of the screen plays its note.
  useEffect(() => {
    const ul = grid.current;
    if (!ul || !window.matchMedia("(hover: none)").matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const n = Number((e.target as HTMLElement).dataset.n);
          const el = elements.find((x) => x.n === n);
          if (el) pick(el);
          break;
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    ul.querySelectorAll("button[data-n]").forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, [elements]);

  if (elements.length === 0) return null;
  const shown = active ?? elements[0];
  const icon = stackIcon(shown.name);
  const familyLabel = (f: number) => groups[f]?.label ?? "";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
      <div>
        <h2 className="max-w-3xl text-[clamp(2.2rem,5.5vw,4.8rem)] font-black uppercase leading-[0.95] tracking-tight display-gradient">{labels.title}</h2>
        <p className="mt-5 max-w-xl text-mist/70">{labels.intro}</p>

        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label={labels.title}>
          {[null, ...groups.map((_, gi) => gi)].map((f) => (
            <button
              key={f ?? "all"}
              type="button"
              aria-pressed={family === f}
              onClick={() => setFamily(f)}
              className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition-colors ${
                family === f ? "border-mist bg-mist text-ink" : "border-line text-mist/80 hover:border-ice/60"
              }`}
            >
              {f !== null && <span aria-hidden className={`size-2.5 rounded-sm ${tint(f).swatch}`} />}
              {f !== null ? familyLabel(f) : labels.all}
            </button>
          ))}
        </div>

        <ul ref={grid} className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(78px,1fr))] gap-2 sm:grid-cols-[repeat(auto-fill,minmax(92px,1fr))]">
          {elements.map((el) => {
            const dim = family !== null && !el.families.includes(family);
            // A lit tile takes the picked family's colour (a skill can be in several families).
            const style = tint(family !== null && !dim ? family : el.family);
            return (
              <li key={el.n}>
                <button
                  type="button"
                  data-n={el.n}
                  onMouseEnter={() => pick(el)}
                  onFocus={() => pick(el)}
                  onClick={() => pick(el)}
                  aria-label={`${el.name}, ${el.families.map(familyLabel).join(", ")}`}
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
              <span className={`flex size-24 items-center justify-center rounded-2xl text-4xl font-bold ${tint(shown.family).tile} ${tint(shown.family).text}`}>
                {shown.symbol}
              </span>
            )}
            <span className="text-xl font-bold text-mist">{shown.name}</span>
            <span className="text-sm uppercase tracking-widest text-mist/60">{shown.families.map(familyLabel).join(" · ")}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
