"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { ArrowRight, CornerDownLeft, RotateCw, User } from "lucide-react";
import { useReduceMotion } from "@/components/ui/motion";
import type { SequenceDiagram as Data } from "@/lib/roadmaps";

const COL = 220; // width of one participant's column
const HEAD = 56; // participant boxes
const ROW = 46; // one message
const SELF = 62; // a message to itself (a small loop)
const STEP_MS = 1100;

/**
 * Who talks to whom, in order: participants across the top with their lifelines, messages as
 * arrows down the page (dashed for answers). When it scrolls into view the arrows appear in order;
 * after that a pulse replays the conversation one message at a time. Phones get a numbered list.
 */
export function SequenceDiagram({ diagram, labels }: { diagram: Data; labels: { title: string; self: string } }) {
  return (
    <>
      <div className="hidden lg:block">
        <Chart diagram={diagram} title={labels.title} />
      </div>
      <div className="lg:hidden">
        <SequenceList diagram={diagram} labels={labels} />
      </div>
    </>
  );
}

function layout(diagram: Data) {
  const col = new Map(diagram.participants.map((p, i) => [p.id, i]));
  const cx = (id: string) => (col.get(id) ?? 0) * COL + COL / 2;
  let y = HEAD + 34;
  const rows = diagram.messages.map((m) => {
    const self = m.from === m.to;
    const row = { ...m, self, y, x1: cx(m.from), x2: cx(m.to) };
    y += self ? SELF : ROW;
    return row;
  });
  return { rows, width: diagram.participants.length * COL, height: y + 6, cx };
}

function Chart({ diagram, title }: { diagram: Data; title: string }) {
  const reduce = useReduceMotion();
  const ref = useRef<HTMLDivElement>(null);
  const revealed = useInView(ref, { once: true, amount: 0.2 });
  const inView = useInView(ref, { amount: 0.1 });
  const { rows, width: W, height: Hc, cx } = layout(diagram);
  const stagger = 0.09;
  const revealEnd = rows.length * stagger + 0.6;

  const [active, setActive] = useState(-1);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!revealed || reduce) return;
    const t = setTimeout(() => setReady(true), revealEnd * 1000);
    return () => clearTimeout(t);
  }, [revealed, reduce, revealEnd]);
  useEffect(() => {
    if (!ready || !inView) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % rows.length), STEP_MS);
    return () => clearInterval(timer);
  }, [ready, inView, rows.length]);

  const shown = reduce || revealed;
  const lit = ready && active >= 0 ? rows[active] : null;

  return (
    <div ref={ref} dir="ltr" className="mx-auto w-full" style={{ maxWidth: W * 1.1 }}>
      <svg viewBox={`0 0 ${W} ${Hc}`} role="img" aria-label={title} className="h-auto w-full overflow-visible">
        <defs>
          <marker id="sq-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,1 L9,5 L0,9" fill="none" stroke="var(--color-steel)" strokeWidth="1.6" />
          </marker>
          <marker id="sq-arrow-on" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,1 L9,5 L0,9" fill="none" stroke="var(--color-ice)" strokeWidth="1.6" />
          </marker>
        </defs>

        {/* Lifelines and participants */}
        {diagram.participants.map((p, i) => {
          const x = cx(p.id);
          const on = lit && (lit.from === p.id || lit.to === p.id);
          return (
            <motion.g
              key={p.id}
              initial={reduce ? false : { opacity: 0, y: -10 }}
              animate={shown ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.45, delay: reduce ? 0 : i * 0.06 }}
            >
              <line x1={x} x2={x} y1={HEAD} y2={Hc} stroke="var(--color-line)" strokeWidth={1.2} strokeDasharray="4 6" />
              <rect
                x={i * COL + 14}
                y={0}
                width={COL - 28}
                height={HEAD - 10}
                rx={12}
                fill={on ? "rgb(187 204 215 / 0.14)" : p.actor ? "rgb(187 204 215 / 0.07)" : "var(--color-ink-3)"}
                stroke={on ? "var(--color-ice)" : p.actor ? "rgb(187 204 215 / 0.35)" : "var(--color-line)"}
                className="transition-[fill,stroke] duration-300"
              />
              {p.actor && (
                <g transform={`translate(${i * COL + 30} ${HEAD / 2 - 14})`} stroke="var(--color-ice)" fill="none" strokeWidth={1.6} strokeLinecap="round">
                  <circle cx={8} cy={5} r={4} />
                  <path d="M8 9 v8 M2 12 h12 M8 17 l-5 6 M8 17 l5 6" />
                </g>
              )}
              <text x={x + (p.actor ? 8 : 0)} y={HEAD / 2} dominantBaseline="middle" textAnchor="middle" fontSize={14.5} fontWeight={600} fill="var(--color-mist)">
                {p.label}
              </text>
            </motion.g>
          );
        })}

        {/* Messages */}
        {rows.map((m, i) => {
          const on = lit === m;
          const stroke = on ? "var(--color-ice)" : "var(--color-steel)";
          const d = m.self ? `M${m.x1},${m.y} h40 a8,8 0 0 1 8,8 v6 a8,8 0 0 1 -8,8 h-38` : `M${m.x1},${m.y} L${m.x2 + (m.x2 > m.x1 ? -2 : 2)},${m.y}`;
          const labelX = m.self ? m.x1 + 8 : (m.x1 + m.x2) / 2;
          return (
            <motion.g
              key={i}
              initial={reduce ? false : { opacity: 0 }}
              animate={shown ? { opacity: 1 } : undefined}
              transition={{ duration: 0.35, delay: reduce ? 0 : 0.3 + i * stagger }}
            >
              <path
                d={d}
                fill="none"
                stroke={stroke}
                strokeWidth={on ? 2.2 : 1.4}
                strokeDasharray={m.reply ? "5 5" : undefined}
                markerEnd={on ? "url(#sq-arrow-on)" : "url(#sq-arrow)"}
                className="transition-[stroke] duration-300"
              />
              <text
                x={labelX}
                y={m.y - 9}
                textAnchor={m.self ? "start" : "middle"}
                fontSize={13.5}
                fill={on ? "var(--color-mist)" : m.reply ? "rgb(215 226 234 / 0.6)" : "rgb(215 226 234 / 0.88)"}
                stroke="var(--color-ink)"
                strokeWidth={5}
                paintOrder="stroke"
                className="transition-[fill] duration-300"
              >
                {m.label}
              </text>
            </motion.g>
          );
        })}

        {/* The pulse that replays the current message */}
        {lit && !lit.self && (
          <motion.circle
            key={active}
            r={5}
            cy={lit.y}
            fill="var(--color-ice)"
            style={{ filter: "drop-shadow(0 0 6px rgb(187 204 215 / 0.9))" }}
            initial={{ cx: lit.x1, opacity: 1 }}
            animate={{ cx: lit.x2, opacity: [1, 1, 0] }}
            transition={{ duration: 0.85, ease: "easeInOut" }}
          />
        )}
      </svg>
    </div>
  );
}

