"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Cloud, Database, LayoutTemplate, MonitorSmartphone, Plug, Server, type LucideIcon } from "lucide-react";
import { useReduceMotion } from "@/components/ui/motion";

type Kind = "CLIENT" | "FRONTEND" | "API" | "BACKEND" | "DATABASE" | "EXTERNAL";
type Node = { id: string; kind: Kind; technology: string | null; label: string | null; body: string | null };
export type FlowNode = Node & { branches: Node[] };

const ICONS: Record<Kind, LucideIcon> = {
  CLIENT: MonitorSmartphone,
  FRONTEND: LayoutTemplate,
  API: Plug,
  BACKEND: Server,
  DATABASE: Database,
  EXTERNAL: Cloud,
};

const STEP_MS = 1500;

/**
 * A project's request flow as a chain of boxes (left → right on wide screens, top → bottom on
 * phones). While the graph is on screen, the highlight walks the chain and a pulse travels along
 * each connector. With reduced motion everything is static and equally lit. The list itself is
 * the accessible version: an ordered list with one sentence per step.
 */
export function ArchitectureFlow({
  chain,
  labels,
  rtl = false,
}: {
  chain: FlowNode[];
  labels: { graph: string; kinds: Record<Kind, string>; branchOf: string };
  rtl?: boolean;
}) {
  const reduce = useReduceMotion();
  const ref = useRef<HTMLOListElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const [active, setActive] = useState(0);
  const animate = !reduce && inView && chain.length > 1;

  useEffect(() => {
    if (!animate) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % chain.length), STEP_MS);
    return () => clearInterval(timer);
  }, [animate, chain.length]);

  if (chain.length === 0) return null;
  const lit = (i: number) => reduce || !inView || i === active;

  return (
    <ol ref={ref} aria-label={labels.graph} className="flex flex-col items-stretch gap-0 lg:flex-row lg:items-start">
      {chain.map((node, i) => {
        const Icon = ICONS[node.kind];
        const on = lit(i);
        return (
          <Fragment key={node.id}>
            <li className="flex min-w-0 flex-1 flex-col gap-3">
              <div
                className={`relative flex flex-col gap-3 rounded-[22px] border p-5 transition-[border-color,background-color,transform,box-shadow] duration-500 ${
                  on && !reduce && inView
                    ? "-translate-y-1 border-ice/70 bg-ice/[0.08] shadow-[0_18px_40px_-18px_rgb(187_204_215/0.45)]"
                    : "border-line bg-ink-2"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-500 ${on ? "bg-ice text-ink" : "bg-ink-3 text-mist/70"}`}
                  >
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  {/* Step number, plus the kind when the step has its own name (else the name is the kind). */}
                  <span className="text-xs uppercase tracking-widest text-mist/55">
                    <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    {node.label && <> · {labels.kinds[node.kind]}</>}
                  </span>
                </div>
                <p className="text-lg font-bold leading-tight text-mist">{node.label ?? labels.kinds[node.kind]}</p>
                {node.technology && <p className="w-fit rounded-full border border-line px-3 py-1 text-xs text-mist/80">{node.technology}</p>}
                {node.body && <p className="text-sm leading-relaxed text-mist/65">{node.body}</p>}
              </div>
              {node.branches.length > 0 && (
                <ul aria-label={labels.branchOf} className="flex flex-col gap-2 border-s border-dashed border-steel ps-4">
                  {node.branches.map((b) => {
                    const BIcon = ICONS[b.kind];
                    return (
                      <li key={b.id} className="flex items-start gap-3 rounded-xl border border-dashed border-line bg-ink-2/60 p-3">
                        <BIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-ice" />
                        <span className="flex flex-col">
                          <span className="text-sm font-medium text-mist">{b.label ?? labels.kinds[b.kind]}</span>
                          {b.technology && <span className="text-xs text-mist/60">{b.technology}</span>}
                          {b.body && <span className="mt-1 text-xs text-mist/55">{b.body}</span>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
            {i < chain.length - 1 && <Connector live={animate && i === active} rtl={rtl} />}
          </Fragment>
        );
      })}
    </ol>
  );
}

/** Line between two steps, with a pulse that runs along it when the step before it is active. */
function Connector({ live, rtl }: { live: boolean; rtl: boolean }) {
  return (
    <li aria-hidden className="relative mx-auto h-10 w-px shrink-0 bg-line lg:mx-0 lg:mt-[46px] lg:h-px lg:w-auto lg:min-w-8 lg:flex-[0.35]">
      {live && (
        <>
          <motion.span
            className="absolute left-1/2 top-0 size-2 -translate-x-1/2 rounded-full bg-ice shadow-[0_0_12px_rgb(187_204_215/0.9)] lg:hidden"
            initial={{ top: "0%" }}
            animate={{ top: "100%" }}
            transition={{ duration: STEP_MS / 1000, ease: "easeInOut" }}
          />
          <motion.span
            className="absolute top-1/2 hidden size-2 -translate-y-1/2 rounded-full bg-ice shadow-[0_0_12px_rgb(187_204_215/0.9)] lg:block"
            initial={{ left: rtl ? "100%" : "0%" }}
            animate={{ left: rtl ? "0%" : "100%" }}
            transition={{ duration: STEP_MS / 1000, ease: "easeInOut" }}
          />
        </>
      )}
      <span className="absolute -bottom-1 left-1/2 size-0 -translate-x-1/2 border-x-[5px] border-t-[6px] border-x-transparent border-t-line lg:-right-1 lg:bottom-auto lg:left-auto lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0 lg:border-y-[5px] lg:border-l-[6px] lg:border-r-0 lg:border-y-transparent lg:border-l-line lg:border-t-transparent rtl:lg:-left-1 rtl:lg:right-auto rtl:lg:rotate-180" />
    </li>
  );
}
