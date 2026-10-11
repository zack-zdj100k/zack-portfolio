"use client";

import { useEffect } from "react";

/**
 * Warns before leaving an admin page with edited, unsaved forms: switching a language tab or
 * clicking any link would otherwise drop what was typed. Forms count as saved once submitted.
 */
export function UnsavedChangesGuard() {
  useEffect(() => {
    const dirty = new Set<HTMLFormElement>();
    const main = document.querySelector("main");
    if (!main) return;

    const onEdit = (e: Event) => {
      const form = (e.target as HTMLElement | null)?.closest("form");
      if (form) dirty.add(form);
    };
    const onSubmit = (e: Event) => {
      dirty.delete(e.target as HTMLFormElement);
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty.size > 0) e.preventDefault();
    };
    const onClick = (e: MouseEvent) => {
      if (dirty.size === 0 || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const link = (e.target as HTMLElement | null)?.closest("a[href]");
      if (!link || link.getAttribute("target") === "_blank") return;
      if (!window.confirm("You have unsaved changes. Leave this page without saving them?")) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        dirty.clear();
      }
    };

    main.addEventListener("input", onEdit);
    main.addEventListener("change", onEdit);
    main.addEventListener("submit", onSubmit, true);
    document.addEventListener("click", onClick, true);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      main.removeEventListener("input", onEdit);
      main.removeEventListener("change", onEdit);
      main.removeEventListener("submit", onSubmit, true);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);
  return null;
}
