"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useReduceMotion } from "@/components/ui/motion";

export type StripImage = { src: string; width: number; height: number };

/**
 * Two rows of project images that slide in opposite directions as the page scrolls.
 * Built only from project data. Decorative: the same projects are listed with links below.
 */
export function ProjectStrip({ images }: { images: StripImage[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReduceMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const forward = useTransform(scrollYProgress, [0, 1], ["-12%", "4%"]);
  const backward = useTransform(scrollYProgress, [0, 1], ["4%", "-12%"]);

  if (images.length === 0) return null;
  // Repeat so each row is always wider than the viewport.
  const fill = (list: StripImage[]) => {
    const out: StripImage[] = [];
    while (out.length < 10) out.push(...list);
    return out;
  };
  const half = Math.ceil(images.length / 2);
  const rowA = fill(images.length > 3 ? images.slice(0, half) : images);
  const rowB = fill(images.length > 3 ? images.slice(half) : [...images].reverse());

  return (
    <div ref={ref} aria-hidden className="flex flex-col gap-3 overflow-hidden py-16 sm:py-24 md:py-32" dir="ltr">
      {[rowA, rowB].map((row, r) => (
        <motion.div key={r} style={reduce ? undefined : { x: r === 0 ? forward : backward }} className="flex w-max gap-3">
          {row.map((img, i) => (
            <div key={i} className="relative h-[150px] w-[234px] shrink-0 overflow-hidden rounded-2xl bg-ink-3 sm:h-[210px] sm:w-[327px] md:h-[270px] md:w-[420px]">
              <Image src={img.src} alt="" fill sizes="420px" className="object-cover" loading="lazy" />
            </div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}
