"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { animate, AnimatePresence, motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { Menu, X } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { rtlLocales, type Locale } from "@/lib/i18n/locales";
import { useMediaQuery, useMounted, useReduceMotion } from "@/components/ui/motion";
import { isActive, visibleNav, type NavKey } from "./nav-items";

/** Degrees between two pages on the wheel. */
const STEP = 30;
const SPRING = { type: "spring", stiffness: 280, damping: 32 } as const;

/**
 * Phones and tablets: the menu is a half-circle wheel docked to the middle of the right edge (left
 * in Arabic). The closed state is a small half-disc. Open, the pages sit around the rim; turning the
 * wheel (drag along it, swipe, mouse wheel or arrow keys) brings a page to the pointer and opens it.
 * The wheel stays open, so visitors can keep turning through pages. The pages are ordinary links in
 * a list, so keyboard and screen reader use is unchanged.
 */
export function NavDial({ hidden = [] }: { hidden?: NavKey[] }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const rtl = rtlLocales.has(useLocale() as Locale);
  const s = rtl ? -1 : 1;
  const mounted = useMounted();
  const reduce = useReduceMotion();
  const desktop = useMediaQuery("(min-width: 1024px)");

  const items = visibleNav(hidden);
  const last = items.length - 1;
  const current = Math.max(0, items.findIndex((i) => isActive(pathname, i.href)));

  const [open, setOpen] = useState(false);
  // The desktop header has its own navigation; a wheel left open while resizing closes itself.
  if (desktop && open) setOpen(false);

  const rot = useMotionValue(current);
  const [selected, setSelected] = useState(current);
  useMotionValueEvent(rot, "change", (v) => setSelected(Math.min(Math.max(Math.round(v), 0), last)));

  const hub = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const disc = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; a0: number; r0: number; x0: number; y0: number; active: boolean } | null>(null);
  const suppressClick = useRef(false);
  const busy = useRef(false);

  // Follow the page when it changes from elsewhere (header link, back button), unless mid-gesture
  // or already turning towards it.
  useEffect(() => {
    if (!busy.current && Math.abs(rot.get() - current) > 0.5) rot.set(current);
  }, [current, rot]);

  const soft = (v: number) => (v < 0 ? v * 0.3 : v > last ? last + (v - last) * 0.3 : v);

  const moveTo = (i: number) => {
    const target = Math.min(Math.max(i, 0), last);
    rot.stop();
    if (reduce) rot.set(target);
    else animate(rot, target, SPRING);
    return target;
  };
  const settle = (v: number) => {
    const i = moveTo(Math.round(v));
    busy.current = false;
    if (!isActive(pathname, items[i].href)) router.push(items[i].href);
  };

  // Arrow keys turn the wheel and move focus with it; Enter on the focused page opens it.
  const onArrow = useEffectEvent((e: KeyboardEvent) => {
    const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    const jump = e.key === "Home" ? 0 : e.key === "End" ? last : null;
    if (!step && jump === null) return;
    e.preventDefault();
    const i = moveTo(jump ?? selected + step);
    panel.current?.querySelectorAll<HTMLElement>("[data-dial-item]")[i]?.focus({ preventScroll: true });
  });

  // Scroll lock, Escape, arrows, focus trap and focus return.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>('[aria-current="page"]')?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      onArrow(e);
      if (e.key === "Tab" && panel.current) {
        const focusables = [...panel.current.querySelectorAll<HTMLElement>("a,button")];
        const first = focusables[0];
        const end = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          end.focus();
        } else if (!e.shiftKey && document.activeElement === end) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const button = hub.current;
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      button?.focus({ preventScroll: true });
    };
  }, [open]);

  // A page change can drop keyboard focus to the document; keep it on the wheel while it's open.
  useEffect(() => {
    if (open && !panel.current?.contains(document.activeElement)) {
      panel.current?.querySelector<HTMLElement>('[aria-current="page"]')?.focus({ preventScroll: true });
    }
  }, [open, pathname]);

  // Mouse wheel / trackpad: turn, then settle on the nearest page once the wheel stops.
  const turnBy = useEffectEvent((dy: number) => {
    busy.current = true;
    rot.stop();
    rot.set(soft(rot.get() + dy * 0.008));
  });
  const settleNow = useEffectEvent(() => settle(rot.get()));
  useEffect(() => {
    const el = disc.current;
    if (!open || !el) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      turnBy(e.deltaY);
      clearTimeout(timer);
      timer = setTimeout(settleNow, 180);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      clearTimeout(timer);
    };
  }, [open]);

  const angleAt = (x: number, y: number) => {
    const r = disc.current!.getBoundingClientRect();
    return (Math.atan2(y - (r.top + r.height / 2), x - (r.left + r.width / 2)) * 180) / Math.PI;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    suppressClick.current = false;
    drag.current = { id: e.pointerId, a0: angleAt(e.clientX, e.clientY), r0: rot.get(), x0: e.clientX, y0: e.clientY, active: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.active) {
      if (Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < 6) return;
      // Capture only once it's a real drag, so a tap still reaches the link underneath.
      d.active = true;
      busy.current = true;
      rot.stop();
      disc.current?.setPointerCapture(e.pointerId);
    }
    let delta = angleAt(e.clientX, e.clientY) - d.a0;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    rot.set(soft(d.r0 + (s * delta) / STEP));
  };
  const onPointerEnd = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (d.active) {
      // Swallow only the click that ends this drag.
      suppressClick.current = true;
      setTimeout(() => (suppressClick.current = false), 60);
      settle(rot.get());
    }
  };

  const ticks = useTransform(rot, (v) => `rotate(${s * v * STEP}deg)`);

  if (!mounted || desktop) return null;

  return createPortal(
    <div className="[--r:min(50vw,200px)] md:[--r:250px] lg:hidden">
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            aria-hidden
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[70] bg-ink/60 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
        )}
      </AnimatePresence>

      <div ref={panel} {...(open ? { role: "dialog", "aria-modal": true, "aria-label": t("menu") } : {})}>
        {/* Hub: the closed menu, and the centre of the open wheel */}
        <button
          ref={hub}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="nav-dial"
          aria-label={open ? t("closeMenu") : t("openMenu")}
          className={`fixed end-0 top-1/2 z-[80] flex h-[72px] w-9 -translate-y-1/2 items-center justify-center rounded-s-full border border-e-0 ps-1 transition-colors ${
            open ? "border-ice/40 bg-mist text-ink" : "border-line bg-ink-2 text-mist shadow-[0_8px_30px_rgb(0_0_0/0.45)]"
          }`}
        >
          {open ? <X aria-hidden className="size-[18px]" strokeWidth={2} /> : <Menu aria-hidden className="size-[18px]" strokeWidth={2} />}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              key="dial"
              id="nav-dial"
              ref={disc}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerEnd}
              onPointerCancel={onPointerEnd}
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.2, opacity: 0 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
              className="fixed end-[calc(var(--r)*-1)] top-1/2 z-[75] -mt-[var(--r)] size-[calc(var(--r)*2)] touch-none select-none rounded-full border border-line bg-ink-2 shadow-[0_0_90px_rgb(0_0_0/0.6)]"
            >
              {/* Rim ticks turn with the wheel */}
              <motion.svg aria-hidden viewBox="-100 -100 200 200" className="absolute inset-0 size-full" style={{ transform: ticks }}>
                {Array.from({ length: 72 }, (_, k) => (
                  <line
                    key={k}
                    x1={0}
                    y1={-97}
                    x2={0}
                    y2={k % 3 === 0 ? -90 : -93.5}
                    transform={`rotate(${k * 5})`}
                    stroke="currentColor"
                    strokeWidth={k % 3 === 0 ? 0.9 : 0.6}
                    className="text-mist/25"
                  />
                ))}
              </motion.svg>
              <div aria-hidden className="absolute inset-[16%] rounded-full border border-line/70" />

              {/* Selection band and pointer, fixed at the middle of the wheel */}
              <div
                aria-hidden
                className="absolute end-1/2 top-1/2 h-[54px] w-[calc(var(--r)*0.84)] -translate-y-1/2 rounded-full border border-ice/30 bg-ice/10"
              />
              <span
                aria-hidden
                className="absolute start-1 top-1/2 size-0 -translate-y-1/2 border-y-[7px] border-s-[9px] border-y-transparent border-s-ice"
              />

              <nav aria-label={t("primary")}>
                <ul>
                  {items.map((item, i) => (
                    <DialItem
                      key={item.href}
                      index={i}
                      rot={rot}
                      s={s}
                      label={t(item.key)}
                      href={item.href}
                      active={isActive(pathname, item.href)}
                      selected={i === selected}
                      onSelect={(e) => {
                        e.preventDefault();
                        if (suppressClick.current) return;
                        settle(i);
                      }}
                    />
                  ))}
                </ul>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {open && (
            <motion.p
              key="hint"
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.2 } }}
              exit={{ opacity: 0 }}
              className="pointer-events-none fixed end-[calc(var(--r)+20px)] top-1/2 z-[75] max-w-[34vw] -translate-y-1/2 text-end text-sm leading-snug text-mist/70"
            >
              {t("dialHint")}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>,
    document.body,
  );
}

