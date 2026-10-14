"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DeviceFrame } from "@/components/ui/DeviceFrame";
import type { ShowcaseFeature } from "@/lib/admin-showcase";
import { MockScreen } from "./MockScreens";

type Item = { key: ShowcaseFeature; title: string; body: string };

/**
 * Phones and tablets: each feature is a glass card in its own sticky screen. The next card slides
 * over the last one, which shrinks and dims behind it, so the features pile up as a deck.
 */
export function GlassStack({ items, labels }: { items: Item[]; labels: { demo: string; address: string; screenOf: string } }) {
  const root = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
      const slots = gsap.utils.toArray<HTMLElement>("[data-slot]", el);
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", el);
      const last = slots[slots.length - 1];
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        const depth = Math.min(cards.length - 1 - i, 4);
        gsap.fromTo(
          card,
          { scale: 1, filter: "brightness(1)" },
          {
            scale: 1 - depth * 0.05,
            filter: `brightness(${1 - depth * 0.12})`,
            ease: "none",
            scrollTrigger: { trigger: slots[i], start: "top top", endTrigger: last, end: "top top", scrub: true, invalidateOnRefresh: true },
          },
        );
      });
    });
    return () => mm.revert();
  }, [items.length]);

  return (
    <ol ref={root} className="relative">
      {items.map((item, i) => (
        <li
          key={item.key}
          data-slot
          className="sticky top-0 flex min-h-svh items-start justify-center pb-6"
          style={{ paddingTop: `calc(5.5rem + ${Math.min(i, 4) * 10}px)` }}
        >
          <article data-card className="glass-card glass-edge w-full max-w-2xl origin-top rounded-[28px] p-5 sm:p-7">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-[clamp(1.6rem,6vw,2.4rem)] font-black uppercase leading-none text-mist">{item.title}</h3>
              <span className="shrink-0 text-sm tabular-nums text-mist/55">
                {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </span>
            </div>
            <p className="mt-3 text-base leading-relaxed text-mist/75 sm:text-lg">{item.body}</p>
            <DeviceFrame address={labels.address} badge={labels.demo} className="mt-5">
              <div role="img" aria-label={`${labels.screenOf}: ${item.title}`}>
                <MockScreen feature={item.key} />
              </div>
            </DeviceFrame>
          </article>
        </li>
      ))}
    </ol>
  );
}
