"use client";

import { useMemo, useState } from "react";

/**
 * Multi-select country list with search and region shortcuts. Shortcuts only tick boxes; nothing is
 * saved until the form is submitted, so the owner can untick any country first.
 */
export function CountryPicker({
  name,
  countries,
  regions,
  exclude = [],
}: {
  name: string;
  countries: { code: string; name: string }[];
  regions: { key: string; label: string; codes: string[] }[];
  /** Countries already in the offer (not offered again). */
  exclude?: string[];
}) {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const options = useMemo(() => countries.filter((c) => !exclude.includes(c.code)), [countries, exclude]);
  const q = query.trim().toLowerCase();
  const shown = q ? options.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q) : options;

  const toggle = (code: string, on: boolean) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (on) next.add(code);
      else next.delete(code);
      return next;
    });
  const tickRegion = (codes: string[]) =>
    setPicked((prev) => new Set([...prev, ...codes.filter((c) => options.some((o) => o.code === c))]));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a country"
          aria-label="Search a country"
          className="field-input h-10 max-w-xs"
        />
        {regions.map((r) => (
          <button key={r.key} type="button" onClick={() => tickRegion(r.codes)} className="rounded-full border border-line px-3 py-1.5 text-xs text-mist/80 hover:border-ice/60">
            + {r.label}
          </button>
        ))}
        {picked.size > 0 && (
          <button type="button" onClick={() => setPicked(new Set())} className="rounded-full px-3 py-1.5 text-xs text-mist/60 hover:text-mist">
            Clear ({picked.size})
          </button>
        )}
      </div>
      <p className="text-xs text-mist/55">Region buttons only tick boxes. Check the list: every ticked country becomes eligible once published.</p>
      <div className="grid max-h-64 grid-cols-2 gap-x-4 gap-y-1.5 overflow-y-auto rounded-xl border border-line p-3 sm:grid-cols-3 lg:grid-cols-4">
        {options.map((c) => (
          <label key={c.code} className={`flex items-center gap-2 text-sm text-mist/85 ${shown.includes(c) ? "" : "hidden"}`}>
            <input type="checkbox" name={name} value={c.code} checked={picked.has(c.code)} onChange={(e) => toggle(c.code, e.target.checked)} className="size-4 accent-[#bbccd7]" />
            <span className="truncate">{c.name}</span>
            <span className="text-xs text-mist/45">{c.code}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
