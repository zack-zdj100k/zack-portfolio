import { ArrowRight, Globe2, Wrench } from "lucide-react";
import { Link } from "@/i18n/navigation";

type Note = { title: string; body: string };

/**
 * "Good to know" as a bento grid (owner's chosen design, in the site palette): one large card,
 * two compact cards and a wide card that leads to the quote request.
 */
export function GoodToKnow({ scope, hosting, maintenance, goal, cta }: { scope: Note; hosting: Note; maintenance: Note; goal: Note; cta: string }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
      <article className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-line bg-paper p-8 text-ink md:col-span-2 md:row-span-2 md:p-12">
        {/* Star that turns slowly on hover */}
        <svg
          aria-hidden
          viewBox="0 0 377 368"
          className="absolute -bottom-16 -end-16 w-[26rem] fill-ink/[0.05] transition-transform duration-[2000ms] ease-in group-hover:rotate-180 motion-reduce:transition-none"
        >
          <path d="M179.692 5.79814C182.635 -1.93287 193.572 -1.93285 196.515 5.79816L229.505 92.466C231.206 96.9342 236.103 99.2928 240.657 97.8366L328.986 69.5929C336.865 67.0735 343.684 75.6242 339.474 82.7452L292.284 162.574C289.851 166.69 291.061 171.99 295.038 174.642L372.192 226.091C379.075 230.68 376.641 241.343 368.449 242.491L276.613 255.369C271.878 256.033 268.489 260.283 268.895 265.047L276.776 357.445C277.479 365.688 267.625 370.433 261.619 364.744L194.293 300.973C190.821 297.686 185.386 297.686 181.914 300.973L114.588 364.744C108.582 370.433 98.7281 365.688 99.4311 357.445L107.312 265.047C107.718 260.283 104.329 256.033 99.5941 255.369L7.7582 242.491C-0.433812 241.343 -2.86746 230.68 4.01488 226.091L81.1687 174.642C85.1465 171.99 86.3561 166.69 83.9231 162.574L36.7325 82.7452C32.523 75.6242 39.342 67.0735 47.2212 69.5929L135.55 97.8366C140.104 99.2928 145.001 96.9342 146.702 92.4659L179.692 5.79814Z" />
        </svg>
        <h3 className="relative z-10 text-[clamp(2.2rem,4.2vw,3.6rem)] font-black uppercase leading-[0.95] tracking-tight">{scope.title}</h3>
        <p className="relative z-10 mt-12 max-w-sm text-lg leading-relaxed text-ink/70">{scope.body}</p>
      </article>

      <article className="flex flex-col justify-between gap-8 rounded-xl bg-ice p-8 text-ink">
        <Globe2 aria-hidden className="size-8" strokeWidth={1.5} />
        <div>
          <h3 className="text-xl font-bold uppercase leading-tight">{hosting.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink/75">{hosting.body}</p>
        </div>
      </article>

      <article className="flex flex-col justify-center gap-4 rounded-xl border border-line bg-ink-2 p-8 text-mist">
        <span className="flex size-10 items-center justify-center rounded-lg bg-steel">
          <Wrench aria-hidden className="size-5 text-mist" strokeWidth={1.75} />
        </span>
        <h3 className="text-xl font-bold leading-tight">{maintenance.title}</h3>
        <p className="text-sm leading-relaxed text-mist/70">{maintenance.body}</p>
      </article>

      <Link
        href="/contact"
        className="group flex flex-col gap-6 overflow-hidden rounded-xl bg-steel p-7 text-mist transition-colors duration-500 hover:bg-[#727884] sm:flex-row sm:items-center sm:justify-between md:col-span-2"
      >
        <div className="flex flex-col gap-2">
          <h3 className="text-2xl font-black uppercase tracking-tight md:text-3xl">{goal.title}</h3>
          <p className="max-w-md text-mist/80">{goal.body}</p>
          <span className="mt-2 text-sm font-medium uppercase tracking-widest text-mist">{cta}</span>
        </div>
        <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-mist text-ink transition-transform duration-500 group-hover:scale-105">
          <ArrowRight aria-hidden className="size-8 rtl:-scale-x-100" strokeWidth={1.75} />
        </span>
      </Link>
    </div>
  );
}
