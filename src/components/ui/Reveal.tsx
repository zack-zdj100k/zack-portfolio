"use client";

import { motion } from "motion/react";

/** Fades/slides content in once when it enters the viewport. Under reduced motion, MotionProvider
 * drops the slide and keeps only the fade. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  x = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  x?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article";
}) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px", amount: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Tag>
  );
}
