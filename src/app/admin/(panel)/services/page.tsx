import type { Metadata } from "next";
import { prisma } from "@/server/db";
import { createPackage, createService, deletePackage, deletePrice, deleteService, savePackage, savePrice, saveService } from "@/server/actions/services";
import { CATEGORY_OPTIONS, Card, Checkbox, Flash, Input, LocaleTabs, PageTitle, Select, STATUS_OPTIONS, StatusBadge, Textarea } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/buttons";
import { aggregateStates, editLocale, moneyInput } from "@/components/admin/params";
import { dir, localeNames } from "@/lib/i18n/locales";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = { title: "Services & pricing" };

export default async function ServicesAdmin({ searchParams }: PageProps<"/admin/services">) {
  const sp = await searchParams;
  const locale = editLocale(sp);
  const [services, packages] = await Promise.all([
    prisma.service.findMany({
      orderBy: { sortOrder: "asc" },
      include: { translations: true, examples: { orderBy: { sortOrder: "asc" }, include: { translations: true } } },
    }),
    prisma.pricingPackage.findMany({ orderBy: { sortOrder: "asc" }, include: { translations: true, prices: { orderBy: { market: "asc" } } } }),
  ]);
  const allTranslations = [...services.flatMap((s) => s.translations), ...packages.flatMap((p) => p.translations)];
  const states = aggregateStates(allTranslations);

  return (
    <div className="flex flex-col gap-8">
      <PageTitle
        title="Services & pricing"
        description="Both appear on one public page. Packages stay hidden until you publish them, so you can prepare prices safely."
      />
      <Flash ok={sp.ok} error={sp.error} />
      <LocaleTabs basePath="/admin/services" current={locale} states={states} />
      <p className="-mt-4 text-sm text-mist/60">
        Text fields below are in <strong className="text-mist">{localeNames[locale]}</strong>. Numbers, prices and status are shared by all languages.
      </p>

      <Card title="Services">
        <div className="flex flex-col gap-4">
          {services.map((s) => {
            const tr = s.translations.find((t) => t.locale === locale);
            const en = s.translations.find((t) => t.locale === "en");
            const examples = s.examples.map((e) => (e.translations.find((t) => t.locale === locale) ?? e.translations.find((t) => t.locale === "en"))?.label ?? "");
            return (
              <form key={`${s.id}-${locale}`} action={saveService} className="grid gap-4 rounded-xl border border-line p-4 md:grid-cols-4">
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="locale" value={locale} />
                <Input label="Name" name="name" defaultValue={tr?.name ?? en?.name} required className="md:col-span-2" dir={dir(locale)} />
                <Select label="Type" name="category" options={CATEGORY_OPTIONS} defaultValue={s.category} />
                <Select label="Visibility" name="status" options={STATUS_OPTIONS} defaultValue={s.status} />
                <Textarea label="Description" name="description" defaultValue={tr?.description ?? en?.description} rows={3} className="md:col-span-2" dir={dir(locale)} />
                <Textarea
                  label="Examples (one per line)"
                  name="examples"
                  defaultValue={examples.join("\n")}
                  rows={3}
                  className="md:col-span-2"
                  dir={dir(locale)}
                  hint={locale === "en" ? "English sets how many examples there are." : "Keep the same order as English."}
                />
                <Input label="Order" name="sortOrder" type="number" defaultValue={s.sortOrder} min={0} max={999} />
                <div className="flex flex-wrap items-end gap-3 md:col-span-3">
                  <Checkbox label="Translation reviewed" name="reviewed" defaultChecked={tr?.reviewed ?? locale === "en"} />
                  <SubmitButton>Save</SubmitButton>
                  <SubmitButton variant="danger" formAction={deleteService} confirm="Delete this service?">
                    Delete
                  </SubmitButton>
                </div>
              </form>
            );
          })}
          <form action={createService} className="grid gap-4 rounded-xl border border-dashed border-line p-4 md:grid-cols-[2fr_1fr_auto] md:items-end">
            <Input label="New service name (English)" name="name" required />
            <Select label="Type" name="category" options={CATEGORY_OPTIONS} defaultValue="WEBSITE" />
            <SubmitButton variant="secondary">Add service</SubmitButton>
          </form>
        </div>
      </Card>

      <Card
        title="Pricing packages"
        description='Prices are set per country ("DZ" for Algeria, "*" for every other country). The minimum is the lowest price a client can choose on the budget slider; the maximum is the top of the slider; the step is how much each slider notch adds. Leave the maximum empty for a "from" price (no slider for that package).'
      >
        <div className="flex flex-col gap-6">
          {packages.map((p) => {
            const tr = p.translations.find((t) => t.locale === locale);
            const en = p.translations.find((t) => t.locale === "en");
            return (
              <div key={`${p.id}-${locale}`} className="flex flex-col gap-4 rounded-xl border border-line p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-bold">{en?.name}</h3>
                  <StatusBadge status={p.status} />
                </div>
                <form action={savePackage} className="grid gap-4 md:grid-cols-4">
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="locale" value={locale} />
                  <Input label="Name" name="name" defaultValue={tr?.name ?? en?.name} required className="md:col-span-2" dir={dir(locale)} />
                  <Select
                    label="Type"
                    name="category"
                    defaultValue={p.category ?? ""}
                    options={[{ value: "", label: "Any (custom)" }, ...CATEGORY_OPTIONS]}
                  />
                  <Select label="Visibility" name="status" options={STATUS_OPTIONS} defaultValue={p.status} />
                  <Textarea label="Description" name="description" defaultValue={tr?.description ?? en?.description} rows={2} className="md:col-span-2" dir={dir(locale)} />
                  <Textarea
                    label="Included (one per line)"
                    name="features"
                    defaultValue={(tr ?? en)?.features.join("\n")}
                    rows={4}
                    className="md:col-span-2"
                    dir={dir(locale)}
                  />
                  <Textarea
                    label="Optional additions that can change the price (one per line)"
                    name="addOns"
                    defaultValue={(tr ?? en)?.addOns.join("\n")}
                    rows={3}
                    className="md:col-span-2"
                    dir={dir(locale)}
                    hint="For example: extra pages, online payment, more languages, custom design. Shown under the package; no prices."
                  />
                  <Input label="Delivery from (weeks)" name="deliveryWeeksMin" type="number" defaultValue={p.deliveryWeeksMin} min={1} max={104} />
                  <Input label="Delivery to (weeks)" name="deliveryWeeksMax" type="number" defaultValue={p.deliveryWeeksMax} min={1} max={104} />
                  <Input label="Order" name="sortOrder" type="number" defaultValue={p.sortOrder} min={0} max={999} />
                  <div className="flex flex-col justify-end gap-2">
                    <Checkbox label="Highlight this package" name="highlighted" defaultChecked={p.highlighted} />
                    <Checkbox label="Translation reviewed" name="reviewed" defaultChecked={tr?.reviewed ?? locale === "en"} />
                  </div>
                  <div className="flex flex-wrap gap-3 md:col-span-4">
                    <SubmitButton>Save package</SubmitButton>
                    <SubmitButton variant="danger" formAction={deletePackage} confirm="Delete this package and its prices?">
                      Delete package
                    </SubmitButton>
                  </div>
                </form>

                <div className="rounded-lg bg-ink-3 p-3">
                  <p className="mb-2 text-sm font-medium">Prices</p>
                  <ul className="mb-3 flex flex-col gap-2">
                    {p.prices.map((price) => (
                      <li key={price.id} className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="w-24 text-mist/60">{price.market === "*" ? "Other countries" : price.market}</span>
                        <span className="text-mist">
                          {price.stepMinor !== null && <span className="me-2 text-mist/60">step {formatMoney(Number(price.stepMinor), price.currency, "en")}</span>}
                          {price.maxMinor === null
                            ? `From ${formatMoney(Number(price.minMinor), price.currency, "en")}`
                            : `${formatMoney(Number(price.minMinor), price.currency, "en")} - ${formatMoney(Number(price.maxMinor), price.currency, "en")}`}
                        </span>
                        <form action={deletePrice}>
                          <input type="hidden" name="id" value={price.id} />
                          <SubmitButton variant="danger" confirm="Remove this price?" className="h-8 px-3 text-xs">
                            Remove
                          </SubmitButton>
                        </form>
                      </li>
                    ))}
                  </ul>
                  <form action={savePrice} className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:items-end">
                    <input type="hidden" name="packageId" value={p.id} />
                    <Input label="Country" name="market" defaultValue={p.prices[0]?.market ?? "DZ"} maxLength={2} hint="DZ, FR... or *" />
                    <Input label="Currency" name="currency" defaultValue={p.prices[0]?.currency ?? "DZD"} maxLength={3} />
                    <Input label="Minimum price" name="min" defaultValue={moneyInput(p.prices[0]?.minMinor)} required placeholder="40000" hint="Lowest the client can pick" />
                    <Input label="Maximum (optional)" name="max" defaultValue={moneyInput(p.prices[0]?.maxMinor)} placeholder="70000" hint="Top of the slider" />
                    <Input label="Slider step (optional)" name="step" defaultValue={moneyInput(p.prices[0]?.stepMinor)} placeholder="5000" hint="Empty = 20 steps" />
                    <SubmitButton variant="secondary" className="whitespace-nowrap">Save price</SubmitButton>
                  </form>
                </div>
              </div>
            );
          })}
          <form action={createPackage} className="grid gap-4 rounded-xl border border-dashed border-line p-4 md:grid-cols-[1fr_auto] md:items-end">
            <Input label="New package name (English)" name="name" required />
            <SubmitButton variant="secondary">Add package</SubmitButton>
          </form>
        </div>
      </Card>
    </div>
  );
}
