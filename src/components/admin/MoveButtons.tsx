import { ArrowDown, ArrowUp } from "lucide-react";

/**
 * Up/down buttons in their own small form (the item's edit form can't contain another form).
 * Posts `id`, `locale` and `op=up|down` to `action`.
 */
export function MoveButtons({
  action,
  id,
  locale,
  first,
  last,
  label,
}: {
  action: (fd: FormData) => Promise<void>;
  id: string;
  locale: string;
  first: boolean;
  last: boolean;
  label: string;
}) {
  return (
    <form action={action} className="flex gap-1.5">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="locale" value={locale} />
      <button name="op" value="up" disabled={first} aria-label={`Move ${label} up`} className="flex size-9 items-center justify-center rounded-full border border-line hover:border-ice/60 disabled:opacity-30">
        <ArrowUp aria-hidden className="size-4" />
      </button>
      <button name="op" value="down" disabled={last} aria-label={`Move ${label} down`} className="flex size-9 items-center justify-center rounded-full border border-line hover:border-ice/60 disabled:opacity-30">
        <ArrowDown aria-hidden className="size-4" />
      </button>
    </form>
  );
}
