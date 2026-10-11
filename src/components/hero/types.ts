import type { MotionValue } from "motion/react";

export type HeroMode = "DEPTH" | "SEQUENCE" | "MODEL";

export type HeroAssets = {
  image: { src: string; width: number; height: number };
  depthMap: string | null;
  frames: string[];
  /** Pixel size of the frames (all frames share it). */
  frameSize: { width: number; height: number };
  startFrame: number;
  model: string | null;
};

/** Props every hero renderer gets. `progress` is the smoothed 0..1 scroll progress of the pinned hero. */
export type RendererProps = {
  assets: HeroAssets;
  progress: MotionValue<number>;
  /** Called once the renderer has drawn its first frame, so the static image can fade out. */
  onReady: () => void;
  /** Called when the renderer can't run (no WebGL, missing file); the static image stays. */
  onFail: () => void;
  /** Pointer tilt enabled (fine pointer, no reduced motion). */
  interactive: boolean;
};

/** Resolve which renderer can actually run, falling back C → B → A when assets are missing. */
export function resolveMode(mode: HeroMode, assets: HeroAssets): HeroMode | null {
  if (mode === "MODEL" && assets.model) return "MODEL";
  if ((mode === "MODEL" || mode === "SEQUENCE") && assets.frames.length > 1) return "SEQUENCE";
  if (assets.depthMap) return "DEPTH";
  return null;
}
