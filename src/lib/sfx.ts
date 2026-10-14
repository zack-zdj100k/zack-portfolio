"use client";

// Small synthesized sounds (Web Audio, no files). Browsers only allow audio after the visitor's
// first click or tap, so sounds start from then on. Visitors can switch them off (saved locally).

const KEY = "zack-sound";
let ctx: AudioContext | null = null;
const listeners = new Set<(on: boolean) => void>();

export function soundOn(): boolean {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {}
  listeners.forEach((l) => l(on));
}

export function onSoundChange(l: (on: boolean) => void) {
  listeners.add(l);
  return () => void listeners.delete(l);
}

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

if (typeof window !== "undefined") {
  const unlock = () => {
    const c = context();
    if (c && c.state !== "running") void c.resume();
  };
  window.addEventListener("pointerdown", unlock, { capture: true, passive: true });
  window.addEventListener("keydown", unlock, { capture: true, passive: true });
}

/** Runs fn once audio may play; sounds that would only queue up silently are skipped. */
function play(fn: (c: AudioContext) => void) {
  if (!soundOn() || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = context();
  if (!c) return;
  if (c.state === "running") fn(c);
  else if (navigator.userActivation?.isActive) void c.resume().then(() => fn(c));
}

function noise(c: AudioContext, seconds: number) {
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * seconds), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  return src;
}

/** The lamp cord: a short rope "zip" as it is pulled, then the switch click. */
export function playCord(turningOn: boolean) {
  play((c) => cord(c, turningOn));
}

function cord(c: AudioContext, turningOn: boolean) {
  const t = c.currentTime;

  const rope = noise(c, 0.14);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 2.5;
  bp.frequency.setValueAtTime(1800, t);
  bp.frequency.exponentialRampToValueAtTime(700, t + 0.13);
  const rg = c.createGain();
  rg.gain.setValueAtTime(0.0001, t);
  rg.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
  rg.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
  rope.connect(bp).connect(rg).connect(c.destination);
  rope.start(t);

  const at = t + 0.11;
  const click = noise(c, 0.03);
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = turningOn ? 2500 : 1600;
  const cg = c.createGain();
  cg.gain.setValueAtTime(0.5, at);
  cg.gain.exponentialRampToValueAtTime(0.0001, at + 0.03);
  click.connect(hp).connect(cg).connect(c.destination);
  click.start(at);

  const body = c.createOscillator();
  body.type = "triangle";
  body.frequency.setValueAtTime(turningOn ? 190 : 140, at);
  body.frequency.exponentialRampToValueAtTime(70, at + 0.08);
  const bg = c.createGain();
  bg.gain.setValueAtTime(0.25, at);
  bg.gain.exponentialRampToValueAtTime(0.0001, at + 0.09);
  body.connect(bg).connect(c.destination);
  body.start(at);
  body.stop(at + 0.1);
}

// Pentatonic scale, so any run of tiles sounds musical.
const SCALE = [0, 2, 4, 7, 9];
let lastTick = 0;

/** A soft glassy note for one tile; the pitch follows its position, the colour its family. */
export function playTile(index: number, family = 0) {
  const now = performance.now();
  if (now - lastTick < 45) return;
  lastTick = now;
  play((c) => tile(c, index, family));
}

function tile(c: AudioContext, index: number, family: number) {
  const t = c.currentTime;
  const step = SCALE[index % SCALE.length] + 12 * (Math.floor(index / SCALE.length) % 3);
  const freq = 440 * Math.pow(2, (step - 5) / 12);

  const o = c.createOscillator();
  o.type = family % 2 ? "triangle" : "sine";
  o.frequency.value = freq;
  const o2 = c.createOscillator();
  o2.type = "sine";
  o2.frequency.value = freq * 2.01;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.09, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
  const g2 = c.createGain();
  g2.gain.value = 0.25;
  o.connect(g);
  o2.connect(g2).connect(g);
  g.connect(c.destination);
  o.start(t);
  o2.start(t);
  o.stop(t + 0.34);
  o2.stop(t + 0.34);
}
