"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { AppWindow, Globe, Monitor } from "lucide-react";
import { useMediaQuery, useReduceMotion } from "@/components/ui/motion";

type Service = { id: string; category: "WEBSITE" | "APP" | "SOFTWARE"; t?: { name: string; description: string }; examples: string[] };

const ICONS = { WEBSITE: Globe, APP: AppWindow, SOFTWARE: Monitor };
// Three gradients from the site palette (steel, slate-blue, ink).
const THEMES = [
  "from-[#4b535d] via-[#2b3037] to-[#15171a]",
  "from-[#4e6070] via-[#2c3844] to-[#14181c]",
  "from-[#383c42] via-[#202327] to-[#0f1011]",
];

/** 3D tilt cards (owner's chosen design): they lean toward the cursor with a moving sheen. */
export function ServiceCards({ services, showExamples = false }: { services: Service[]; showExamples?: boolean }) {
  return (
    <ul className="grid gap-6 [perspective:1500px] md:grid-cols-3">
      {services.map((s, i) => (
        <motion.li
          key={s.id}
          initial={{ opacity: 0, y: 40, rotateX: -12 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ type: "spring", stiffness: 100, damping: 14, delay: i * 0.08 }}
          style={{ transformStyle: "preserve-3d" }}
          className="h-full"
        >
          <Card3D service={s} theme={THEMES[i % THEMES.length]} showExamples={showExamples} />
        </motion.li>
      ))}
    </ul>
  );
}

function Card3D({ service, theme, showExamples }: { service: Service; theme: string; showExamples: boolean }) {
  const reduce = useReduceMotion();
  const fine = useMediaQuery("(pointer: fine)");
  const tilt = fine && !reduce;
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(mx, { stiffness: 400, damping: 35, mass: 0.8 });
  const rotateX = useSpring(my, { stiffness: 400, damping: 35, mass: 0.8 });
  const lift = useSpring(0, { stiffness: 400, damping: 35 });
  const sheenAngle = useTransform(mx, (v) => v + 135);
  const sheenOpacity = useSpring(0, { stiffness: 200, damping: 30 });
  const sheen = useMotionTemplate`linear-gradient(${sheenAngle}deg, transparent 40%, rgba(255,255,255,0.22) 50%, transparent 60%)`;
  const Icon = ICONS[service.category];

  return (
    <motion.article
      onMouseMove={(e) => {
        if (!tilt) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width - 0.5) * 22);
        my.set(((e.clientY - r.top) / r.height - 0.5) * -22);
      }}
      onMouseEnter={() => {
        if (!tilt) return;
        lift.set(30);
        sheenOpacity.set(1);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
        lift.set(0);
        sheenOpacity.set(0);
      }}
      style={tilt ? { rotateX, rotateY, z: lift, transformStyle: "preserve-3d" } : undefined}
      className={`group relative flex h-full min-h-80 flex-col overflow-hidden rounded-2xl bg-gradient-to-br text-mist shadow-xl ring-1 ring-white/15 transition-shadow duration-500 hover:shadow-2xl ${theme}`}
    >
      {/* Dot pattern and rotating squares */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-25">
        <div className="absolute -end-4 -top-4 size-32 bg-[radial-gradient(circle,rgb(255_255_255/0.35)_1px,transparent_1.5px)] bg-[length:20px_20px]" />
        <svg viewBox="0 0 100 100" className="absolute -bottom-4 -start-4 size-24 text-white/40 transition-transform duration-700 group-hover:rotate-180">
          <rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="1" rx="8" />
          <rect x="35" y="35" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="0.5" rx="4" />
        </svg>
      </div>
      {/* Moving sheen */}
      <motion.div aria-hidden className="pointer-events-none absolute -inset-full" style={{ background: sheen, opacity: sheenOpacity }} />
      {/* Edge highlight */}
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,rgb(255_255_255/0.14)_0%,transparent_30%,transparent_70%,rgb(255_255_255/0.08)_100%)]" />

      <div className="relative z-10 flex h-full flex-1 flex-col justify-between gap-10 p-7" style={{ transform: "translateZ(20px)" }}>
        <Icon aria-hidden className="size-9 opacity-90 drop-shadow-lg transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-6" strokeWidth={1.5} />
        <div className="flex flex-col gap-3">
          <h3 className="text-2xl font-bold uppercase leading-tight tracking-tight">{service.t?.name}</h3>
          <p className="leading-relaxed text-mist/85">{service.t?.description}</p>
          {showExamples && service.examples.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {service.examples.map((e) => (
                <li key={e} className="rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-xs text-mist/90">
                  {e}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.article>
  );
}
