"use client";

import { CircleCheck, CircleAlert } from "lucide-react";

/** Live region announcing success or failure to screen readers, visible to everyone. */
export function FormStatus({ status, error, successTitle, successBody }: { status: string; error: string | null; successTitle: string; successBody: string }) {
  return (
    <div aria-live="polite" role="status">
      {status === "success" && (
        <div className="flex gap-3 rounded-2xl border border-ok/40 bg-ok/10 p-5 text-mist">
          <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-ok" />
          <div>
            <p className="font-medium">{successTitle}</p>
            <p className="mt-1 text-mist/75">{successBody}</p>
          </div>
        </div>
      )}
      {status === "error" && error && (
        <div className="flex gap-3 rounded-2xl border border-danger/40 bg-danger/10 p-5 text-mist">
          <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-danger" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
