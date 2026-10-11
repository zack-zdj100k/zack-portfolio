"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ConsentField, Honeypot, SelectField, TextField } from "@/components/forms/fields";
import { FormStatus } from "@/components/forms/FormStatus";
import { usePublicForm } from "@/components/forms/usePublicForm";

/** "Join the waitlist" for a Coming Soon service: a button that opens a short form in place. */
export function WaitlistForm({
  serviceId,
  serviceTitle,
  countries,
  defaultCountry,
}: {
  serviceId: string;
  serviceTitle: string;
  countries: { code: string; name: string }[];
  defaultCountry: string | null;
}) {
  const t = useTranslations("ai");
  const tc = useTranslations("contact");
  const [open, setOpen] = useState(false);
  const { status, errors, formError, onSubmit, sendingLabel } = usePublicForm("/api/waitlist");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${t("waitlistCta")}: ${serviceTitle}`}
        className="inline-flex items-center justify-center rounded-full border border-mist/40 px-5 py-2.5 text-sm font-medium text-mist transition-colors hover:border-ice hover:bg-mist/5"
      >
        {t("waitlistCta")}
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative flex flex-col gap-5 rounded-2xl border border-line bg-ink/60 p-5" aria-label={`${t("waitlistCta")}: ${serviceTitle}`}>
      <Honeypot />
      <input type="hidden" name="aiServiceId" value={serviceId} />
      <p className="text-sm text-mist/70">{t("waitlistIntro")}</p>
      <TextField name="name" label={tc("name")} autoComplete="name" required maxLength={120} error={errors.name} />
      <TextField name="email" type="email" label={tc("emailLabel")} autoComplete="email" required maxLength={200} error={errors.email} dir="ltr" />
      <SelectField
        name="country"
        label={tc("country")}
        required
        placeholder={tc("countryPlaceholder")}
        defaultValue={countries.some((c) => c.code === defaultCountry) ? (defaultCountry as string) : ""}
        options={countries.map((c) => ({ value: c.code, label: c.name }))}
        error={errors.country}
      />
      <ConsentField name="consent" label={t("waitlistConsent")} error={errors.consent} />
      <FormStatus status={status} error={formError} successTitle={t("waitlistSuccessTitle")} successBody={t("waitlistSuccessBody")} />
      {status !== "success" && (
        <div>
          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex items-center justify-center rounded-full bg-mist px-6 py-3 text-sm font-medium uppercase tracking-widest text-ink hover:bg-white disabled:cursor-wait disabled:opacity-70"
          >
            {status === "sending" ? sendingLabel : t("waitlistSubmit")}
          </button>
        </div>
      )}
    </form>
  );
}
