"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { login, type LoginState } from "@/server/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, { error: null });
  const [shown, setShown] = useState(false);
  return (
    <form action={action} className="flex flex-col gap-5">
      {/* Lets password managers save and fill the code under a fixed name. */}
      <input type="text" name="username" autoComplete="username" value="admin" readOnly hidden />
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Access code</span>
        <span className="relative">
          <input
            name="code"
            type={shown ? "text" : "password"}
            autoComplete="current-password"
            autoFocus
            required
            spellCheck={false}
            autoCapitalize="off"
            className="field-input w-full pe-12"
          />
          <button
            type="button"
            onClick={() => setShown((v) => !v)}
            aria-label={shown ? "Hide code" : "Show code"}
            aria-pressed={shown}
            className="absolute inset-y-0 end-0 flex w-12 items-center justify-center text-mist/60 hover:text-mist"
          >
            {shown ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
          </button>
        </span>
      </label>
      <div aria-live="polite">{state.error && <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm">{state.error}</p>}</div>
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-full bg-mist text-sm font-medium uppercase tracking-widest text-ink hover:bg-white disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Checking..." : "Enter"}
      </button>
    </form>
  );
}
