"use client";

import { useActionState } from "react";
import { changeAccessCode, type CodeState } from "@/server/actions/auth";

const FIELDS = [
  { name: "current", label: "Current code", autoComplete: "current-password" },
  { name: "next", label: "New code (12 characters or more)", autoComplete: "new-password" },
  { name: "repeat", label: "Repeat the new code", autoComplete: "new-password" },
] as const;

export function AccessCodeForm() {
  const [state, action, pending] = useActionState<CodeState, FormData>(changeAccessCode, { error: null });
  return (
    <form action={action} className="grid gap-5 md:grid-cols-3">
      <input type="text" name="username" autoComplete="username" value="admin" readOnly hidden />
      {FIELDS.map((f) => (
        <label key={f.name} className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-mist/85">{f.label}</span>
          <input name={f.name} type="password" autoComplete={f.autoComplete} required spellCheck={false} autoCapitalize="off" className="field-input" />
        </label>
      ))}
      <div className="flex flex-col items-start gap-3 md:col-span-3" aria-live="polite">
        {state.error && <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm">{state.error}</p>}
        {state.ok && <p className="rounded-xl border border-ice/40 bg-ice/10 px-4 py-3 text-sm">Code changed. Other devices were signed out.</p>}
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-full border border-line px-6 text-sm font-medium text-mist hover:border-ice/60 disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Saving..." : "Change code"}
        </button>
      </div>
    </form>
  );
}
