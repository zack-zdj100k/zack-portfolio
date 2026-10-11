"use client";

import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ConsentField, Honeypot, SelectField, TextArea, TextField } from "@/components/forms/fields";
import { FormStatus } from "@/components/forms/FormStatus";
import { usePublicForm } from "@/components/forms/usePublicForm";

export function ContactForm({
  countries,
  defaultCountry,
  defaultBudget,
  defaultCategory,
  headingId,
}: {
  countries: { code: string; name: string }[];
  defaultCountry: string | null;
  defaultBudget?: string;
  defaultCategory?: string;
  /** When the page shows its own heading for the form, pass its id; the form then skips its own. */
  headingId?: string;
}) {
  const t = useTranslations("contact");
  const tp = useTranslations("projects");
  const { status, errors, formError, onSubmit, sendingLabel } = usePublicForm("/api/contact", { emailOrPhone: ["email", "phone"] });

  return (
    <form onSubmit={onSubmit} noValidate className="relative flex flex-col gap-8" aria-labelledby={headingId ?? "contact-form-title"}>
      {!headingId && (
        <h2 id="contact-form-title" className="text-2xl font-bold uppercase text-mist">
          {t("formTitle")}
        </h2>
      )}
      <Honeypot />

      <fieldset className="flex flex-col gap-6">
        <legend className="mb-4 text-sm uppercase tracking-widest text-mist/60">{t("groupYou")}</legend>
        <TextField name="name" label={t("name")} autoComplete="name" required maxLength={120} error={errors.name} />
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField
            name="email"
            type="email"
            label={t("emailLabel")}
            autoComplete="email"
            maxLength={200}
            error={errors.email}
            dir="ltr"
            describedBy="contact-hint"
          />
          <TextField
            name="phone"
            type="tel"
            label={t("phoneLabel")}
            autoComplete="tel"
            maxLength={30}
            error={errors.phone}
            dir="ltr"
            describedBy="contact-hint"
          />
        </div>
        <p id="contact-hint" className="-mt-3 text-sm text-mist/60">
          {t("contactHint")}
        </p>
        <SelectField
          name="country"
          label={t("country")}
          required
          placeholder={t("countryPlaceholder")}
          defaultValue={countries.some((c) => c.code === defaultCountry) ? (defaultCountry as string) : ""}
          options={countries.map((c) => ({ value: c.code, label: c.name }))}
          error={errors.country}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-6">
        <legend className="mb-4 text-sm uppercase tracking-widest text-mist/60">{t("groupProject")}</legend>
        <SelectField
          name="projectCategory"
          label={t("category")}
          placeholder={t("categoryOther")}
          defaultValue={defaultCategory ?? ""}
          options={(["WEBSITE", "APP", "SOFTWARE"] as const).map((c) => ({ value: c, label: tp(`category.${c}`) }))}
          error={errors.projectCategory}
        />
        <TextArea name="message" label={t("message")} required rows={7} maxLength={5000} error={errors.message} />
        {/* Optional details stay out of the way; they open by themselves if one of them has an error. */}
        <details className="group rounded-2xl border border-line px-5 py-4" open={!!(defaultBudget || errors.budget || errors.timeline)}>
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-mist/85 [&::-webkit-details-marker]:hidden">
            <ChevronRight aria-hidden className="size-4 transition-transform group-open:rotate-90 rtl:-scale-x-100" strokeWidth={2} />
            {t("moreDetails")}
          </summary>
          <div className="mt-5 grid gap-6 pb-1 sm:grid-cols-2">
            <TextField name="budget" label={t("budget")} hint={t("budgetHint")} maxLength={120} error={errors.budget} defaultValue={defaultBudget} />
            <TextField name="timeline" label={t("timeline")} hint={t("timelineHint")} maxLength={120} error={errors.timeline} />
          </div>
        </details>
      </fieldset>

      <ConsentField name="consent" label={t("consent")} error={errors.consent}>
        <Link href="/privacy" className="underline decoration-ice/50 underline-offset-4 hover:text-mist">
          {t("privacyLink")}
        </Link>
      </ConsentField>
      <FormStatus status={status} error={formError} successTitle={t("successTitle")} successBody={t("successBody")} />
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center justify-center rounded-full bg-mist px-9 py-4 text-sm font-medium uppercase tracking-widest text-ink transition-[background-color,transform] hover:bg-white active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 md:text-base"
        >
          {status === "sending" ? sendingLabel : t("submit")}
        </button>
        <p className="text-sm text-mist/60">{t("successBody")}</p>
      </div>
    </form>
  );
}
