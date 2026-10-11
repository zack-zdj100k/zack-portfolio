import { Reveal } from "./Reveal";

/** Title block shared by inner pages: giant gradient heading plus an optional intro. */
export function PageHeader({ title, intro, id = "page-title" }: { title: string; intro?: string; id?: string }) {
  return (
    <header className="container-page pb-12 pt-10 md:pb-20 md:pt-16">
      <Reveal>
        <h1 id={id} className="text-[clamp(2.8rem,10vw,9rem)] font-black uppercase leading-[0.9] tracking-tight display-gradient">
          {title}
        </h1>
      </Reveal>
      {intro && (
        <Reveal delay={0.08}>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-mist/75 md:mt-8 md:text-xl">{intro}</p>
        </Reveal>
      )}
    </header>
  );
}