/** Phones and tablets: the conversation as a numbered list, one message per line. */
function SequenceList({ diagram, labels }: { diagram: Data; labels: { title: string; self: string } }) {
  const reduce = useReduceMotion();
  const name = new Map(diagram.participants.map((p) => [p.id, p.label]));
  return (
    <div className="flex flex-col gap-5">
      <ul className="flex flex-wrap gap-1.5" aria-hidden>
        {diagram.participants.map((p) => (
          <li key={p.id} className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${p.actor ? "border-ice/40 text-ice" : "border-line text-mist/75"}`}>
            {p.actor && <User className="size-3.5" />}
            {p.label}
          </li>
        ))}
      </ul>
      <ol aria-label={labels.title} className="flex flex-col">
        {diagram.messages.map((m, i) => {
          const self = m.from === m.to;
          return (
            <motion.li
              key={i}
              {...(reduce
                ? {}
                : {
                    initial: { opacity: 0, x: -10 },
                    whileInView: { opacity: 1, x: 0 },
                    viewport: { once: true, amount: 0.6 },
                    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
                  })}
              className={`flex gap-3 border-s-2 py-2.5 ps-4 ${m.reply ? "border-dashed border-line" : "border-ice/50"}`}
            >
              <span className="w-6 shrink-0 pt-0.5 text-xs tabular-nums text-mist/45">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="flex flex-wrap items-center gap-1.5 text-xs uppercase tracking-wider text-mist/55">
                  {name.get(m.from)}
                  {self ? (
                    <RotateCw aria-label={labels.self} className="size-3 text-ice" />
                  ) : m.reply ? (
                    <CornerDownLeft aria-hidden className="size-3 text-mist/45 rtl:-scale-x-100" />
                  ) : (
                    <ArrowRight aria-hidden className="size-3 text-ice rtl:rotate-180" />
                  )}
                  {!self && name.get(m.to)}
                </span>
                <span className={`break-words ${m.reply ? "text-mist/65" : "text-mist"}`} dir="auto">
                  {m.label}
                </span>
              </span>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
