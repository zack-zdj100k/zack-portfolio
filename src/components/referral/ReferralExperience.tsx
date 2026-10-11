"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReduceMotion } from "@/components/ui/motion";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ConsentField, Honeypot, SelectField, TextArea, TextField } from "@/components/forms/fields";
import { FormStatus } from "@/components/forms/FormStatus";
import { usePublicForm } from "@/components/forms/usePublicForm";
import { formatMoney } from "@/lib/money";

type Category = "WEBSITE" | "APP" | "SOFTWARE";
const CATEGORIES: Category[] = ["WEBSITE", "APP", "SOFTWARE"];

export type PublicOffer = {
  id: string;
  status: "DRAFT" | "PUBLISHED";
  country: string;
  currency: string;
  reward: number;
  /** Empty = every project category. */
  categories: Category[];
  minProjectValue: number | null;
  eligibility: string;
  payoutConditions: string;
  terms: string;
};

export function ReferralExperience({
  offers,
  countries,
  defaultCountry,
}: {
  offers: PublicOffer[];
  countries: { code: string; name: string }[];
  defaultCountry: string | null;
}) {
  const t = useTranslations("referral");
  const tp = useTranslations("projects");
  const tNav = useTranslations("nav");
  const tPricing = useTranslations("pricing");
  const locale = useLocale();
  const reduce = useReduceMotion();
  const [country, setCountry] = useState(countries.some((c) => c.code === defaultCountry) ? defaultCountry! : "");
  // Only the offers configured for this exact country; there is no "everyone else" fallback.
  const applicable = useMemo(() => (country ? offers.filter((o) => o.country === country) : []), [country, offers]);
  const covered = useMemo(
    () => (applicable.some((o) => o.categories.length === 0) ? CATEGORIES : CATEGORIES.filter((c) => applicable.some((o) => o.categories.includes(c)))),
    [applicable],
  );
  const { status, errors, formError, onSubmit, sendingLabel } = usePublicForm("/api/referrals", { emailOrPhone: ["referrerEmail", "referrerPhone"] });

  return (
    <div className="flex flex-col gap-14">
      <div className="max-w-md">
        <SelectField
          name="country-picker"
          label={t("countryLabel")}
          hint={t("countryHint")}
          placeholder={t("countryPlaceholder")}
          value={country}
          onChange={setCountry}
          options={countries.map((c) => ({ value: c.code, label: c.name }))}
        />
      </div>

      <div aria-live="polite">
        <AnimatePresence mode="wait">
          {country && (
            <motion.div
              key={country}
              initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {applicable.length === 0 ? (
                <p className="rounded-[28px] border border-line bg-ink-2 p-8 text-lg text-mist/80">
                  {t("noOffer")}{" "}
                  <Link href="/contact" className="text-mist underline decoration-ice/50 underline-offset-4">
                    {tNav("contact")}
                  </Link>
                </p>
              ) : (
                <div className="grid gap-4">
                  {applicable.map((o) => (
                    <div key={o.id} className="overflow-hidden rounded-[32px] bg-mist p-8 text-ink md:p-12">
                      {o.status === "DRAFT" && (
                        <span className="mb-4 inline-block rounded-full border border-ink/40 px-3 py-0.5 text-xs uppercase tracking-wider">{tPricing("draft")}</span>
                      )}
                      <p className="text-[clamp(2.2rem,6vw,5rem)] font-black uppercase leading-[0.95] tracking-tight">
                        {t("rewardHeadline", { amount: formatMoney(o.reward, o.currency, locale) })}
                      </p>
                      <p className="mt-3 text-lg text-ink/75">{t("rewardPerProject")}</p>
                      <p className="mt-1 text-ink/75">
                        {t("rewardFor", {
                          category: o.categories.length ? o.categories.map((c) => tp(`category.${c}`)).join(" · ") : t("anyProject"),
                        })}
                      </p>
                      {o.minProjectValue !== null && (
                        <p className="mt-1 text-ink/75">{t("minValue", { amount: formatMoney(o.minProjectValue, o.currency, locale) })}</p>
                      )}
                      <div className="mt-8 grid gap-8 border-t border-ink/15 pt-8 md:grid-cols-3">
                        {(
                          [
                            ["eligibility", o.eligibility],
                            ["whenEarned", o.payoutConditions],
                            ["terms", o.terms],
                          ] as const
                        )
                          .filter(([, text]) => text)
                          .map(([key, text]) => (
                            <div key={key}>
                              <h3 className="mb-2 font-bold uppercase">{t(key)}</h3>
                              <p className="whitespace-pre-line leading-relaxed text-ink/80">{text}</p>
                            </div>
                          ))}
                      </div>
                      <p className="mt-8 text-sm text-ink/65">{t("notGuaranteed")}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {country && applicable.length > 0 && (
        <form onSubmit={onSubmit} noValidate className="relative flex flex-col gap-8 rounded-[32px] border border-line bg-ink-2/60 p-6 sm:p-8 md:p-10" aria-labelledby="referral-form-title">
          <h2 id="referral-form-title" className="text-2xl font-bold uppercase text-mist md:text-3xl">
            {t("formTitle")}
          </h2>
          <Honeypot />
          <input type="hidden" name="referrerCountry" value={country} />
          <fieldset className="flex flex-col gap-6">
            <legend className="mb-4 text-sm uppercase tracking-widest text-mist/60">{t("you")}</legend>
            <TextField name="referrerName" label={t("referrerName")} autoComplete="name" required maxLength={120} error={errors.referrerName} />
            <div className="grid gap-6 sm:grid-cols-2">
              <TextField name="referrerEmail" type="email" label={t("referrerEmail")} autoComplete="email" maxLength={200} error={errors.referrerEmail} dir="ltr" describedBy="referrer-contact-hint" />
              <TextField name="referrerPhone" type="tel" label={t("referrerPhone")} autoComplete="tel" maxLength={30} error={errors.referrerPhone} dir="ltr" describedBy="referrer-contact-hint" />
            </div>
            <p id="referrer-contact-hint" className="-mt-3 text-sm text-mist/60">
              {t("contactHint")}
            </p>
          </fieldset>
          <fieldset className="flex flex-col gap-6">
            <legend className="mb-4 text-sm uppercase tracking-widest text-mist/60">{t("them")}</legend>
            <div className="grid gap-6 sm:grid-cols-2">
              <TextField name="clientName" label={t("clientName")} required maxLength={160} error={errors.clientName} />
              <TextField name="clientContact" label={t("clientContact")} required maxLength={200} error={errors.clientContact} dir="ltr" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <SelectField
                name="clientCountry"
                label={t("clientCountry")}
                placeholder="-"
                defaultValue={country}
                options={countries.map((c) => ({ value: c.code, label: c.name }))}
                error={errors.clientCountry}
              />
              <SelectField
                name="projectCategory"
                label={t("projectCategory")}
                required
                placeholder="-"
                options={covered.map((c) => ({ value: c, label: tp(`category.${c}`) }))}
                error={errors.projectCategory}
              />
            </div>
            <TextArea name="message" label={t("message")} rows={4} maxLength={3000} error={errors.message} />
          </fieldset>
          <ConsentField name="consent" label={t("consent")} error={errors.consent} />
          <FormStatus status={status} error={formError} successTitle={t("successTitle")} successBody={t("successBody")} />
          <div>
            <button
              type="submit"
              disabled={status === "sending"}
              className="inline-flex items-center justify-center rounded-full bg-mist px-9 py-4 text-sm font-medium uppercase tracking-widest text-ink transition-[background-color,transform] hover:bg-white active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 md:text-base"
            >
              {status === "sending" ? sendingLabel : t("submit")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
