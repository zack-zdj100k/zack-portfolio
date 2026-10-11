"use client";

import { useSyncExternalStore } from "react";
import { MotionConfig } from "motion/react";

/**
 * Live CSS media query. The server snapshot is `false`, so the first client render matches the
 * server HTML and the real value applies right after hydration (no mismatch warnings).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** prefers-reduced-motion, hydration-safe. */
export function useReduceMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** true only in the browser, after hydration. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/** Site-wide: under reduced motion, Motion skips transform animations (opacity fades remain). */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
