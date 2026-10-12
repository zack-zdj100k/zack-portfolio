"use client";

import { useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import { stackSymbol } from "@/lib/stack";
import { tint } from "@/components/about/skill-tints";
import { techKey } from "@/components/projects/TechTiles";

const MAX_ITEMS = 30;
const MAX_LEN = 40;

/**
 * A project's technologies as periodic-table tiles: add (with suggestions from Admin → Skills),
 * rename (click the name), move left / right, delete. The list is sent with the surrounding form as
 * one comma-separated field, so the save action is unchanged. Tiles take the colour of the skill
 * group they belong to, like on the project page.
 */
export function TechListEditor({
  name,
  defaultValue,
  suggestions,
  groupOf,
}: {
  name: string;
  defaultValue: string[];
  suggestions: string[];
  /** techKey(skill name) → index of its group (for the tile colour). */
  groupOf: Record<string, number>;
}) {
  const [items, setItems] = useState(defaultValue);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const hidden = useRef<HTMLInputElement>(null);
  const listId = useId();

  const clean = (v: string) => v.replace(/,/g, " ").replace(/\s+/g, " ").trim().slice(0, MAX_LEN);
  const has = (v: string, except = -1) => items.some((x, i) => i !== except && x.toLowerCase() === v.toLowerCase());

  // Tell the unsaved-changes guard that the form was edited.
  const commit = (next: string[]) => {
    setItems(next);
    setError("");
    queueMicrotask(() => hidden.current?.dispatchEvent(new Event("input", { bubbles: true })));
  };

  const add = () => {
    const v = clean(draft);
    if (!v) return;
    if (has(v)) return setError(`${v} is already in the list.`);
    if (items.length >= MAX_ITEMS) return setError(`At most ${MAX_ITEMS} technologies.`);
    commit([...items, v]);
    setDraft("");
  };
  /** Returns false when the new name is refused (empty or already listed). */
  const rename = (i: number, value: string) => {
    const v = clean(value);
    if (v === items[i]) return true;
    if (!v) return false;
    if (has(v, i)) {
      setError(`${v} is already in the list.`);
      return false;
    }
    commit(items.map((x, k) => (k === i ? v : x)));
    return true;
  };
  const move = (i: number, by: -1 | 1) => {
    const j = i + by;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-mist/85">Technologies</span>
      <input ref={hidden} type="hidden" name={name} value={items.join(", ")} />
      {items.length > 0 ? (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(132px,1fr))] gap-2">
          {items.map((t, i) => {
            const style = tint(groupOf[techKey(t)] ?? 5);
            return (
              <li key={`${t}-${i}`} className={`flex flex-col gap-1.5 rounded-xl p-2.5 ${style.tile} ${style.text}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[0.65rem] tabular-nums opacity-70">{String(i + 1).padStart(2, "0")}</span>
                  <button
                    type="button"
                    onClick={() => commit(items.filter((_, k) => k !== i))}
                    aria-label={`Delete ${t}`}
                    title="Delete"
                    className="rounded-full p-1 opacity-70 hover:bg-black/20 hover:opacity-100"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <span aria-hidden className="text-2xl font-bold leading-none">
                  {stackSymbol(t)}
                </span>
                <input
                  defaultValue={t}
                  aria-label={`Rename ${t}`}
                  title="Click to rename"
                  maxLength={MAX_LEN}
                  onBlur={(e) => {
                    if (!rename(i, e.target.value)) e.target.value = t;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.currentTarget.blur();
                    }
                  }}
                  className="w-full rounded-md bg-transparent px-1 py-0.5 text-xs outline-none ring-current/40 hover:ring-1 focus:bg-black/20 focus:ring-1"
                />
                <div className="flex justify-between">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${t} left`} className="rounded p-1 opacity-70 hover:bg-black/20 disabled:opacity-25">
                    <ArrowLeft className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === items.length - 1}
                    aria-label={`Move ${t} right`}
                    className="rounded p-1 opacity-70 hover:bg-black/20 disabled:opacity-25"
                  >
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-mist/60">No technologies yet.</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          list={listId}
          maxLength={MAX_LEN}
          placeholder="Add a technology, e.g. PostgreSQL"
          aria-label="Add a technology"
          className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-ink px-4 text-mist placeholder:text-mist/40 focus:border-ice/60 focus:outline-none"
        />
        <datalist id={listId}>
          {suggestions
            .filter((s) => !has(s))
            .map((s) => (
              <option key={s} value={s} />
            ))}
        </datalist>
        <button type="button" onClick={add} className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-line px-4 text-sm text-mist hover:border-ice/60">
          <Plus className="size-4" /> Add
        </button>
      </div>
      <p className="text-xs text-mist/55">
        {error || "Click a name to rename it. Changes are kept when you press “Save details”. Suggestions come from Admin → Skills."}
      </p>
    </div>
  );
}
