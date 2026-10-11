"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { MessageCircle } from "lucide-react";

/**
 * Phones only: a WhatsApp button in the thumb zone, shown once the visitor has scrolled past the
 * first screen. Opens a chat with a pre-filled message in the visitor's language.
 */
export function WhatsAppButton({ href, label }: { href: string; label: string }) {
  const { scrollY } = useScroll();
  const [shown, setShown] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setShown(y > window.innerHeight * 0.6));

  return (
    <AnimatePresence>
      {shown && (
        <motion.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] end-4 z-50 inline-flex h-14 items-center gap-2.5 rounded-full bg-mist ps-5 pe-6 text-sm font-medium uppercase tracking-widest text-ink shadow-[0_12px_32px_rgb(0_0_0/0.45)] active:scale-[0.97] md:hidden"
        >
          <MessageCircle aria-hidden className="size-5" strokeWidth={2} />
          WhatsApp
        </motion.a>
      )}
    </AnimatePresence>
  );
}
