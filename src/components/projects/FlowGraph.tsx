"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { ArrowRight, Database, Shield, User } from "lucide-react";
import { useReduceMotion } from "@/components/ui/motion";
import { NODE_HEIGHT, type FlowDiagram } from "@/lib/roadmaps";

type Node = FlowDiagram["nodes"][number];
type Edge = FlowDiagram["edges"][number];
type Side = "top" | "bottom" | "left" | "right";
type Pt = [number, number];
type Route = { points: Pt[]; d: string; label: Pt | null };

const STEP_MS = 1300; // time each connection stays lit in the loop
const TRAVEL_MS = 900; // time the pulse takes to run along it

/**
 * A hand-laid-out diagram (pages, steps, use cases) with right-angled connectors. When it scrolls
 * into view the boxes appear one by one and the connectors draw themselves; after that a pulse
 * runs along each connection in turn and lights the box it reaches. Reduced motion: static.
 * On screens too narrow for it, the same content is shown as a list (see <FlowList>).
 */
export function FlowGraph({ diagram, labels }: { diagram: FlowDiagram; labels: { title: string; leadsTo: string } }) {
  // Wide enough when its text stays at ≥ ~11px: tablets for the narrow diagrams, laptops for the rest.
  const bp = diagram.width * 0.75 <= 680 ? "md" : "lg";
  return (
    <>
      <div className={bp === "md" ? "hidden md:block" : "hidden lg:block"}>
        <Graph diagram={diagram} title={labels.title} />
      </div>
      <div className={bp === "md" ? "md:hidden" : "lg:hidden"}>
        <FlowList diagram={diagram} leadsTo={labels.leadsTo} title={labels.title} />
      </div>
    </>
  );
}

