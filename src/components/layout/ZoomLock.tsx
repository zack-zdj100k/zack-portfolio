"use client";

import { useEffect } from "react";

const ZOOM_KEYS = new Set(["+", "=", "-", "_", "0"]);

/**
 * The owner wants the layout fixed at 100% on every device. The viewport meta stops most mobile
 * zoom; this covers what browsers ignore it for: iOS pinch gestures, two-finger moves, and on
 * desktop Ctrl/Cmd + wheel, trackpad pinch and Ctrl/Cmd + / - / 0. Zoom from the browser menu
 * can't be blocked by any site.
 */
export function ZoomLock() {
  useEffect(() => {
    const stop = (e: Event) => e.preventDefault();
    const wheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };
    const keys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ZOOM_KEYS.has(e.key)) e.preventDefault();
    };
    const touches = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    const opts = { passive: false } as const;
    document.addEventListener("gesturestart", stop, opts);
    document.addEventListener("gesturechange", stop, opts);
    document.addEventListener("touchmove", touches, opts);
    window.addEventListener("wheel", wheel, opts);
    window.addEventListener("keydown", keys);
    return () => {
      document.removeEventListener("gesturestart", stop);
      document.removeEventListener("gesturechange", stop);
      document.removeEventListener("touchmove", touches);
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", keys);
    };
  }, []);
  return null;
}
