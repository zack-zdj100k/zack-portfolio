import type { Metadata } from "next";
import { prisma } from "@/server/db";
import {
  addOfferCountries,
  bulkUpdateOfferCountries,
  createOffer,
  deleteOffer,
  removeOfferCountry,
  saveOffer,
  saveOfferCountry,
} from "@/server/actions/referral";
import { Badge, CATEGORY_OPTIONS, Card, Checkbox, Flash, Input, LocaleTabs, PageTitle, Select, STATUS_OPTIONS, StatusBadge, Textarea } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/buttons";
import { CountryPicker } from "@/components/admin/CountryPicker";
import { aggregateStates, editLocale, moneyInput } from "@/components/admin/params";
import { COUNTRY_REGIONS, countryName, sortedCountries } from "@/lib/countries";
import { dir, localeNames } from "@/lib/i18n/locales";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = { title: "Referral offers" };

function CategoryChecks({ selected }: { selected?: string[] }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-mist/85">Project categories covered</legend>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {CATEGORY_OPTIONS.map((c) => (
          <label key={c.value} className="flex items-center gap-2 text-sm text-mist/85">
            <input type="checkbox" name="categories" value={c.value} defaultChecked={selected?.includes(c.value)} className="size-4 accent-[#bbccd7]" />
            {c.label}
          </label>
        ))}
      </div>
      <p className="mt-1 text-xs text-mist/55">None ticked = every category.</p>
    </fieldset>
  );
}

