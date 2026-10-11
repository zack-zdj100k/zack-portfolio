"use client";

import { useCallback, useRef, useState, type ComponentType } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useLocale } from "next-intl";
import { useMediaQuery, useReduceMotion } from "@/components/ui/motion";
import { rtlLocales, type Locale } from "@/lib/i18n/locales";
import { Link } from "@/i18n/navigation";
import { Magnetic } from "@/components/ui/Magnetic";
import { resolveMode, type HeroAssets, type HeroMode, type RendererProps } from "./types";

// Renderers are code-split: three.js only downloads after the page (and the static image) is up.
const renderers: Record<HeroMode, ComponentType<RendererProps>> = {
  DEPTH: dynamic(() => import("./DepthHead"), { ssr: false }),
  SEQUENCE: dynamic(() => import("./SequenceHead"), { ssr: false }),
  MODEL: dynamic(() => import("./ModelHead"), { ssr: false }),
};

type Copy = {
  greeting: string;
  name: string;
  title: string;
  ctaPrimary: string;
  ctaSecondary: string;
  reveal: string[];
  imageAlt: string;
};

export function HeroStage({ mode, assets, copy }: { mode: HeroMode; assets: HeroAssets; copy: Copy }) {
  const reduce = useReduceMotion();
  const section = useRef<HTMLElement>(null);
  const finePointer = useMediaQuery("(pointer: fine)");
  const wide = useMediaQuery("(min-width: 768px)");
  const rtl = rtlLocales.has(useLocale() as Locale);
  const [rendererState, setRendererState] = useState<"loading" | "ready" | "failed">("loading");

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 32, mass: 0.6 });

  const active = reduce ? null : resolveMode(mode, assets);
  const Renderer = active ? renderers[active] : null;
  // Option B (the 360° video frames) uses its own first frame as the static image, so the swap is seamless.
  const portrait = active === "SEQUENCE";
  const still = portrait ? { src: assets.frames[assets.startFrame], ...assets.frameSize } : assets.image;

  // Option C: the model's face is softer than the artwork, so the sharp artwork holds the stage at rest
  // and hands over to the 3D model during the first few percent of scroll.
  const handover = active === "MODEL" && rendererState === "ready";
  const stillOpacity = useTransform(progress, [0.005, 0.05], [1, 0]);
  const modelOpacity = useTransform(progress, [0.005, 0.05], [0, 1]);

  const onReady = useCallback(() => setRendererState("ready"), []);
  const onFail = useCallback(() => setRendererState("failed"), []);

  return (
    <section
      ref={section}
      aria-labelledby="hero-title"
      // Pinned scroll length. Reduced motion: no pin, a normal full-height section.
      // Pulled up under the header so the stage fills the whole first screen.
      className={`relative -mt-16 md:-mt-20 ${reduce ? "" : "h-[190dvh] md:h-[230dvh]"}`}
    >
      <div className="sticky top-0 flex h-dvh min-h-[560px] flex-col overflow-hidden pt-16 md:pt-20">
        <HeroName name={copy.name} greeting={copy.greeting} progress={progress} reduce={!!reduce} />

        {/* The head: centred, bottom-anchored, in front of the name. */}
        <HeroHead progress={progress} reduce={!!reduce} wide={wide} rtl={rtl} portrait={portrait}>
          <motion.div className="absolute inset-0" style={handover ? { opacity: stillOpacity } : undefined}>
            <Image
              src={still.src}
              width={still.width}
              height={still.height}
              alt={copy.imageAlt}
              priority
              sizes="(min-width: 1024px) 560px, (min-width: 640px) 420px, 82vw"
              className={`absolute inset-0 size-full object-contain object-bottom transition-opacity duration-700 ${
                rendererState === "ready" && !handover ? "opacity-0" : "opacity-100"
              }`}
            />
          </motion.div>
          {Renderer && rendererState !== "failed" && (
            <motion.div
              style={handover ? { opacity: modelOpacity } : undefined}
              className={`absolute inset-0 ${handover ? "" : `transition-opacity duration-700 ${rendererState === "ready" ? "opacity-100" : "opacity-0"}`}`}
            >
              <Renderer assets={assets} progress={progress} onReady={onReady} onFail={onFail} interactive={finePointer} />
            </motion.div>
          )}
        </HeroHead>

        <HeroReveal words={copy.reveal} progress={progress} reduce={!!reduce} />

        <HeroFooter copy={copy} progress={progress} reduce={!!reduce} />
      </div>
    </section>
  );
}

function HeroName({ name, greeting, progress, reduce }: { name: string; greeting: string; progress: MotionValue<number>; reduce: boolean }) {
  // Letters drift apart and the word grows slightly, like a camera pushing through it.
  const spread = useTransform(progress, [0, 1], [0, 1]);
  const scale = useTransform(progress, [0, 1], [1, 1.12]);
  const opacity = useTransform(progress, [0, 0.55, 1], [1, 0.55, 0.18]);
  const greetY = useTransform(progress, [0, 0.25], [0, -30]);
  const greetOpacity = useTransform(progress, [0, 0.2], [1, 0]);
  const letters = [...name];
  const mid = (letters.length - 1) / 2;

  return (
    <div className="relative z-0 mt-2 select-none px-2 md:mt-0">
      <motion.p
        style={reduce ? undefined : { y: greetY, opacity: greetOpacity }}
        className="container-page text-[clamp(1rem,2.2vw,1.9rem)] font-light uppercase tracking-[0.18em] text-mist/80"
      >
        {greeting}
      </motion.p>
      <motion.h1
        id="hero-title"
        aria-label={`${greeting} ${name}`}
        style={reduce ? undefined : { scale, opacity }}
        // dir=ltr: the name is a Latin wordmark in every language.
        dir="ltr"
        className="flex w-full justify-center whitespace-nowrap font-black uppercase leading-[0.8] tracking-[-0.04em] text-[34vw] sm:text-[clamp(5.5rem,29vw,30rem)]"
      >
        {letters.map((ch, i) => (
          <Letter key={i} ch={ch} offset={i - mid} spread={spread} reduce={reduce} />
        ))}
      </motion.h1>
    </div>
  );
}

