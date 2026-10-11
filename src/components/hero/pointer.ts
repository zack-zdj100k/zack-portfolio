/** Pointer position over the window, -1..1 on each axis, eased. Returns a reader and a cleanup. */
export function trackPointer(enabled: boolean) {
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    target.x = (e.clientX / window.innerWidth) * 2 - 1;
    target.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  const onLeave = () => {
    target.x = 0;
    target.y = 0;
  };
  if (enabled) {
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
  }
  return {
    read() {
      current.x += (target.x - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;
      return current;
    },
    dispose() {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    },
  };
}

/** Runs `frame` on requestAnimationFrame only while `el` is on screen. */
export function visibleLoop(el: Element, frame: (time: number) => void) {
  let raf = 0;
  let running = false;
  const tick = (time: number) => {
    frame(time);
    raf = requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !running) {
      running = true;
      raf = requestAnimationFrame(tick);
    } else if (!entry.isIntersecting && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  });
  io.observe(el);
  return () => {
    io.disconnect();
    cancelAnimationFrame(raf);
  };
}
