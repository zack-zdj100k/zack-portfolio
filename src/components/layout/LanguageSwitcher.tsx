"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Languages } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { localeNames, locales, type Locale } from "@/lib/i18n/locales";

export function LanguageSwitcher({ enabledLocales, variant = "header" }: { enabledLocales: string[]; variant?: "header" | "footer" }) {
  const t = useTranslations("common");
  const current = useLocale() as Locale;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const options = locales.filter((l) => enabledLocales.includes(l) || l === current);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);


  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={t("chooseLanguage")}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-11 items-center gap-2 rounded-full border border-line px-4 text-sm font-medium uppercase tracking-wider text-mist transition-colors hover:border-ice/60 ${
          variant === "footer" ? "bg-ink-2" : ""
        }`}
      >
        <Languages aria-hidden className="size-4" strokeWidth={1.75} />
        <span>{current.split("-")[0]}</span>
      </button>
      {open && (
        <ul
          id={listId}
          className={`absolute z-50 max-h-[70dvh] w-60 overflow-auto rounded-2xl border border-line bg-ink-2 p-1.5 shadow-[0_24px_60px_rgb(0_0_0/0.5)] ${
            variant === "footer" ? "bottom-full mb-2 start-0" : "top-full mt-2 end-0"
          }`}
        >
          {options.map((l) => (
            <li key={l}>
              <Link
                href={pathname}
                locale={l}
                lang={l}
                hrefLang={l}
                aria-current={l === current ? "true" : undefined}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[0.95rem] text-mist/80 hover:bg-ink-3 hover:text-mist"
              >
                {localeNames[l]}
                {l === current && <Check aria-hidden className="size-4 text-ice" />}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
