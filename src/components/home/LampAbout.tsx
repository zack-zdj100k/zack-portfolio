"use client";

import { useRef, useState } from "react";
import { motion, useAnimationControls } from "motion/react";
import { useReduceMotion } from "@/components/ui/motion";

// Deterministic "random" fireflies (same on server and client, so no hydration mismatch).
const FIREFLIES = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 37) % 100,
  top: (i * 53) % 100,
  size: 3 + (i % 4),
  duration: 7 + (i % 5) * 1.6,
  delay: (i % 7) * 0.5,
  dx: ((i * 29) % 60) - 30,
  dy: ((i * 17) % 60) - 30,
}));

/**
 * About section with a pull-cord lamp. Off: the content sits in the dark (still in the page for
 * screen readers and search engines). On: a cone of light reveals it, with a few slow fireflies.
 * The cord is a real toggle button (click, tap, keyboard), and can also be pulled down.
 */
export function LampAbout({
  labels,
  children,
}: {
  labels: { on: string; off: string; hint: string };
  children: React.ReactNode;
}) {
  const [on, setOn] = useState(false);
  const reduce = useReduceMotion();
  const cord = useAnimationControls();
  // A pull (drag) toggles on release; the click that follows the drag must not toggle again.
  const dragged = useRef(false);

  async function toggle() {
    setOn((v) => !v);
    if (!reduce) {
      await cord.start({ y: 18, transition: { duration: 0.12 } });
      await cord.start({ y: 0, transition: { type: "spring", stiffness: 500, damping: 9 } });
    }
  }

  return (
    <div className="relative grid gap-10 md:grid-cols-[minmax(220px,0.7fr)_1.3fr] md:gap-6">
      {/* The lamp */}
      <div className="relative z-10 flex flex-col items-center md:items-start md:ps-[8%]">
        <div className="relative flex flex-col items-center">
          {/* Shade */}
          <div
            aria-hidden
            className={`relative z-10 h-16 w-40 rounded-t-[999px] border transition-colors duration-500 sm:h-20 sm:w-48 ${
              on ? "border-ice/50 bg-gradient-to-b from-[#3a4652] to-[#1f262d]" : "border-line bg-gradient-to-b from-[#24282e] to-[#16191c]"
            }`}
          >
            <span
              className={`absolute -bottom-2 left-1/2 h-4 w-14 -translate-x-1/2 rounded-full transition-all duration-500 ${
                on ? "bg-mist shadow-[0_0_40px_14px_rgb(215_226_234/0.55)]" : "bg-[#2a2d32]"
              }`}
            />
          </div>
          {/* Cord */}
          <motion.button
            type="button"
            animate={cord}
            onClick={() => {
              if (dragged.current) {
                dragged.current = false;
                return;
              }
              void toggle();
            }}
            onDragStart={() => {
              dragged.current = true;
            }}
            drag={reduce ? false : "y"}
            dragConstraints={{ top: 0, bottom: 40 }}
            dragElastic={0.3}
            dragSnapToOrigin
            onDragEnd={(_, info) => {
              if (info.offset.y > 18) void toggle();
              // Some browsers fire no click after a drag; clear the flag once the click would have run.
              window.setTimeout(() => {
                dragged.current = false;
              }, 60);
            }}
            aria-pressed={on}
            aria-label={on ? labels.off : labels.on}
            className="absolute end-6 top-14 z-20 flex cursor-pointer touch-none flex-col items-center sm:top-[4.5rem]"
          >
            <span aria-hidden className="h-20 w-px bg-mist/50" />
            <span aria-hidden className={`size-4 rounded-full border transition-colors ${on ? "border-mist bg-mist" : "border-ice/60 bg-ink-3"}`} />
          </motion.button>
          {/* Pole and base */}
          <span aria-hidden className="h-44 w-1.5 bg-gradient-to-b from-[#3a4048] to-[#24282e] sm:h-56" />
          <span aria-hidden className="h-3 w-28 rounded-full bg-gradient-to-b from-[#3a4048] to-[#16191c]" />
        </div>
        <p className={`mt-5 text-sm uppercase tracking-widest transition-opacity duration-500 ${on ? "opacity-0" : "text-ice opacity-100"}`}>
          {labels.hint}
        </p>

        {/* Light cone, from the shade toward the content */}
        <div
          aria-hidden
          className={`pointer-events-none absolute left-1/2 top-16 z-0 h-[150%] w-[260%] -translate-x-[12%] transition-opacity duration-700 max-md:w-[120%] max-md:-translate-x-1/2 sm:top-20 md:left-[8%] md:translate-x-0 rtl:md:left-auto rtl:md:right-[8%] rtl:md:-scale-x-100 ${
            on ? "opacity-100" : "opacity-0"
          }`}
          style={{
            clipPath: "polygon(4% 0%, 10% 0%, 100% 85%, 100% 100%, 0% 100%)",
            background: "linear-gradient(170deg, rgb(215 226 234 / 0.22) 0%, rgb(187 204 215 / 0.08) 45%, transparent 80%)",
          }}
        />
      </div>

      {/* Content: dark until the lamp is on */}
      <div className="relative">
        {on && !reduce && (
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {FIREFLIES.map((f, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full bg-mist shadow-[0_0_10px_2px_rgb(215_226_234/0.6)]"
                style={{ left: `${f.left}%`, top: `${f.top}%`, width: f.size, height: f.size }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.9, 0.2, 0.8, 0], x: [0, f.dx, -f.dx / 2, f.dx / 3, 0], y: [0, f.dy, f.dy / 2, -f.dy, 0] }}
                transition={{ duration: f.duration, delay: f.delay, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </div>
        )}
        <div
          className={`relative transition-[opacity,filter] duration-700 ${on ? "opacity-100 [filter:none]" : "opacity-[0.07] [filter:blur(1.5px)]"}`}
          aria-live="off"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
