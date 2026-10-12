/**
 * Shown the moment a visitor opens another page (menu, header, any link) while the server renders
 * it: the header stays, a progress bar runs along the top and the page's outline appears. Having
 * this boundary also lets Next prefetch every page's shell, so switching pages starts instantly.
 */
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="min-h-[70vh]">
      <span className="sr-only">Loading…</span>
      <div aria-hidden className="fixed inset-x-0 top-0 z-[90] h-0.5 overflow-hidden bg-ice/10">
        <div className="h-full w-1/3 animate-[loading-bar_1.1s_ease-in-out_infinite] bg-ice motion-reduce:w-full motion-reduce:animate-none motion-reduce:opacity-60" />
      </div>
      <div aria-hidden className="container-page flex flex-col gap-6 pt-16 md:pt-24">
        <div className="h-4 w-32 rounded-full bg-ink-3" />
        <div className="h-[clamp(3rem,9vw,7rem)] w-[min(100%,48rem)] rounded-2xl bg-ink-3/80" />
        <div className="h-5 w-[min(100%,36rem)] rounded-full bg-ink-3/70" />
        <div className="h-5 w-[min(80%,28rem)] rounded-full bg-ink-3/60" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-48 rounded-[28px] border border-line bg-ink-2" />
          ))}
        </div>
      </div>
    </div>
  );
}
