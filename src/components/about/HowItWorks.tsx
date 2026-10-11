"use client";

import { motion } from "motion/react";
import { Pin } from "lucide-react";
import { useReduceMotion } from "@/components/ui/motion";

type Step = { title: string; description: string };

// Three tints from the site palette, cycling through the notes.
const TINTS = [
  { box: "bg-ice/10 border-ice/25", text: "text-ice" },
  { box: "bg-steel/15 border-steel/35", text: "text-[#9aa3ad]" },
  { box: "bg-mist/[0.07] border-mist/20", text: "text-mist" },
];

// Desktop: notes zig-zag down the page, each tilted, joined by a moving dashed line.
const POSITIONS = [
  { className: "md:absolute md:top-0 md:left-[12%]", rotate: "md:rotate-[8deg]" },
  { className: "md:absolute md:top-[120px] md:right-[12%]", rotate: "md:-rotate-[8deg]" },
  { className: "md:absolute md:top-[450px] md:left-[12%]", rotate: "md:rotate-[8deg]" },
  { className: "md:absolute md:top-[570px] md:right-[8%]", rotate: "md:-rotate-[8deg]" },
  { className: "md:absolute md:top-[850px] md:left-[12%]", rotate: "md:rotate-[8deg]" },
];
const HEIGHTS = [400, 450, 800, 900, 1130];
const PATH = [
  "M 290 150 C 500 150, 550 270, 710 270",
  " C 850 270, 500 350, 290 450",
  " C 290 600, 550 720, 750 720",
  " C 950 720, 500 800, 290 850",
];

/** "How I work" as pinned notes on ruled paper (owner's chosen design, in the site palette). */
export function HowItWorks({ steps }: { steps: Step[] }) {
  const reduce = useReduceMotion();
  const data = steps.slice(0, 5);
  const height = HEIGHTS[data.length - 1] ?? 1130;
  const d = PATH.slice(0, Math.max(0, data.length - 1)).join("");

  return (
    <div className="relative px-2 py-10 md:py-16">
      {/* Ruled lines, faded at both sides */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgb(215_226_234/0.07)_1px,transparent_1px)] bg-[length:100%_32px]" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-ink" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-ink" />

      <ol
        className="relative mx-auto flex w-full max-w-[1000px] flex-col gap-8 md:block md:h-[var(--md-height)]"
        style={{ "--md-height": `${height}px` } as React.CSSProperties}
      >
        {data.length > 1 && (
          <svg aria-hidden className="pointer-events-none absolute inset-0 hidden h-full w-full md:block" viewBox={`0 0 1000 ${height}`} preserveAspectRatio="none">
            <motion.path
              d={d}
              stroke="currentColor"
              className="text-steel"
              strokeWidth="2"
              strokeDasharray="8 6"
              fill="none"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              initial={{ strokeDashoffset: 0 }}
              animate={reduce ? undefined : { strokeDashoffset: -140 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </svg>
        )}
        {data.map((step, i) => {
          const pos = POSITIONS[i];
          const tint = TINTS[i % TINTS.length];
          return (
            <li key={step.title} className={`relative w-full transition-transform duration-300 hover:z-30 md:w-[280px] md:hover:scale-105 ${pos.rotate} ${pos.className}`}>
              <div className="rounded-[25px] border border-line bg-ink-2 p-2 shadow-[0_20px_40px_rgb(0_0_0/0.45)]">
                <Pin aria-hidden className={`mx-auto mb-5 mt-2 size-7 fill-current ${tint.text}`} strokeWidth={1.5} />
                <div className={`flex h-full flex-col rounded-[15px] border p-4 ${tint.box}`}>
                  <span aria-hidden className={`mb-4 font-[family-name:var(--font-hand)] text-4xl ${tint.text}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mb-2.5 text-2xl font-semibold leading-none text-mist">{step.title}</h3>
                  <p className="text-sm leading-5 text-mist/70">{step.description}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
