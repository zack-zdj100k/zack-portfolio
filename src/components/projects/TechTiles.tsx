import { stackSymbol } from "@/lib/stack";
import { tint } from "@/components/about/skill-tints";

/** Comparable form of a technology name ("Prisma ORM" and "Prisma" match, "Next.js" and "nextjs" too). */
export const techKey = (name: string) => name.toLowerCase().replace(/\s+orm$/, "").replace(/[^a-z0-9+#]/g, "");

/**
 * A project's technologies as periodic-table tiles, the same design as "My stack, as a periodic
 * table": each tile takes the colour of the skill group it belongs to (by name), else the outline tint.
 */
export function TechTiles({ technologies, groupOf, label }: { technologies: string[]; groupOf: Record<string, number>; label: string }) {
  return (
    <ul aria-label={label} className="grid grid-cols-[repeat(auto-fill,minmax(76px,1fr))] gap-2">
      {technologies.map((name, i) => {
        const g = groupOf[techKey(name)];
        const style = tint(g ?? 5);
        return (
          <li
            key={name}
            title={name}
            className={`flex aspect-square flex-col justify-between rounded-xl p-2.5 transition-transform duration-300 hover:-translate-y-0.5 ${style.tile} ${style.text}`}
          >
            <span aria-hidden className="text-[0.65rem] tabular-nums opacity-70">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span aria-hidden className="text-[1.65rem] font-bold leading-none">
              {stackSymbol(name)}
            </span>
            <span className="truncate text-[0.62rem] opacity-80">{name}</span>
          </li>
        );
      })}
    </ul>
  );
}
