"use client";

import { useSyncExternalStore } from "react";
import { ArrowUp, Volume2, VolumeX } from "lucide-react";
import { onSoundChange, setSoundOn, soundOn } from "@/lib/sfx";

const chip =
  "inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-mist/75 transition-colors hover:border-ice/60 hover:text-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ice";

export function BackToTop({ label }: { label: string }) {
  const top = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    // Keyboard users continue from the header, not from the footer they left.
    document.querySelector<HTMLElement>("header a, header button")?.focus({ preventScroll: true });
  };
  return (
    <button type="button" onClick={top} className={`${chip} group`}>
      <ArrowUp aria-hidden className="size-4 transition-transform group-hover:-translate-y-0.5" strokeWidth={1.75} />
      {label}
    </button>
  );
}

export function SoundToggle({ label }: { label: string }) {
  const on = useSyncExternalStore(onSoundChange, soundOn, () => true);
  const Icon = on ? Volume2 : VolumeX;
  return (
    <button type="button" aria-pressed={on} onClick={() => setSoundOn(!on)} className={chip}>
      <Icon aria-hidden className="size-4" strokeWidth={1.75} />
      {label}
    </button>
  );
}
