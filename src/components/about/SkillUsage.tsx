import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { stackSymbol } from "@/lib/stack";
import { tint } from "./skill-tints";

type Group = {
  key: string;
  name: string;
  skills: { id: string; name: string; symbol: string | null; usage: string | null; projects: { slug: string; title: string }[] }[];
};

/**
 * "How I use my technologies": the owner's own words per skill, and the projects that show it.
 * Skills without a description or a linked project are left out (the periodic table lists them).
 * No levels or ratings, by design.
 */
export function SkillUsage({ groups, labels }: { groups: Group[]; labels: { title: string; intro: string; shownIn: string } }) {
  const withText = groups
    .map((g, gi) => ({ ...g, gi, skills: g.skills.filter((s) => s.usage || s.projects.length > 0) }))
    .filter((g) => g.skills.length > 0);
  if (withText.length === 0) return null;

  return (
    <section aria-labelledby="usage-title" className="container-page pb-20 md:pb-28">
      <Reveal>
        <h2 id="usage-title" className="max-w-4xl text-[clamp(2.2rem,5.5vw,4.8rem)] font-black uppercase leading-[0.95] tracking-tight display-gradient">
          {labels.title}
        </h2>
        <p className="mt-5 max-w-2xl text-lg text-mist/70">{labels.intro}</p>
      </Reveal>
      <div className="mt-12 flex flex-col gap-12">
        {withText.map((g) => (
          <div key={g.key}>
            <h3 className="mb-5 flex items-center gap-2 text-sm uppercase tracking-widest text-mist/60">
              <span aria-hidden className={`size-2.5 rounded-sm ${tint(g.gi).swatch}`} />
              {g.name}
            </h3>
            <ul className="grid gap-4 md:grid-cols-2">
              {g.skills.map((s, i) => (
                <Reveal as="li" key={s.id} delay={0.04 * i} className="flex gap-5 rounded-[24px] border border-line bg-ink-2 p-5 md:p-6">
                  <span aria-hidden className={`flex size-14 shrink-0 items-center justify-center rounded-xl text-2xl font-bold ${tint(g.gi).tile} ${tint(g.gi).text}`}>
                    {s.symbol || stackSymbol(s.name)}
                  </span>
                  <div className="flex min-w-0 flex-col gap-2">
                    <p className="text-xl font-bold text-mist">{s.name}</p>
                    {s.usage && <p className="whitespace-pre-line leading-relaxed text-mist/75">{s.usage}</p>}
                    {s.projects.length > 0 && (
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-mist/60">
                        <span>{labels.shownIn}</span>
                        {s.projects.map((p) => (
                          <Link key={p.slug} href={`/projects/${p.slug}`} className="inline-flex items-center gap-1 text-mist underline decoration-ice/50 underline-offset-4 hover:decoration-ice">
                            {p.title}
                            <ArrowUpRight aria-hidden className="size-3.5 rtl:-scale-x-100" />
                          </Link>
                        ))}
                      </p>
                    )}
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
