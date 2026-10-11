import type { Metadata } from "next";
import { prisma } from "@/server/db";
import { deleteSocial, saveSettings, saveSocial } from "@/server/actions/settings";
import { Card, Checkbox, Flash, Input, PageTitle, Select } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/buttons";
import { AccessCodeForm } from "@/components/admin/AccessCodeForm";
import { localeNames, locales } from "@/lib/i18n/locales";

export const metadata: Metadata = { title: "Settings" };

const SOCIAL_OPTIONS = ["GITHUB", "LINKEDIN", "INDEED", "WHATSAPP", "INSTAGRAM", "FACEBOOK", "X", "OTHER"].map((v) => ({
  value: v,
  label: v === "X" ? "X (Twitter)" : v.charAt(0) + v.slice(1).toLowerCase(),
}));

export default async function SettingsAdmin({ searchParams }: PageProps<"/admin/settings">) {
  const sp = await searchParams;
  const [settings, socials] = await Promise.all([
    prisma.siteSettings.findUniqueOrThrow({ where: { id: 1 } }),
    prisma.socialLink.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <PageTitle title="Settings" description="Contact details and links shown in the footer, the contact page and the home page. Also your admin access code." />
      <Flash ok={sp.ok} error={sp.error} />

      <Card title="Contact details" description="WhatsApp and phone are only shown when their box is ticked.">
        <form action={saveSettings} className="grid gap-5 md:grid-cols-2">
          <Input label="Public email" name="contactEmail" type="email" defaultValue={settings.contactEmail} maxLength={200} />
          <Input label="Site address" name="siteUrl" type="url" defaultValue={settings.siteUrl} placeholder="https://zack.dev" hint="Used for sharing previews. Also set NEXT_PUBLIC_SITE_URL on the host." />
          <Input label="Phone" name="phone" type="tel" defaultValue={settings.phone} maxLength={40} placeholder="+213 ..." />
          <Input label="WhatsApp number" name="whatsapp" type="tel" defaultValue={settings.whatsapp} maxLength={40} placeholder="+213 ..." />
          <Checkbox label="Show phone on the site" name="showPhone" defaultChecked={settings.showPhone} />
          <Checkbox label="Show WhatsApp on the site" name="showWhatsapp" defaultChecked={settings.showWhatsapp} />
          <Select
            label="Main language (for search engines)"
            name="defaultLocale"
            defaultValue={settings.defaultLocale}
            options={locales.map((l) => ({ value: l, label: localeNames[l] }))}
            hint="Visitors are sent to their browser's language when available, otherwise English."
          />
          <div className="md:col-span-2">
            <SubmitButton>Save contact details</SubmitButton>
          </div>
        </form>
      </Card>

      <Card title="Social and profile links" description="GitHub, LinkedIn, Indeed and others. Hidden links stay saved but aren't shown.">
        <div className="flex flex-col gap-3">
          {socials.map((s) => (
            <form key={s.id} action={saveSocial} className="grid gap-3 rounded-xl border border-line p-3 md:grid-cols-[160px_1fr_1fr_90px_auto] md:items-end">
              <input type="hidden" name="id" value={s.id} />
              <Select label="Network" name="kind" options={SOCIAL_OPTIONS} defaultValue={s.kind} />
              <Input label="Link" name="url" type="url" defaultValue={s.url} required />
              <Input label="Label (optional)" name="label" defaultValue={s.label} maxLength={60} />
              <Input label="Order" name="sortOrder" type="number" defaultValue={s.sortOrder} min={0} max={999} />
              <div className="flex flex-wrap items-center gap-2">
                <Checkbox label="Shown" name="visible" defaultChecked={s.visible} />
                <SubmitButton variant="secondary">Save</SubmitButton>
                <SubmitButton variant="danger" formAction={deleteSocial} confirm="Remove this link?">
                  Remove
                </SubmitButton>
              </div>
            </form>
          ))}
          <form action={saveSocial} className="grid gap-3 rounded-xl border border-dashed border-line p-3 md:grid-cols-[160px_1fr_1fr_auto] md:items-end">
            <Select label="Network" name="kind" options={SOCIAL_OPTIONS} defaultValue="GITHUB" />
            <Input label="Link" name="url" type="url" required placeholder="https://github.com/..." />
            <Input label="Label (optional)" name="label" maxLength={60} />
            <div className="flex items-center gap-2">
              <input type="hidden" name="visible" value="on" />
              <SubmitButton variant="secondary">Add link</SubmitButton>
            </div>
          </form>
        </div>
      </Card>

      <Card title="Admin access code" description="The only thing the login page asks for. Use 12 characters or more; a short phrase is easy to remember and hard to guess.">
        <AccessCodeForm />
      </Card>
    </div>
  );
}