function Letter({ ch, offset, spread, reduce }: { ch: string; offset: number; spread: MotionValue<number>; reduce: boolean }) {
  const x = useTransform(spread, (s) => `${offset * s * 9}vw`);
  return (
    <motion.span aria-hidden className="display-gradient inline-block" style={reduce ? undefined : { x }}>
      {ch}
    </motion.span>
  );
}

function HeroHead({
  progress,
  reduce,
  wide,
  rtl,
  portrait,
  children,
}: {
  progress: MotionValue<number>;
  reduce: boolean;
  wide: boolean;
  rtl: boolean;
  /** Tall frames (option B video) need a portrait stage instead of the near-square artwork box. */
  portrait: boolean;
  children: React.ReactNode;
}) {
  // Desktop: the head slides toward the end side to make room for the words (mirrored in RTL).
  // Phones: it lifts up so the words fit underneath.
  const x = useTransform(progress, [0.15, 0.55], ["0vw", wide ? (rtl ? "-17vw" : "17vw") : "0vw"]);
  const y = useTransform(progress, [0, 0.5, 1], wide ? ["0%", "-4%", "-12%"] : ["0%", "-8%", "-14%"]);
  const scale = useTransform(progress, [0, 0.5, 1], wide ? [1, 1.06, 0.96] : [1, 0.96, 0.9]);
  return (
    <motion.div
      style={reduce ? undefined : { x, y, scale }}
      className={`pointer-events-none absolute bottom-[clamp(190px,30dvh,280px)] left-1/2 z-10 -translate-x-1/2 sm:bottom-[clamp(150px,20dvh,230px)] lg:bottom-0 ${
        portrait
          ? "aspect-[560/926] w-[min(60vw,30dvh)] sm:w-[min(48vw,34dvh)] lg:w-[min(36vw,47dvh)] xl:w-[min(34vw,52dvh)]"
          : "aspect-[1.06] w-[min(80vw,40dvh)] sm:w-[min(60vw,46dvh)] lg:w-[min(38vw,62dvh)] xl:w-[min(46vw,74dvh)]"
      }`}
    >
      {children}
    </motion.div>
  );
}

function HeroReveal({ words, progress, reduce }: { words: string[]; progress: MotionValue<number>; reduce: boolean }) {
  if (reduce || words.length === 0) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[9%] z-20 md:bottom-auto md:top-1/2 md:-translate-y-1/3">
      <div className="container-page flex flex-col items-start gap-1 md:max-w-[1400px]">
        {words.map((w, i) => (
          <RevealWord key={w} word={w} index={i} count={words.length} progress={progress} />
        ))}
      </div>
    </div>
  );
}

function RevealWord({ word, index, count, progress }: { word: string; index: number; count: number; progress: MotionValue<number> }) {
  // Words arrive one after another, then fade away slowly (and in the same order) as the visitor
  // keeps scrolling: drifting up and softening instead of vanishing at once.
  const start = 0.22 + (index / count) * 0.24;
  const leave = 0.58 + (index / count) * 0.12;
  const opacity = useTransform(progress, [start, start + 0.1, leave, 1], [0, 1, 1, 0]);
  const y = useTransform(progress, [start, start + 0.1, leave, 1], [40, 0, 0, -36]);
  const filter = useTransform(progress, [leave, 1], ["blur(0px)", "blur(6px)"]);
  return (
    <motion.span
      style={{ opacity, y, filter }}
      className="max-w-full text-[clamp(2.1rem,9vw,3.4rem)] font-bold uppercase leading-[0.95] tracking-tight text-mist [text-shadow:0_4px_30px_rgb(12_12_12/0.8)] md:max-w-[44vw] md:text-[clamp(2.5rem,4.6vw,5.2rem)]"
    >
      {word}
    </motion.span>
  );
}

function HeroFooter({ copy, progress, reduce }: { copy: Copy; progress: MotionValue<number>; reduce: boolean }) {
  const opacity = useTransform(progress, [0, 0.18], [1, 0]);
  const y = useTransform(progress, [0, 0.18], [0, 24]);
  return (
    <motion.div style={reduce ? undefined : { opacity, y }} className="relative z-20 mt-auto pb-7 sm:pb-8 md:pb-10">
      <div className="container-page flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-[17rem] text-[clamp(0.95rem,1.35vw,1.3rem)] font-light uppercase leading-snug tracking-wide text-mist [text-shadow:0_2px_16px_rgb(12_12_12/0.9)] md:max-w-[19rem]">
          {copy.title}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Magnetic>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full bg-mist px-7 py-3.5 text-sm font-medium uppercase tracking-widest text-ink shadow-[0_10px_40px_rgb(187_204_215/0.25)] transition-transform active:scale-[0.98] md:px-9 md:py-4 md:text-base"
            >
              {copy.ctaPrimary}
            </Link>
          </Magnetic>
          <Link
            href="/projects"
            className="inline-flex items-center rounded-full border-2 border-mist/80 bg-ink/40 px-7 py-3 text-sm font-medium uppercase tracking-widest text-mist backdrop-blur-sm transition-colors hover:bg-mist/10 active:scale-[0.98] md:px-9 md:py-3.5 md:text-base"
          >
            {copy.ctaSecondary}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
