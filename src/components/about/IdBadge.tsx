"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useInView, useSpring } from "motion/react";
import { useReduceMotion } from "@/components/ui/motion";

export type BadgeData = {
  header: string;
  name: string;
  role: string;
  photo: { src: string; alt: string; isArtwork: boolean };
  lines: string[];
};

/**
 * A developer ID badge hanging from a lanyard. It swings into place when it scrolls into view and
 * can be pulled sideways (mouse or touch); it swings back like a real badge. Static under reduced
 * motion. Purely presentational: the same facts are listed as text next to it.
 */
export function IdBadge({ data, className = "" }: { data: BadgeData; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReduceMotion();
  const inView = useInView(ref, { once: true, amount: 0.4 });
  // Low damping so a pull turns into a few decaying swings.
  const rotate = useSpring(0, { stiffness: 70, damping: 5, mass: 0.9 });

  useEffect(() => {
    if (!inView || reduce) return;
    rotate.jump(14);
    rotate.set(0);
  }, [inView, reduce, rotate]);

  return (
    <div ref={ref} className={`relative flex justify-center ${className}`}>
      <motion.div
        style={reduce ? undefined : { rotate }}
        onPan={reduce ? undefined : (_, info) => rotate.set(Math.max(-38, Math.min(38, -info.offset.x * 0.18)))}
        onPanEnd={reduce ? undefined : () => rotate.set(0)}
        className="flex origin-top touch-pan-y cursor-grab select-none flex-col items-center active:cursor-grabbing"
      >
        {/* Lanyard and clip */}
        <div aria-hidden className="h-24 w-4 rounded-b-sm bg-[repeating-linear-gradient(180deg,#2E3A46_0_6px,#3b4856_6px_12px)] sm:h-32" />
        <div aria-hidden className="-mt-1 h-7 w-12 rounded-lg border-2 border-[#9aa3ad] bg-gradient-to-b from-[#c9d2da] to-[#7d8792]" />
        <div aria-hidden className="-mt-1 h-3 w-16 rounded-full bg-ink" />

        {/* The card */}
        <div className="-mt-1 w-[230px] overflow-hidden rounded-2xl bg-paper text-ink shadow-[0_30px_60px_rgb(0_0_0/0.55)] sm:w-[260px]">
          <div className="flex items-center justify-between bg-ink px-4 py-3">
            <span className="text-sm font-black uppercase tracking-tight text-mist">{data.name.split(" ")[0]}</span>
            <span className="text-[0.62rem] font-medium uppercase tracking-[0.22em] text-mist/80">{data.header}</span>
          </div>
          <div className="flex flex-col items-center gap-3 px-5 pb-4 pt-5">
            <div className="relative h-36 w-28 overflow-hidden rounded-xl bg-ink sm:h-40 sm:w-32">
              <Image
                src={data.photo.src}
                alt={data.photo.alt}
                fill
                sizes="128px"
                className={data.photo.isArtwork ? "object-contain object-bottom pt-2" : "object-cover"}
                draggable={false}
              />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold uppercase leading-tight">{data.name}</p>
              <p className="text-sm text-ink/70">{data.role}</p>
            </div>
            {data.lines.length > 0 && (
              <ul className="w-full border-t border-ink/10 pt-3 text-center text-xs text-ink/70">
                {data.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            )}
            {/* Decorative barcode */}
            <div
              aria-hidden
              className="h-8 w-full bg-[repeating-linear-gradient(90deg,#0c0c0c_0_2px,transparent_2px_4px,#0c0c0c_4px_5px,transparent_5px_8px,#0c0c0c_8px_11px,transparent_11px_13px)]"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
