"use client";

import { useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";

/**
 * Sticky header wrapper. Transparent over the top of the page; once the visitor scrolls it gains a
 * solid backdrop so navigation (and Contact) stay reachable on long phone pages. No backdrop blur:
 * repainting a blurred strip on every scroll frame is what made scrolling stutter.
 */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));
  return (
    <header
      data-scrolled={scrolled}
      className="sticky top-0 z-40 border-b border-transparent transition-[background-color,border-color] duration-300 data-[scrolled=true]:border-line data-[scrolled=true]:bg-ink/[0.97]"
    >
      {children}
    </header>
  );
}
