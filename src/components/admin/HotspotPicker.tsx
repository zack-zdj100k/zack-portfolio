"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Admin preview of a dashboard screen with its numbered markers. Clicking the screenshot puts a
 * "new" pin there and fills the X / Y fields of the "Add a marker" form below it.
 */
export function HotspotPicker({
  imageId,
  src,
  width,
  height,
  hotspots,
}: {
  imageId: string;
  src: string;
  width: number;
  height: number;
  hotspots: { id: string; x: number; y: number }[];
}) {
  const [pin, setPin] = useState<{ x: number; y: number } | null>(null);
  const place = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - r.left) / r.width) * 1000) / 10;
    const y = Math.round(((e.clientY - r.top) / r.height) * 1000) / 10;
    setPin({ x, y });
    const fx = document.getElementById(`new-x-${imageId}`) as HTMLInputElement | null;
    const fy = document.getElementById(`new-y-${imageId}`) as HTMLInputElement | null;
    if (fx) fx.value = String(x);
    if (fy) fy.value = String(y);
  };
  return (
    <div>
      {/* Mouse aid only: the X / Y fields below do the same job from the keyboard. */}
      <div onClick={place} className="relative cursor-crosshair overflow-hidden rounded-xl border border-line bg-ink-3" aria-hidden>
        <Image src={src} width={width} height={height} alt="" sizes="(min-width: 1280px) 900px, 100vw" className="block h-auto w-full" />
        {hotspots.map((h, i) => (
          <span
            key={h.id}
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
            className="absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-mist ring-2 ring-mist/80"
          >
            {i + 1}
          </span>
        ))}
        {pin && (
          <span
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            className="absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ice text-[11px] font-bold text-ink ring-4 ring-ice/40"
          >
            +
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-mist/60">Click the screenshot to place a new marker, or type its position below.</p>
    </div>
  );
}
