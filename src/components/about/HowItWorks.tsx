"use client";

import { motion } from "motion/react";
import { Pin } from "lucide-react";
import Image from "next/image";
import { useReduceMotion } from "@/components/ui/motion";
import { PROCESS_ICONS } from "./process-icons";

export type Step = {
  id: string;
  title: string;
  description: string;
  icon?: string | null;
  image?: { src: string; width: number; height: number; alt: string } | null;
};

// Three tints from the site palette, cycling through the notes.
const TINTS = [
  { box: "bg-ice/10 border-ice/25", text: "text-ice" },
  { box: "bg-steel/15 border-steel/35", text: "text-[#9aa3ad]" },
  { box: "bg-mist/[0.07] border-mist/20", text: "text-mist" },
];

// Desktop: notes zig-zag down the page (left, right, left...), each tilted, joined by a moving
// dashed line. Works for any number of steps; rows get taller when a step has an image.
const NOTE_HEIGHT = 330;
const IMAGE_EXTRA = 170;
function layout(count: number, withImages: boolean) {
  const row = withImages ? 420 + IMAGE_EXTRA : 420;
  const tops = Array.from({ length: count }, (_, i) => Math.floor(i / 2) * row + (i % 2) * 120);
  const height = count === 0 ? 0 : tops[count - 1] + NOTE_HEIGHT + (withImages ? IMAGE_EXTRA : 0) + 40;
  const points = tops.map((top, i) => ({ x: i % 2 === 0 ? 290 : 710, y: top + 150 }));
  const d = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const bend = prev.x < p.x ? 210 : -210;
      return ` C ${prev.x + bend} ${prev.y}, ${p.x - bend} ${p.y}, ${p.x} ${p.y}`;
    })
    .join("");
  return { tops, height, d };
}

/** "How I work" as pinned notes on ruled paper (owner's chosen design, in the site palette). */
export function HowItWorks({ steps }: { steps: Step[] }) {
  const reduce = useReduceMotion();
  if (steps.length === 0) return null;
  const { tops, height, d } = layout(steps.length, steps.some((s) => s.image));

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
        {steps.length > 1 && (
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
        {steps.map((step, i) => {
          const tint = TINTS[i % TINTS.length];
          const left = i % 2 === 0;
          const Icon = step.icon ? PROCESS_ICONS[step.icon] : undefined;
          return (
            <li
              key={step.id}
              style={{ "--top": `${tops[i]}px` } as React.CSSProperties}
              className={`relative w-full transition-transform duration-300 hover:z-30 md:absolute md:top-[var(--top)] md:w-[280px] md:hover:scale-105 ${
                left ? "md:left-[12%] md:rotate-[8deg]" : "md:right-[12%] md:-rotate-[8deg]"
              }`}
            >
              <div className="rounded-[25px] border border-line bg-ink-2 p-2 shadow-[0_20px_40px_rgb(0_0_0/0.45)]">
                <Pin aria-hidden className={`mx-auto mb-5 mt-2 size-7 fill-current ${tint.text}`} strokeWidth={1.5} />
                <div className={`flex h-full flex-col rounded-[15px] border p-4 ${tint.box}`}>
                  <span aria-hidden className={`mb-4 flex items-center justify-between font-[family-name:var(--font-hand)] text-4xl ${tint.text}`}>
                    {String(i + 1).padStart(2, "0")}
                    {Icon && <Icon className="size-6" strokeWidth={1.75} />}
                  </span>
                  {step.image && (
                    <Image
                      src={step.image.src}
                      alt={step.image.alt}
                      width={step.image.width}
                      height={step.image.height}
                      sizes="(min-width: 768px) 260px, 90vw"
                      className="mb-4 aspect-[16/10] w-full rounded-lg object-cover"
                    />
                  )}
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
