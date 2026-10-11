import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/server/db";
import { createAiService, deleteAiService, moveAiService, removeAiImage, saveAiService, uploadAiImage } from "@/server/actions/ai";
import { AI_ICON_NAMES } from "@/components/ai/ai-icons";
import { Badge, Card, Checkbox, Flash, Input, LocaleTabs, PageTitle, Select, STATUS_OPTIONS, StatusBadge, Textarea } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/buttons";
import { MoveButtons } from "@/components/admin/MoveButtons";
import { aggregateStates, editLocale } from "@/components/admin/params";
import { dir, localeNames } from "@/lib/i18n/locales";

export const metadata: Metadata = { title: "AI services" };

const AVAILABILITY = [
  { value: "AVAILABLE", label: "Available now" },
  { value: "COMING_SOON", label: "Coming soon" },
  { value: "HIDDEN", label: "Hidden" },
];
const ICONS = [{ value: "", label: "Default (sparkles)" }, ...AI_ICON_NAMES.map((n) => ({ value: n, label: n }))];

export default async function AiServicesAdmin({ searchParams }: PageProps<"/admin/ai-services">) {
  const sp = await searchParams;
  const locale = editLocale(sp);
  const services = await prisma.aiService.findMany({
    orderBy: { sortOrder: "asc" },
    include: { translations: true, media: true, _count: { select: { inquiries: { where: { kind: "WAITLIST" } } } } },
  });

  return (
    <div className="flex flex-col gap-8">
      <PageTitle
        title="AI services"
        description="Shown on Home and Services & Pricing in two separate groups: Available now, and Coming soon. Coming soon items never show a price or a start button. Wording that promises returns, profits or guaranteed results is refused."
      />
      <Flash ok={sp.ok} error={sp.error} />
      <LocaleTabs basePath="/admin/ai-services" current={locale} states={aggregateStates(services.flatMap((s) => s.translations))} />

      {services.map((s, i) => {
        const tr = s.translations.find((t) => t.locale === locale);
        const en = s.translations.find((t) => t.locale === "en");
        return (
          <Card
            key={`${s.id}-${locale}`}
            title={en?.title ?? s.key}
            description={
              <>
                {AVAILABILITY.find((a) => a.value === s.status)?.label}. Texts edited in {localeNames[locale]}.
                {s._count.inquiries > 0 && (
                  <>
                    {" "}
                    <Link href="/admin/inquiries?view=waitlist" className="underline underline-offset-4">
                      {s._count.inquiries} on the waitlist
                    </Link>
                    .
                  </>
                )}
              </>
            }
            actions={
              <div className="flex items-center gap-3">
                {s.status === "HIDDEN" && <Badge tone="warn">Hidden</Badge>}
                <StatusBadge status={s.publishStatus} />
                <MoveButtons action={moveAiService} id={s.id} locale={locale} first={i === 0} last={i === services.length - 1} label="service" />
              </div>
            }
          >
            <form action={saveAiService} className="grid gap-4 md:grid-cols-4">
              <input type="hidden" name="id" value={s.id} />
              <input type="hidden" name="locale" value={locale} />
              <Input label={`Title (${localeNames[locale]})`} name="title" defaultValue={tr?.title ?? en?.title} required maxLength={120} dir={dir(locale)} className="md:col-span-2" />
              <Select label="Availability" name="status" options={AVAILABILITY} defaultValue={s.status} />
              <Select label="Visibility" name="publishStatus" options={STATUS_OPTIONS} defaultValue={s.publishStatus} />
              <Textarea
                label={`Description (${localeNames[locale]})`}
                name="description"
                defaultValue={tr?.description ?? en?.description}
                rows={3}
                maxLength={1200}
                dir={dir(locale)}
                className="md:col-span-4"
                hint="What you build, for whom. No promises of results."
              />
              <Select label="Icon" name="icon" options={ICONS} defaultValue={s.icon ?? ""} />
              <Select
                label="Button (available services)"
                name="cta"
                options={[
                  { value: "CONTACT", label: "Contact button" },
                  { value: "NONE", label: "No button" },
                ]}
                defaultValue={s.cta === "NONE" ? "NONE" : "CONTACT"}
              />
              <Input label={`Button text (${localeNames[locale]})`} name="ctaLabel" defaultValue={tr?.ctaLabel} maxLength={60} dir={dir(locale)} hint="Empty = “Talk about it”." className="md:col-span-2" />
              <div className="flex flex-col gap-2 md:col-span-4">
                <Checkbox label="Waitlist form (Coming soon items only)" name="waitlistEnabled" defaultChecked={s.waitlistEnabled} hint="Visitors leave name, email and country; sign-ups arrive in Inquiries → Waitlist." />
                <Checkbox label="Finance or trading service" name="financial" defaultChecked={s.financial} hint="Adds the “no financial advice, no promised returns” note." />
                <Checkbox label="Translation reviewed" name="reviewed" defaultChecked={tr?.reviewed ?? locale === "en"} />
              </div>
              <div className="flex flex-wrap gap-3 md:col-span-4">
                <SubmitButton>Save service</SubmitButton>
                <SubmitButton variant="danger" formAction={deleteAiService} confirm="Delete this service in every language?">
                  Delete
                </SubmitButton>
              </div>
            </form>
            <div className="mt-6 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-end">
              {s.media && (
                <div className="relative aspect-[16/9] w-48 shrink-0 overflow-hidden rounded-lg border border-line">
                  <Image src={s.media.url} alt="" fill sizes="192px" className="object-cover" />
                </div>
              )}
              <form action={uploadAiImage} className="flex flex-1 flex-wrap items-end gap-3">
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="locale" value={locale} />
                <Input label={s.media ? "Replace visual" : "Visual (optional)"} name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required className="min-w-0 flex-1" />
                <Input label="Visual description (English)" name="alt" maxLength={200} className="min-w-0 flex-1" />
                <SubmitButton variant="secondary">Upload</SubmitButton>
              </form>
              {s.media && (
                <form action={removeAiImage}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="locale" value={locale} />
                  <SubmitButton variant="danger">Remove visual</SubmitButton>
                </form>
              )}
            </div>
          </Card>
        );
      })}

      <Card title="New AI service" description="Starts hidden and as a draft.">
        <form action={createAiService} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="locale" value={locale} />
          <Input label="Title (English)" name="title" required maxLength={120} className="min-w-0 flex-1" />
          <SubmitButton variant="secondary">Add service</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
