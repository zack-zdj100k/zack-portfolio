"use client";

import { useState } from "react";
import { GlowButton } from "@/components/ui/GlowButton";

/**
 * The "Show prices for" picker. Every market's prices are already on the page, so switching is
 * instant (no round trip to the server); the address bar follows (?market=…) so a reload or a
 * shared link keeps the choice.
 */
export function MarketTabs({
  label,
  markets,
  initial,
  panels,
}: {
  label: string;
  markets: { key: string; param: string; name: string }[];
  initial: string;
  panels: Record<string, React.ReactNode>;
}) {
  const [market, setMarket] = useState(initial);
  const pick = (m: (typeof markets)[number]) => {
    setMarket(m.key);
    const url = new URL(window.location.href);
    url.searchParams.set("market", m.param);
    window.history.replaceState(window.history.state, "", url);
  };

  return (
    <>
      {markets.length > 1 && (
        <nav aria-label={label} className="mt-10 flex flex-wrap items-center gap-3">
          <span className="text-sm uppercase tracking-widest text-mist/60">{label}</span>
          <ul className="flex flex-wrap gap-2">
            {markets.map((m) => (
              <li key={m.key}>
                <GlowButton selected={m.key === market} aria-pressed={m.key === market} onClick={() => pick(m)}>
                  {m.name}
                </GlowButton>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {markets.map((m) => (
        <div key={m.key} hidden={m.key !== market}>
          {panels[m.key]}
        </div>
      ))}
    </>
  );
}
