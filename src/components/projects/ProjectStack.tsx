"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useMediaQuery, useReduceMotion } from "@/components/ui/motion";

/**
 * Sticky stacking cards: each card pins near the top and shrinks slightly as the next one
 * slides over it. Cards are server-rendered and passed in as children.
 */
export function ProjectStack({ cards }: { cards: React.ReactNode[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReduceMotion();
  const wide = useMediaQuery("(min-width: 768px)");
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Phones (and reduced motion) get a plain list: the sticky stack needs screen height phones lack.
  if (reduce || !wide)
    return (
      <div ref={ref} className="flex flex-col gap-6 md:gap-8">
        {cards}
      </div>
    );

  return (
    <div ref={ref}>
      {cards.map((card, i) => (
        <StackItem key={i} index={i} total={cards.length} progress={scrollYProgress}>
          {card}
        </StackItem>
      ))}
    </div>
  );
}

function StackItem({
  children,
  index,
  total,
  progress,
}: {
  children: React.ReactNode;
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const target = 1 - (total - 1 - index) * 0.04;
  const scale = useTransform(progress, [index / total, 1], [1, target]);
  return (
    <div className="sticky top-20 flex h-[88dvh] min-h-[560px] items-start md:top-24">
      <motion.div style={{ scale, top: index * 28 }} className="relative w-full origin-top">
        {children}
      </motion.div>
    </div>
  );
}
