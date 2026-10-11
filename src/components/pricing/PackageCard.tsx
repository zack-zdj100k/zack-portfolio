"use client";

import { useState } from "react";
import { Check, Clock, Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { formatMoney } from "@/lib/money";

export type CardPackage = {
  id: string;
  name: string;
  description: string | null;
  category: "WEBSITE" | "APP" | "SOFTWARE" | null;
  highlighted: boolean;
  features: string[];
  addOns: string[];
  delivery: string | null;
  /** null when this market has no listed price. */
  price: { currency: string; min: number; max: number | null; step: number | null } | null;
};

type Labels = {
  from: string; // contains {amount}
  estimate: string;
  less: string;
  more: string;
  sliderLabel: string; // contains {name}
  includes: string;
  addOns: string;
  delivery: string;
  quote: string;
  noPrice: string;
};

/**
 * One package with its own price bar: the visitor drags from the owner's minimum to maximum (in the
 * owner's step) and the quote button carries that budget to the contact form. "From" prices have no
 * maximum, so they show the starting price only.
 */
export function PackageCard({ pkg, labels, locale }: { pkg: CardPackage; labels: Labels; locale: string }) {
  const price = pkg.price;
  const ranged = !!price && price.max !== null && price.max > price.min;
  const step = ranged ? Math.max(price.step ?? Math.round((price.max! - price.min) / 20), 1) : 1;
  const [value, setValue] = useState(price?.min ?? 0);
  const pct = ranged ? ((value - price.min) / (price.max! - price.min)) * 100 : 0;
  const money = (n: number) => (price ? formatMoney(n, price.currency, locale) : "");
  const budget = price ? money(value) : undefined;
  const quoteHref = {
    pathname: "/contact",
    query: { ...(budget ? { budget: ranged ? budget : labels.from.replace("{amount}", budget) } : {}), ...(pkg.category ? { type: pkg.category.toLowerCase() } : {}) },
  } as const;
  const light = pkg.highlighted;

  return (
    <li
      className={`flex flex-col gap-6 rounded-[28px] p-6 sm:p-7 ${light ? "surface-paper bg-mist text-ink" : "border border-line bg-ink-2 text-mist"}`}
    >
      <div className="flex flex-col gap-2">
        <h4 className="text-xl font-bold uppercase leading-tight">{pkg.name}</h4>
        {pkg.delivery && (
          <p className={`flex items-center gap-1.5 text-sm ${light ? "text-ink/70" : "text-mist/60"}`}>
            <Clock aria-hidden className="size-3.5" strokeWidth={2} />
            {labels.delivery}: {pkg.delivery}
          </p>
        )}
      </div>

      {!price ? (
        <p className={light ? "text-ink/70" : "text-mist/65"}>{labels.noPrice}</p>
      ) : ranged ? (
        <div className="flex flex-col gap-3">
          <p className={`text-xs uppercase tracking-widest ${light ? "text-ink/60" : "text-mist/55"}`}>
            {money(price.min)} – {money(price.max!)}
          </p>
          <div>
            <p className={`text-xs uppercase tracking-widest ${light ? "text-ink/60" : "text-mist/55"}`}>{labels.estimate}</p>
            <p aria-live="polite" className="mt-1 text-[clamp(1.8rem,3vw,2.4rem)] font-black leading-none tracking-tight tabular-nums">
              {money(value)}
            </p>
          </div>
          <input
            type="range"
            min={price.min}
            max={price.max!}
            step={step}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            aria-label={labels.sliderLabel.replace("{name}", pkg.name)}
            aria-valuetext={money(value)}
            className={`price-slider w-full ${light ? "price-slider-paper" : ""}`}
            style={{ "--fill": `${pct}%` } as React.CSSProperties}
          />
          <div className={`flex justify-between text-xs ${light ? "text-ink/60" : "text-mist/55"}`}>
            <span>{labels.less}</span>
            <span>{labels.more}</span>
          </div>
        </div>
      ) : (
        <p className="text-[clamp(1.6rem,2.6vw,2.1rem)] font-black leading-tight">{labels.from.replace("{amount}", money(price.min))}</p>
      )}

      {pkg.description && <p className={light ? "text-ink/75" : "text-mist/70"}>{pkg.description}</p>}

      {pkg.features.length > 0 && (
        <div>
          <p className={`mb-3 text-xs uppercase tracking-widest ${light ? "text-ink/60" : "text-mist/55"}`}>{labels.includes}</p>
          <ul className="flex flex-col gap-2">
            {pkg.features.map((f) => (
              <li key={f} className="flex gap-2.5">
                <Check aria-hidden className="mt-1 size-4 shrink-0" strokeWidth={2.25} />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {pkg.addOns.length > 0 && (
        <div>
          <p className={`mb-3 text-xs uppercase tracking-widest ${light ? "text-ink/60" : "text-mist/55"}`}>{labels.addOns}</p>
          <ul className="flex flex-col gap-2">
            {pkg.addOns.map((a) => (
              <li key={a} className={`flex gap-2.5 ${light ? "text-ink/80" : "text-mist/75"}`}>
                <Plus aria-hidden className="mt-1 size-4 shrink-0" strokeWidth={2} />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        href={quoteHref}
        className={`mt-auto inline-flex items-center justify-center rounded-full px-6 py-3.5 text-center text-sm font-medium uppercase tracking-widest transition-colors active:scale-[0.98] ${
          light ? "bg-ink text-mist hover:bg-ink-2" : "bg-mist text-ink hover:bg-white"
        }`}
      >
        {labels.quote}
      </Link>
    </li>
  );
}