function DialItem({
  index,
  rot,
  s,
  label,
  href,
  active,
  selected,
  onSelect,
}: {
  index: number;
  rot: MotionValue<number>;
  s: number;
  label: string;
  href: string;
  active: boolean;
  selected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}) {
  // Each label rides a spoke: rotated about the wheel's centre, then pushed out along the radius.
  const transform = useTransform(rot, (v) => {
    const phi = (index - v) * STEP;
    return `rotate(${-s * phi}deg) translateX(calc(var(--r) * ${-s * 0.55}))`;
  });
  const opacity = useTransform(rot, (v) => {
    const a = Math.abs((index - v) * STEP);
    return a >= 88 ? 0 : 1 - Math.pow(a / 88, 1.4) * 0.8;
  });
  return (
    <motion.li className="absolute left-1/2 top-1/2 size-0" style={{ transform, opacity }}>
      <Link
        href={href}
        data-dial-item
        aria-current={active ? "page" : undefined}
        onClick={onSelect}
        draggable={false}
        className={`absolute left-0 top-0 flex w-[calc(var(--r)*0.74)] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full px-2 py-2 text-center uppercase leading-tight tracking-wider outline-offset-2 transition-[color,font-size] duration-200 ${
          selected ? "text-[15px] font-bold text-mist" : "text-[13px] font-medium text-mist/65"
        }`}
      >
        {label}
      </Link>
    </motion.li>
  );
}