export default async function ReferralOffersAdmin({ searchParams }: PageProps<"/admin/referral">) {
  const sp = await searchParams;
  const locale = editLocale(sp);
  const offers = await prisma.referralOffer.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      translations: true,
      countries: { orderBy: { country: "asc" }, include: { translations: true, _count: { select: { referrals: true } } } },
    },
  });
  const all = sortedCountries("en");
  const states = aggregateStates([...offers.flatMap((o) => o.translations)]);

  return (
    <div className="flex flex-col gap-8">
      <PageTitle
        title="Referral offers"
        description="Each offer applies only to the countries you add to it. Visitors pick their country and see that country's offer, in its currency. A country that isn't listed sees “no offer in your country yet”. Sharing a currency (e.g. the euro) never makes a country eligible by itself."
      />
      <Flash ok={sp.ok} error={sp.error} />
      <LocaleTabs basePath="/admin/referral" current={locale} states={states} />

      {offers.map((o) => {
        const tr = o.translations.find((t) => t.locale === locale);
        const en = o.translations.find((t) => t.locale === "en");
        const live = o.countries.filter((c) => c.status === "PUBLISHED" && c.available).length;
        return (
          <Card
            key={`${o.id}-${locale}`}
            title={o.name}
            description={`${o.countries.length} countr${o.countries.length === 1 ? "y" : "ies"}, ${o.status === "PUBLISHED" ? live : 0} live. Texts edited in ${localeNames[locale]}.`}
            actions={<StatusBadge status={o.status} />}
          >
            <form action={saveOffer} className="grid gap-4 md:grid-cols-4">
              <input type="hidden" name="id" value={o.id} />
              <input type="hidden" name="locale" value={locale} />
              <Input label="Internal name" name="name" defaultValue={o.name} required maxLength={120} className="md:col-span-2" hint="Admin only." />
              <Select label="Offer visibility" name="status" options={STATUS_OPTIONS} defaultValue={o.status} />
              <Input label="Order" name="sortOrder" type="number" defaultValue={o.sortOrder} min={0} max={999} />
              <Textarea
                label={`Who can take part (${localeNames[locale]})`}
                name="eligibility"
                defaultValue={tr?.eligibility ?? en?.eligibility}
                rows={3}
                dir={dir(locale)}
                className="md:col-span-2"
                hint="Eligibility conditions. Optional."
              />
              <Textarea
                label={`When the reward is paid (${localeNames[locale]})`}
                name="payoutConditions"
                defaultValue={tr?.payoutConditions ?? en?.payoutConditions}
                rows={3}
                dir={dir(locale)}
                className="md:col-span-2"
                hint="Payout conditions. Be precise: referrers rely on this."
              />
              <Textarea label={`Terms (${localeNames[locale]})`} name="terms" defaultValue={tr?.terms ?? en?.terms} rows={3} dir={dir(locale)} className="md:col-span-4" />
              <div className="flex flex-wrap items-center gap-3 md:col-span-4">
                <Checkbox label="Translation reviewed" name="reviewed" defaultChecked={tr?.reviewed ?? locale === "en"} />
                <SubmitButton>Save offer</SubmitButton>
                <SubmitButton variant="danger" formAction={deleteOffer} confirm="Delete this offer and all its countries? Existing referrals keep their saved reward.">
                  Delete offer
                </SubmitButton>
              </div>
            </form>

            <div className="mt-8 border-t border-line pt-6">
              <h3 className="mb-1 font-bold text-mist">Eligible countries</h3>
              <p className="mb-4 text-sm text-mist/60">
                A country is live when the offer and the country are both published and the country is available. Texts above apply to every country unless a country has its own.
              </p>
              {o.countries.length === 0 ? (
                <p className="mb-4 rounded-xl border border-amber-300/30 bg-amber-300/5 px-4 py-3 text-sm text-mist/80">No countries yet: nobody can see this offer.</p>
              ) : (
                <ul className="mb-6 flex flex-col gap-2">
                  {o.countries.map((c) => {
                    const ct = c.translations.find((t) => t.locale === locale);
                    return (
                      <li key={`${c.id}-${locale}`}>
                        <details className="group rounded-xl border border-line">
                          <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 px-4 py-3 text-sm">
                            <span className="w-8 font-bold text-mist">{c.country}</span>
                            <span className="min-w-0 flex-1 truncate text-mist/80">{countryName(c.country, "en")}</span>
                            <span className="text-mist">{formatMoney(Number(c.rewardMinor), c.currency, "en")}</span>
                            <span className="text-mist/60">{c.categories.length ? c.categories.map((x) => x.toLowerCase()).join(", ") : "all categories"}</span>
                            {!c.available && <Badge tone="warn">Unavailable</Badge>}
                            <StatusBadge status={c.status} />
                            <span className="text-xs text-mist/50">{c._count.referrals} referral(s)</span>
                          </summary>
                          <form action={saveOfferCountry} className="grid gap-4 border-t border-line p-4 md:grid-cols-4">
                            <input type="hidden" name="id" value={c.id} />
                            <input type="hidden" name="locale" value={locale} />
                            <Input label="Currency" name="currency" defaultValue={c.currency} required maxLength={3} />
                            <Input label="Reward" name="reward" defaultValue={moneyInput(c.rewardMinor)} required />
                            <Input label="Minimum project value (optional)" name="minProjectValue" defaultValue={moneyInput(c.minProjectValueMinor)} hint="Same currency." />
                            <Select label="Country visibility" name="status" options={STATUS_OPTIONS} defaultValue={c.status} />
                            <div className="md:col-span-3">
                              <CategoryChecks selected={c.categories} />
                            </div>
                            <div className="flex items-end pb-1">
                              <Checkbox label="Offer available in this country" name="available" defaultChecked={c.available} hint="Untick to pause without deleting." />
                            </div>
                            <Textarea
                              label={`Own eligibility text (${localeNames[locale]})`}
                              name="eligibility"
                              defaultValue={ct?.eligibility}
                              rows={2}
                              dir={dir(locale)}
                              className="md:col-span-2"
                              hint="Empty = the offer's text."
                            />
                            <Textarea
                              label={`Own payout conditions (${localeNames[locale]})`}
                              name="payoutConditions"
                              defaultValue={ct?.payoutConditions}
                              rows={2}
                              dir={dir(locale)}
                              className="md:col-span-2"
                              hint="Empty = the offer's text."
                            />
                            <Textarea label={`Own terms (${localeNames[locale]})`} name="terms" defaultValue={ct?.terms} rows={2} dir={dir(locale)} className="md:col-span-4" hint="Empty = the offer's text." />
                            <div className="flex flex-wrap items-center gap-3 md:col-span-4">
                              <Checkbox label="Translation reviewed" name="reviewed" defaultChecked={ct?.reviewed ?? locale === "en"} />
                              <SubmitButton>Save {c.country}</SubmitButton>
                              <SubmitButton variant="danger" formAction={removeOfferCountry} confirm={`Remove ${c.country} from this offer?`}>
                                Remove country
                              </SubmitButton>
                            </div>
                          </form>
                        </details>
                      </li>
                    );
                  })}
                </ul>
              )}

              <details className="mb-4 rounded-xl border border-dashed border-line">
                <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-mist">Add countries</summary>
                <form action={addOfferCountries} className="flex flex-col gap-4 border-t border-line p-4">
                  <input type="hidden" name="offerId" value={o.id} />
                  <input type="hidden" name="locale" value={locale} />
                  <CountryPicker name="countries" countries={all} regions={COUNTRY_REGIONS} exclude={o.countries.map((c) => c.country)} />
                  <div className="grid gap-4 md:grid-cols-3">
                    <Input label="Currency" name="currency" required maxLength={3} placeholder="EUR" />
                    <Input label="Reward" name="reward" required placeholder="100" />
                    <Input label="Minimum project value (optional)" name="minProjectValue" />
                  </div>
                  <CategoryChecks />
                  <div>
                    <SubmitButton variant="secondary">Add ticked countries (as drafts)</SubmitButton>
                  </div>
                </form>
              </details>

              {o.countries.length > 1 && (
                <details className="rounded-xl border border-dashed border-line">
                  <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-mist">Change several countries at once</summary>
                  <form action={bulkUpdateOfferCountries} className="flex flex-col gap-4 border-t border-line p-4">
                    <input type="hidden" name="offerId" value={o.id} />
                    <input type="hidden" name="locale" value={locale} />
                    <fieldset>
                      <legend className="mb-2 text-sm font-medium text-mist/85">Countries to change</legend>
                      <div className="flex flex-wrap gap-x-5 gap-y-2">
                        {o.countries.map((c) => (
                          <label key={c.id} className="flex items-center gap-2 text-sm text-mist/85">
                            <input type="checkbox" name="countries" value={c.country} className="size-4 accent-[#bbccd7]" />
                            {c.country}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <div className="grid gap-4 md:grid-cols-4">
                      <Input label="Currency" name="currency" maxLength={3} hint="Empty = unchanged." />
                      <Input label="Reward" name="reward" hint="Empty = unchanged." />
                      <Select
                        label="Visibility"
                        name="status"
                        options={[{ value: "", label: "Unchanged" }, ...STATUS_OPTIONS]}
                        defaultValue=""
                      />
                      <Select
                        label="Available"
                        name="available"
                        options={[
                          { value: "", label: "Unchanged" },
                          { value: "yes", label: "Available" },
                          { value: "no", label: "Paused" },
                        ]}
                        defaultValue=""
                      />
                    </div>
                    <div className="flex flex-wrap items-end gap-6">
                      <CategoryChecks />
                      <Checkbox label="Also set the categories above" name="setCategories" />
                    </div>
                    <div>
                      <SubmitButton variant="secondary">Apply to ticked countries</SubmitButton>
                    </div>
                  </form>
                </details>
              )}
            </div>
          </Card>
        );
      })}

      <Card title="New offer" description="Create the offer, then add its eligible countries.">
        <form action={createOffer} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="locale" value={locale} />
          <Input label="Internal name" name="name" required maxLength={120} placeholder="e.g. Europe 2026" className="min-w-0 flex-1" />
          <SubmitButton variant="secondary">Add offer (draft)</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
