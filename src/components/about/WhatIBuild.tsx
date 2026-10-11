import { AppWindow, Globe, Monitor } from "lucide-react";

type Item = { title: string; body: string };

const CARDS = [
  { Icon: Globe, tint: "from-ice/20" },
  { Icon: AppWindow, tint: "from-steel/30" },
  { Icon: Monitor, tint: "from-mist/15" },
];

/** "What I build" (owner's chosen design): black field with fine diagonal lines, three dark cards. */
export function WhatIBuild({ title, intro, items }: { title: string; intro: string; items: Item[] }) {
  return (
    <section aria-labelledby="build-title" className="relative overflow-hidden bg-ink py-24 md:py-32">
      <div
        aria-hidden
        className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#252525_0px_1px,transparent_1px_8px)] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"
      />
      <div className="container-page relative flex flex-col gap-16 md:gap-20">
        <div className="flex flex-col justify-between gap-8 border-b border-line pb-10 md:flex-row md:items-end md:pb-12">
          <h2 id="build-title" className="text-[clamp(2.6rem,7vw,5.6rem)] font-black uppercase leading-none tracking-tight text-mist">
            {title}
          </h2>
          <p className="max-w-xs text-sm uppercase leading-relaxed tracking-widest text-mist/60">{intro}</p>
        </div>
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const { Icon, tint } = CARDS[i % CARDS.length];
            return (
              <li key={item.title} className="group relative overflow-hidden rounded-2xl border border-line bg-[#0a0a0a] p-10 transition-colors duration-500 hover:border-ink-3 md:p-12">
                <div aria-hidden className={`absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100 ${tint}`} />
                <div className="relative z-10 flex flex-col gap-14">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-white/10">
                    <Icon aria-hidden className="size-6 text-mist" strokeWidth={1.75} />
                  </span>
                  <div className="flex flex-col gap-4">
                    <h3 className="text-3xl font-black uppercase tracking-tight text-mist">{item.title}</h3>
                    <p className="leading-relaxed text-mist/65">{item.body}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
