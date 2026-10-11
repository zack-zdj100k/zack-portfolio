"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";

type Status = "idle" | "sending" | "success" | "error";

/**
 * Submits a public form as JSON to a route handler and maps server error codes to translated text.
 * The server re-validates everything; the browser only does what HTML `required` already does.
 */
export function usePublicForm(
  endpoint: string,
  { booleanFields = ["consent"], emailOrPhone }: { booleanFields?: string[]; emailOrPhone?: [string, string] } = {},
) {
  const t = useTranslations("forms");
  const locale = useLocale();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  // When the visitor started filling the form (used by the server's bot timer).
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  /** Same rules as the server, checked first so mistakes don't cost a round trip on a slow network. */
  function localErrors(form: HTMLFormElement) {
    const out: Record<string, string> = {};
    const fields = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input[name], textarea[name], select[name]");
    for (const el of fields) {
      if (el.name === "website" || el.type === "hidden") continue;
      if (el instanceof HTMLInputElement && el.type === "checkbox") {
        if (el.required && !el.checked) out[el.name] = t("consent");
        continue;
      }
      const value = el.value.trim();
      if (el.required && !value) out[el.name] = t("required");
      else if (value && el instanceof HTMLInputElement && el.type === "email" && el.validity.typeMismatch) out[el.name] = t("email");
    }
    if (emailOrPhone) {
      const [a, b] = emailOrPhone.map((n) => form.querySelector<HTMLInputElement>(`[name="${n}"]`)?.value.trim());
      if (!a && !b && !out[emailOrPhone[0]]) out[emailOrPhone[0]] = t("contactRequired");
    }
    return out;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const local = localErrors(form);
    if (Object.keys(local).length > 0) {
      setStatus("error");
      setErrors(local);
      setFormError(t("fixErrors"));
      form.querySelector<HTMLElement>(`[name="${Object.keys(local)[0]}"]`)?.focus();
      return;
    }
    const data: Record<string, unknown> = Object.fromEntries(new FormData(form).entries());
    for (const f of booleanFields) data[f] = form.querySelector<HTMLInputElement>(`[name="${f}"]`)?.checked === true;
    data.locale = locale;
    data._t = startedAt.current;

    setStatus("sending");
    setErrors({});
    setFormError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: Record<string, string> };
      if (res.ok && json.ok) {
        setStatus("success");
        form.reset();
        return;
      }
      setStatus("error");
      if (json.error === "validation" && json.fields) {
        setErrors(Object.fromEntries(Object.entries(json.fields).map(([k, code]) => [k, t(code)])));
        setFormError(t("fixErrors"));
        // Move focus to the first invalid field.
        const first = Object.keys(json.fields)[0];
        requestAnimationFrame(() => form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus());
      } else {
        setFormError(json.error === "rate_limited" ? t("rateLimited") : t("generic"));
      }
    } catch {
      setStatus("error");
      setFormError(t("network"));
    }
  }

  return { status, errors, formError, onSubmit, sendingLabel: t("sending") };
}