function Graph({ diagram, title }: { diagram: FlowDiagram; title: string }) {
  const reduce = useReduceMotion();
  const ref = useRef<HTMLDivElement>(null);
  const revealed = useInView(ref, { once: true, amount: 0.25 });
  const inView = useInView(ref, { amount: 0.15 });
  const routes = route(diagram);
  const { width: W, height: Hc, nodes, edges, groups = [], dense } = diagram;
  const order = new Map(nodes.map((n, i) => [n.id, i]));
  const nodeDelay = (id: string) => (order.get(id) ?? 0) * 0.07;
  const revealEnd = nodes.length * 0.07 + 0.7;

  // The loop: one connection at a time, only while the graph is on screen.
  const [active, setActive] = useState(-1);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!revealed || reduce) return;
    const t = setTimeout(() => setReady(true), revealEnd * 1000);
    return () => clearTimeout(t);
  }, [revealed, reduce, revealEnd]);
  useEffect(() => {
    if (!ready || !inView) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % edges.length), STEP_MS);
    return () => clearInterval(timer);
  }, [ready, inView, edges.length]);

  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const dot = useRef<SVGCircleElement>(null);
  useEffect(() => {
    const path = pathRefs.current[active];
    const c = dot.current;
    if (!path || !c) return;
    const length = path.getTotalLength();
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / TRAVEL_MS);
      const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      const p = path.getPointAtLength(eased * length);
      c.setAttribute("cx", String(p.x));
      c.setAttribute("cy", String(p.y));
      c.setAttribute("opacity", t < 1 ? "1" : "0");
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  const shown = reduce || revealed;
  const lit = ready && active >= 0 ? edges[active] : null;
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;

  return (
    <div ref={ref} dir="ltr" className="mx-auto w-full [container-type:inline-size]" style={{ maxWidth: W * 1.1 }}>
      <div role="img" aria-label={title} className="relative" style={{ aspectRatio: `${W} / ${Hc}`, fontSize: `${(14.5 * 100) / W}cqw` }}>
        <svg viewBox={`0 0 ${W} ${Hc}`} className="absolute inset-0 size-full overflow-visible" aria-hidden>
          <defs>
            <marker id="fg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,1 L9,5 L0,9" fill="none" stroke="var(--color-steel)" strokeWidth="1.6" />
            </marker>
            <marker id="fg-arrow-on" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,1 L9,5 L0,9" fill="none" stroke="var(--color-ice)" strokeWidth="1.6" />
            </marker>
          </defs>
          {groups.map((g, k) => (
            <motion.rect
              key={k}
              x={g.x}
              y={g.y}
              width={g.w}
              height={g.h}
              rx={18}
              fill="rgb(187 204 215 / 0.025)"
              stroke="var(--color-line)"
              strokeDasharray="6 6"
              initial={reduce ? false : { opacity: 0 }}
              animate={shown ? { opacity: 1 } : undefined}
              transition={{ duration: 0.6, delay: reduce ? 0 : k * 0.12 }}
            />
          ))}
          {routes.map((r, i) => {
            const e = edges[i];
            const on = lit === e;
            const delay = Math.max(nodeDelay(e.from), nodeDelay(e.to)) + 0.15;
            return (
              <motion.path
                key={i}
                ref={(el) => {
                  pathRefs.current[i] = el;
                }}
                d={r.d}
                fill="none"
                stroke={on ? "var(--color-ice)" : "var(--color-steel)"}
                strokeWidth={on ? 2 : 1.4}
                strokeOpacity={on || !dense ? 1 : 0.4}
                strokeDasharray={e.dashed ? "5 6" : undefined}
                markerEnd={on ? "url(#fg-arrow-on)" : "url(#fg-arrow)"}
                className="transition-[stroke] duration-300"
                initial={reduce ? false : e.dashed ? { opacity: 0 } : { pathLength: 0, opacity: 0 }}
                animate={shown ? (e.dashed ? { opacity: 1 } : { pathLength: 1, opacity: 1 }) : undefined}
                transition={{ duration: 0.55, delay: reduce ? 0 : delay, ease: "easeOut" }}
              />
            );
          })}
          <circle ref={dot} r={5} cx={-20} cy={-20} opacity={0} fill="var(--color-ice)" style={{ filter: "drop-shadow(0 0 6px rgb(187 204 215 / 0.9))" }} />
          {groups.map((g, k) => (
            // The ink outline cuts the connectors that pass behind the name.
            <text
              key={`g${k}`}
              x={g.align === "start" ? g.x + 18 : g.x + g.w / 2}
              y={g.y + 26}
              textAnchor={g.align === "start" ? "start" : "middle"}
              fill="var(--color-mist)"
              fillOpacity={0.7}
              stroke="var(--color-ink)"
              strokeWidth={6}
              paintOrder="stroke"
              fontSize={14}
              letterSpacing="0.12em"
            >
              {g.label.toUpperCase()}
            </text>
          ))}
        </svg>

        {nodes.map((n) => {
          const on = lit?.to === n.id;
          const from = lit?.from === n.id;
          const h = n.h ?? NODE_HEIGHT;
          return (
            <motion.div
              key={n.id}
              className="absolute"
              style={{ left: pct(n.x, W), top: pct(n.y, Hc), width: pct(n.w, W), height: pct(h, Hc) }}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={shown ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.5, delay: reduce ? 0 : nodeDelay(n.id), ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className={`flex size-full items-center justify-center gap-[0.5em] border px-[0.9em] text-center font-medium leading-tight transition-[border-color,background-color,box-shadow,color] duration-300 ${shape(n.kind)} ${
                  on
                    ? "border-ice bg-ice/15 text-mist shadow-[0_0_0_1px_rgb(187_204_215/0.5),0_12px_32px_-12px_rgb(187_204_215/0.55)]"
                    : from
                      ? "border-ice/60 bg-ink-3 text-mist"
                      : n.kind === "actor"
                        ? "border-ice/35 bg-ice/[0.07] text-mist"
                        : "border-line bg-ink-3 text-mist/90"
                }`}
              >
                {n.kind === "actor" && <User aria-hidden className="size-[1.2em] shrink-0 text-ice" />}
                {n.kind === "admin" && <Shield aria-hidden className="size-[1em] shrink-0 text-ice/80" />}
                {n.kind === "db" && <Database aria-hidden className="size-[1.05em] shrink-0 text-ice" />}
                <span dir="auto" className="min-w-0 hyphens-auto [overflow-wrap:anywhere]">
                  {n.label}
                </span>
              </div>
            </motion.div>
          );
        })}

        {routes.map((r, i) =>
          r.label && edges[i].label ? (
            <motion.span
              key={`l${i}`}
              dir="auto"
              className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border px-[0.7em] py-[0.15em] text-[0.82em] transition-colors duration-300 ${
                lit === edges[i] ? "border-ice bg-ice text-ink" : "border-line bg-ink text-mist/80"
              }`}
              style={{ left: pct(r.label[0], W), top: pct(r.label[1], Hc) }}
              initial={reduce ? false : { opacity: 0 }}
              animate={shown ? { opacity: 1 } : undefined}
              transition={{ duration: 0.4, delay: reduce ? 0 : Math.max(nodeDelay(edges[i].from), nodeDelay(edges[i].to)) + 0.5 }}
            >
              {edges[i].label}
            </motion.span>
          ) : null,
        )}
      </div>
    </div>
  );
}

function shape(kind: Node["kind"]) {
  if (kind === "case") return "rounded-full";
  if (kind === "actor") return "rounded-[1.1em]";
  if (kind === "admin" || kind === "decision") return "rounded-[0.8em] border-dashed";
  return "rounded-[0.8em]";
}

/* ---------------------------------------------------------------------------------------- */
/* Routing: right-angled connectors between the boxes, with rounded corners.                 */
/* ---------------------------------------------------------------------------------------- */

function route(diagram: FlowDiagram): Route[] {
  const byId = new Map(diagram.nodes.map((n) => [n.id, n]));
  const box = (id: string) => {
    const n = byId.get(id)!;
    const h = n.h ?? NODE_HEIGHT;
    return { x: n.x, y: n.y, w: n.w, h, cx: n.x + n.w / 2, cy: n.y + h / 2 };
  };

  // Which side of each box every connector leaves from and arrives at.
  const sides = diagram.edges.map((e): [Side, Side] => {
    const a = box(e.from);
    const b = box(e.to);
    if (e.around) return [e.around, e.around];
    const sideways: [Side, Side] = b.cx >= a.cx ? ["right", "left"] : ["left", "right"];
    if (e.side) return sideways;
    if (b.y >= a.y + a.h) return ["bottom", "top"];
    if (b.y + b.h <= a.y) return ["top", "bottom"];
    return sideways;
  });

  // Spread the connectors that share a side, ordered by where their other end is (fewer crossings).
  const ports = new Map<string, { edge: number; end: 0 | 1; other: number }[]>();
  diagram.edges.forEach((e, i) => {
    ([0, 1] as const).forEach((end) => {
      const self = end === 0 ? e.from : e.to;
      const other = box(end === 0 ? e.to : e.from);
      const side = sides[i][end];
      const key = `${self}:${side}`;
      const list = ports.get(key) ?? [];
      list.push({ edge: i, end, other: side === "top" || side === "bottom" ? other.cx : other.cy });
      ports.set(key, list);
    });
  });
  const at = new Map<string, Pt>();
  for (const [key, list] of ports) {
    const [id, side] = key.split(":") as [string, Side];
    const b = box(id);
    list.sort((p, q) => p.other - q.other || p.edge - q.edge);
    const span = side === "top" || side === "bottom" ? b.w : b.h;
    const step = Math.min(span / (list.length + 1), 40);
    list.forEach((p, k) => {
      // A connector can pin its end along the side (0 = start, 1 = end) to line up with another.
      const e = diagram.edges[p.edge];
      const pin = p.end === 0 ? e.fx : e.tx;
      const offset = pin !== undefined ? (pin - 0.5) * span : (k - (list.length - 1) / 2) * step;
      const pt: Pt =
        side === "top" ? [b.cx + offset, b.y] : side === "bottom" ? [b.cx + offset, b.y + b.h] : side === "left" ? [b.x, b.cy + offset] : [b.x + b.w, b.cy + offset];
      at.set(`${p.edge}:${p.end}`, pt);
    });
  }

  // Sideways connectors from the same box bend at different distances, the top one furthest out.
  const lane = new Map<number, number>();
  const sideGroups = new Map<string, number[]>();
  diagram.edges.forEach((e, i) => {
    if (sides[i][0] !== "left" && sides[i][0] !== "right") return;
    if (e.around) return;
    const key = `${e.from}:${sides[i][0]}`;
    sideGroups.set(key, [...(sideGroups.get(key) ?? []), i]);
  });
  for (const list of sideGroups.values()) {
    if (list.length < 2) continue;
    list.sort((p, q) => box(diagram.edges[p].to).cy - box(diagram.edges[q].to).cy);
    list.forEach((i, k) => {
      const [x0] = at.get(`${i}:0`)!;
      const [x1] = at.get(`${i}:1`)!;
      lane.set(i, x0 + ((x1 - x0) * (list.length - k)) / (list.length + 1));
    });
  }

  return diagram.edges.map((e, i) => {
    const p0 = at.get(`${i}:0`)!;
    const p1 = at.get(`${i}:1`)!;
    const [s0] = sides[i];
    let points: Pt[];
    if (e.around) {
      const x = e.around === "right" ? diagram.width - 18 : 18;
      points = [p0, [x, p0[1]], [x, p1[1]], p1];
    } else if (s0 === "top" || s0 === "bottom") {
      const y = e.at ?? (p0[1] + p1[1]) / 2;
      points = Math.abs(p0[0] - p1[0]) < 1 ? [p0, p1] : [p0, [p0[0], y], [p1[0], y], p1];
    } else {
      const x = e.at ?? lane.get(i) ?? (p0[0] + p1[0]) / 2;
      points = Math.abs(p0[1] - p1[1]) < 1 ? [p0, p1] : [p0, [x, p0[1]], [x, p1[1]], p1];
    }
    // The label sits on the longest straight part.
    let label: Pt | null = null;
    let best = -1;
    for (let k = 0; k < points.length - 1; k++) {
      const [a, b] = [points[k], points[k + 1]];
      const len = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
      if (len > best) {
        best = len;
        label = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      }
    }
    return { points, d: rounded(points, 10), label };
  });
}

/** SVG path through right-angled points, with each corner rounded. */
function rounded(points: Pt[], radius: number): string {
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let k = 1; k < points.length - 1; k++) {
    const [prev, cur, next] = [points[k - 1], points[k], points[k + 1]];
    const lenIn = Math.hypot(cur[0] - prev[0], cur[1] - prev[1]);
    const lenOut = Math.hypot(next[0] - cur[0], next[1] - cur[1]);
    const r = Math.min(radius, lenIn / 2, lenOut / 2);
    if (r < 0.5) {
      d += ` L${cur[0]},${cur[1]}`;
      continue;
    }
    const a: Pt = [cur[0] - ((cur[0] - prev[0]) / lenIn) * r, cur[1] - ((cur[1] - prev[1]) / lenIn) * r];
    const b: Pt = [cur[0] + ((next[0] - cur[0]) / lenOut) * r, cur[1] + ((next[1] - cur[1]) / lenOut) * r];
    d += ` L${a[0]},${a[1]} Q${cur[0]},${cur[1]} ${b[0]},${b[1]}`;
  }
  const last = points[points.length - 1];
  return `${d} L${last[0]},${last[1]}`;
}

/* ---------------------------------------------------------------------------------------- */
/* Narrow screens: the same diagram as a list.                                                */
/* ---------------------------------------------------------------------------------------- */

/**
 * Diagrams with people in them (use cases): each person, then what they can do. Other diagrams:
 * the boxes in order, joined by a line where one leads to the next, with any other destinations
 * listed under the box.
 */
function FlowList({ diagram, leadsTo, title }: { diagram: FlowDiagram; leadsTo: string; title: string }) {
  const reduce = useReduceMotion();
  const byId = new Map(diagram.nodes.map((n) => [n.id, n]));
  const out = (id: string) => diagram.edges.filter((e) => e.from === id);
  const actors = diagram.nodes.filter((n) => n.kind === "actor");
  const appear = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.4 },
          transition: { duration: 0.45, delay: Math.min(i, 3) * 0.06, ease: [0.16, 1, 0.3, 1] as const },
        };

  const chips = (edges: Edge[]) =>
    edges.length > 0 && (
      <ul aria-label={leadsTo} className="mt-2 flex flex-wrap gap-1.5">
        {edges.map((e, k) => (
          <li key={k} className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs text-mist/75">
            {e.label && <span className="font-medium text-ice">{e.label}</span>}
            <ArrowRight aria-hidden className="size-3 shrink-0 text-ice rtl:rotate-180" />
            {byId.get(e.to)?.label}
          </li>
        ))}
      </ul>
    );

  if (actors.length > 0) {
    return (
      <div aria-label={title} className="flex flex-col gap-8">
        {actors.map((a) => (
          <motion.section key={a.id} {...appear(0)} className="flex flex-col gap-3">
            <p className="flex items-center gap-2 text-lg font-bold text-mist">
              <User aria-hidden className="size-5 text-ice" />
              {a.label}
            </p>
            <ul className="flex flex-col gap-2 border-s border-line ps-4">
              {out(a.id).map((e, k) => {
                const n = byId.get(e.to)!;
                return (
                  <motion.li key={e.to} {...appear(k)} className="rounded-2xl border border-line bg-ink-3 px-4 py-3 text-mist/90">
                    {n.label}
                    {chips(out(n.id))}
                  </motion.li>
                );
              })}
            </ul>
          </motion.section>
        ))}
      </div>
    );
  }

  // Layered diagrams: one compact block per layer, each part with the parts it calls.
  const layers = diagram.groups ?? [];
  if (layers.length > 1) {
    return (
      <div aria-label={title} className="flex flex-col gap-6">
        {layers.map((g, k) => (
          <motion.section key={k} {...appear(0)} className="flex flex-col gap-2.5">
            <p className="text-xs uppercase tracking-widest text-mist/55">{g.label}</p>
            <ul className="grid grid-cols-2 gap-2">
              {diagram.nodes
                .filter((n) => n.y >= g.y && n.y < g.y + g.h)
                .map((n, i) => (
                  <motion.li
                    key={n.id}
                    {...appear(i)}
                    className={`rounded-xl border bg-ink-3 px-3 py-2.5 ${n.kind === "admin" ? "border-dashed border-ice/40" : "border-line"}`}
                  >
                    <span className="flex items-center gap-1.5 text-sm font-medium leading-tight text-mist">
                      {n.kind === "admin" && <Shield aria-hidden className="size-3.5 shrink-0 text-ice/80" />}
                      {n.kind === "db" && <Database aria-hidden className="size-3.5 shrink-0 text-ice" />}
                      {n.label}
                    </span>
                    {out(n.id).length > 0 && (
                      <span className="mt-1.5 flex items-start gap-1 text-xs leading-snug text-mist/60">
                        <ArrowRight aria-hidden className="mt-0.5 size-3 shrink-0 text-ice rtl:rotate-180" />
                        <span className="sr-only">{leadsTo}: </span>
                        {out(n.id)
                          .map((e) => byId.get(e.to)?.label)
                          .join(" · ")}
                      </span>
                    )}
                  </motion.li>
                ))}
            </ul>
          </motion.section>
        ))}
      </div>
    );
  }

  return (
    <ol aria-label={title} className="flex flex-col">
      {diagram.nodes.map((n, i) => {
        const next = diagram.nodes[i + 1];
        const toNext = next && out(n.id).find((e) => e.to === next.id);
        const others = out(n.id).filter((e) => e !== toNext);
        return (
          <motion.li key={n.id} {...appear(i)} className="flex flex-col items-start">
            <div className={`w-full rounded-2xl border bg-ink-3 px-4 py-2.5 ${n.kind === "admin" ? "border-dashed border-ice/40" : "border-line"}`}>
              <span className="flex items-center gap-2 font-medium text-mist">
                {n.kind === "admin" && <Shield aria-hidden className="size-4 shrink-0 text-ice/80" />}
                {n.label}
              </span>
              {chips(others)}
            </div>
            {next && (
              <span aria-hidden className={`ms-6 flex h-5 items-center gap-2 border-s ${toNext ? "border-steel" : "border-transparent"}`}>
                {toNext?.label && <span className="ms-2 text-xs font-medium text-ice">{toNext.label}</span>}
              </span>
            )}
          </motion.li>
        );
      })}
    </ol>
  );
}
