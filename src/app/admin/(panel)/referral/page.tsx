import type { Metadata } from "next";
import { prisma } from "@/server/db";
import { createOffer, deleteOffer, saveOffer } from "@/server/actions/referral";
import { CATEGORY_OPTIONS, Card, Checkbox, Flash, Input, LocaleTabs, PageTitle, Select, STATUS_OPTIONS, StatusBadge, Textarea } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/buttons";
import { aggregateStates, editLocale, moneyInput } from "@/components/admin/params";
import { dir, localeNames } from "@/lib/i18n/locales";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = { title: "Referral offers" };

export default async function ReferralOffersAdmin({ searchParams }: PageProps<"/admin/referral">) {
  const sp = await searchParams;
  const locale = editLocale(sp);
  const offers = await prisma.countryOffer.findMany({ orderBy: [{ sortOrder: "asc" }, { market: "asc" }], include: { translations: true, _count: { select: { referrals: true } } } });

  return (
    <div className="flex flex-col gap-8">
      <PageTitle
        title="Referral offers"
        description='Rewards per country. Visitors pick their country and see the offer that applies: their country first, otherwise the "*" (all other countries) offer.'
      />
      <Flash ok={sp.ok} error={sp.error} />
      <LocaleTabs basePath="/admin/referral" current={locale} states={aggregateStates(offers.flatMap((o) => o.translations))} />

      {offers.map((o) => {
        const tr = o.translations.find((t) => t.locale === locale);
        const en = o.translations.find((t) => t.locale === "en");
        return (
          <Card
            key={`${o.id}-${locale}`}
            title={`${o.market === "*" ? "All other countries" : o.market}: ${formatMoney(Number(o.rewardMinor), o.currency, "en")}`}
            description={`${o._count.referrals} referral(s) linked. Editing text in ${localeNames[locale]}.`}
            actions={<StatusBadge status={o.status} />}
          >
            <form action={saveOffer} className="grid gap-4 md:grid-cols-4">
              <input type="hidden" name="id" value={o.id} />
              <input type="hidden" name="locale" value={locale} />
              <Input label="Country" name="market" defaultValue={o.market} required maxLength={2} hint='DZ, FR... or "*"' />
              <Input label="Currency" name="currency" defaultValue={o.currency} required maxLength={3} />
              <Input label="Reward" name="reward" defaultValue={moneyInput(o.rewardMinor)} required />
              <Select label="Visibility" name="status" options={STATUS_OPTIONS} defaultValue={o.status} />
              <Select
                label="Project type"
                name="category"
                defaultValue={o.category ?? ""}
                options={[{ value: "", label: "Any project" }, ...CATEGORY_OPTIONS]}
              />
              <Input label="Minimum project value (optional)" name="minProjectValue" defaultValue={moneyInput(o.minProjectValueMinor)} hint="Same currency as the reward." />
              <Input label="Order" name="sortOrder" type="number" defaultValue={o.sortOrder} min={0} max={999} />
              <div />
              <Textarea
                label="When the reward is earned"
                name="whenEarned"
                defaultValue={tr?.whenEarned ?? en?.whenEarned}
                rows={3}
                className="md:col-span-2"
                dir={dir(locale)}
                hint="Be precise: this is what the referrer relies on."
              />
              <Textarea label="Terms" name="terms" defaultValue={tr?.terms ?? en?.terms} rows={3} className="md:col-span-2" dir={dir(locale)} />
              <div className="flex flex-wrap items-center gap-3 md:col-span-4">
                <Checkbox label="Translation reviewed" name="reviewed" defaultChecked={tr?.reviewed ?? locale === "en"} />
                <SubmitButton>Save offer</SubmitButton>
                <SubmitButton variant="danger" formAction={deleteOffer} confirm="Delete this offer? Existing referrals keep their saved reward.">
                  Delete
                </SubmitButton>
              </div>
            </form>
          </Card>
        );
      })}

      <Card title="New offer">
        <form action={createOffer} className="grid gap-4 md:grid-cols-4 md:items-end">
          <Input label="Country" name="market" required maxLength={2} placeholder="DZ or *" />
          <Input label="Currency" name="currency" required maxLength={3} placeholder="DZD" />
          <Input label="Reward" name="reward" required placeholder="10000" />
          <SubmitButton variant="secondary">Add offer (draft)</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
