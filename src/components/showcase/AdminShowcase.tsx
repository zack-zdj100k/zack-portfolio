"use client";

import { useEffect, useRef, useState } from "react";
import { useReduceMotion } from "@/components/ui/motion";
import { DeviceFrame } from "@/components/ui/DeviceFrame";
import type { ShowcaseFeature } from "@/lib/admin-showcase";
import { MockScreen } from "./MockScreens";
import { GlassStack } from "./GlassStack";
import { layerClass } from "@/components/ui/layers";

type Item = { key: ShowcaseFeature; title: string; body: string };

/**
 * Public preview of the admin dashboard (a demo, not the real one). Wide screens: the feature list
 * scrolls while a sticky Mac-style window shows the active feature's demo screen. Phones and
 * tablets: a deck of stacked glass cards. Reduced motion: a plain list, each feature with its screen.
 */
export function AdminShowcase({ items, labels }: { items: Item[]; labels: { demo: string; address: string; screenOf: string } }) {
  const reduce = useReduceMotion();
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (reduce) return;
    // The feature crossing the middle of the viewport is the active one.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [reduce, items.length]);

  const stacked = reduce;

  return (
    <>
      {!stacked && (
        <div className="lg:hidden">
          <GlassStack items={items} labels={labels} />
        </div>
      )}
      <div className={stacked ? "" : "max-lg:hidden lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14"}>
      <ol className="flex flex-col gap-12 lg:gap-0">
        {items.map((item, i) => {
          const on = !stacked && i === active;
          return (
            <li
              key={item.key}
              ref={(el) => {
                refs.current[i] = el;
              }}
              data-index={i}
              className={`flex flex-col gap-5 ${stacked ? "" : "lg:min-h-[42vh] lg:justify-center"}`}
            >
              <div className={`flex flex-col gap-3 border-s-2 ps-5 transition-colors duration-300 ${on ? "border-ice" : "border-line lg:opacity-60"} ${stacked ? "!opacity-100" : ""}`}>
                <span className="text-sm tabular-nums text-mist/55">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="text-[clamp(1.6rem,3vw,2.4rem)] font-black uppercase leading-none text-mist">{item.title}</h3>
                <p className="max-w-md text-lg leading-relaxed text-mist/75">{item.body}</p>
              </div>
              {/* Each feature's own screen: always on phones; on wide screens only in the static version. */}
              <div className={stacked ? "max-w-4xl" : "lg:hidden"}>
                <DeviceFrame address={labels.address} badge={labels.demo}>
                  <div role="img" aria-label={`${labels.screenOf}: ${item.title}`}>
                    <MockScreen feature={item.key} />
                  </div>
                </DeviceFrame>
              </div>
            </li>
          );
        })}
      </ol>

      {!stacked && (
        <div className="hidden lg:block">
          <div className="sticky top-[calc(50vh-250px)]">
            <DeviceFrame variant="laptop" address={labels.address} badge={labels.demo}>
              <div role="img" aria-label={`${labels.screenOf}: ${items[active]?.title}`} className="relative">
                {/* Every screen is rendered, stacked. The new one fades in on top of the last fully shown
                    one, which stays opaque underneath until then: the frame is never blank or dimmed. */}
                <div className="grid">
                  {items.map((item, i) => (
                    <div
                      key={item.key}
                      aria-hidden={i !== active}
                      onTransitionEnd={(e) => {
                        if (i === active && e.propertyName === "opacity") setShown(i);
                      }}
                      className={`[grid-area:1/1] ${layerClass(i, active, shown)}`}
                    >
                      <MockScreen feature={item.key} />
                    </div>
                  ))}
                </div>
              </div>
            </DeviceFrame>
            <div className="mt-6 flex justify-center gap-1.5" aria-hidden>
              {items.map((item, i) => (
                <span key={item.key} className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-ice" : "w-1.5 bg-line"}`} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
