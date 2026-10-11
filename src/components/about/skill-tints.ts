// One tint per skill group, in group order, all from the site palette (ice → steel → slate → outline).
const TINTS: { tile: string; text: string; swatch: string }[] = [
  { tile: "bg-ice", text: "text-ink", swatch: "bg-ice" },
  { tile: "bg-[#8E9DAA]", text: "text-ink", swatch: "bg-[#8E9DAA]" },
  { tile: "bg-steel", text: "text-mist", swatch: "bg-steel" },
  { tile: "bg-[#3A4754]", text: "text-mist", swatch: "bg-[#3A4754]" },
  { tile: "bg-[#25303B]", text: "text-mist", swatch: "bg-[#25303B]" },
  { tile: "bg-ink-3 ring-1 ring-inset ring-line", text: "text-mist", swatch: "bg-ink-3 ring-1 ring-line" },
];

export const tint = (groupIndex: number) => TINTS[groupIndex % TINTS.length];
