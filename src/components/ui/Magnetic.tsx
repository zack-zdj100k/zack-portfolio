"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useMediaQuery, useReduceMotion } from "@/components/ui/motion";

/**
 * Pulls its child gently toward the cursor when the cursor is within `padding` px.
 * Desktop mouse only: off for touch and for reduced motion.
 */
export function Magnetic({ children, padding = 90, strength = 4 }: { children: React.ReactNode; padding?: number; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReduceMotion();
  const enabled = useMediaQuery("(pointer: fine)") && !reduce;
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const near =
        e.clientX > r.left - padding && e.clientX < r.right + padding && e.clientY > r.top - padding && e.clientY < r.bottom + padding;
      x.set(near ? (e.clientX - cx) / strength : 0);
      y.set(near ? (e.clientY - cy) / strength : 0);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, padding, strength, x, y]);

  return (
    <motion.div ref={ref} style={enabled ? { x, y } : undefined} className="inline-block">
      {children}
    </motion.div>
  );
}
