"use client";

// Option B: frames of a 360° turn, scrubbed by scroll. Neighbouring frames are cross-faded so the
// turn reads as continuous rotation rather than a slideshow.
import { useEffect, useRef } from "react";
import type { RendererProps } from "./types";
import { trackPointer, visibleLoop } from "./pointer";

function load(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Coarse-to-fine order (0, 8, 16… then 4, 12… then odd frames) so scrubbing works before everything has loaded. */
function loadOrder(count: number, start: number) {
  const order: number[] = [start];
  for (const stride of [8, 4, 2, 1]) {
    for (let i = 0; i < count; i += stride) if (!order.includes(i)) order.push(i);
  }
  return order;
}

export default function SequenceHead({ assets, progress, onReady, onFail, interactive }: RendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || assets.frames.length < 2) return onFail();

    const frames: (HTMLImageElement | null)[] = assets.frames.map(() => null);
    const last = assets.frames.length - 1;
    const start = Math.min(Math.max(assets.startFrame, 0), last);
    const pointer = trackPointer(interactive);
    let disposed = false;
    let ready = false;
    let stopLoop = () => {};

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const draw = (img: HTMLImageElement, alpha: number) => {
      // "contain" fit, bottom-anchored like the static image.
      const s = Math.min(canvas.width / img.width, canvas.height / img.height);
      const w = img.width * s;
      const h = img.height * s;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (canvas.width - w) / 2, canvas.height - h, w, h);
    };
    const nearestLoaded = (i: number, dir: 1 | -1) => {
      let j = i;
      while (j >= 0 && j <= last && !frames[j]) j += dir;
      return j >= 0 && j <= last ? j : -1;
    };

    (async () => {
      try {
        for (const i of loadOrder(assets.frames.length, start)) {
          const img = await load(assets.frames[i]);
          if (disposed) return;
          frames[i] = img;
          if (i !== start) continue;
          stopLoop = visibleLoop(canvas, () => {
            // The whole pinned hero turns the head once: first frame at the top, last at the end.
            const m = pointer.read();
            const pos = Math.min(Math.max(start + (last - start) * progress.get() + m.x * 1.5, 0), last);
            let a = nearestLoaded(Math.floor(pos), -1);
            if (a < 0) a = nearestLoaded(Math.floor(pos), 1);
            const b = nearestLoaded(Math.min(Math.floor(pos) + 1, last), 1);
            const frac = pos - Math.floor(pos);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (a >= 0) draw(frames[a]!, 1);
            if (b >= 0 && b !== a && frac > 0.01) draw(frames[b]!, frac);
            ctx.globalAlpha = 1;
            if (!ready) {
              ready = true;
              onReady();
            }
          });
        }
      } catch {
        if (!disposed && !ready) onFail();
      }
    })();

    return () => {
      disposed = true;
      stopLoop();
      ro.disconnect();
      pointer.dispose();
    };
  }, [assets, progress, onReady, onFail, interactive]);

  return <canvas ref={canvasRef} aria-hidden className="block size-full" />;
}
