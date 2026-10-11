import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/server/db";
import { createProcessStep, deleteProcessStep, moveProcessStep, removeProcessImage, saveProcessStep, uploadProcessImage } from "@/server/actions/process";
import { PROCESS_ICON_NAMES } from "@/components/about/process-icons";
import { Badge, Card, Checkbox, Flash, Input, LocaleTabs, PageTitle, Select, Textarea } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/buttons";
import { MoveButtons } from "@/components/admin/MoveButtons";
import { aggregateStates, editLocale } from "@/components/admin/params";
import { dir, localeNames } from "@/lib/i18n/locales";

export const metadata: Metadata = { title: "How I work" };

const ICON_OPTIONS = [{ value: "", label: "No icon (number only)" }, ...PROCESS_ICON_NAMES.map((n) => ({ value: n, label: n }))];

export default async function ProcessAdmin({ searchParams }: PageProps<"/admin/process">) {
  const sp = await searchParams;
  const locale = editLocale(sp);
  const steps = await prisma.processStep.findMany({ orderBy: { sortOrder: "asc" }, include: { translations: true, media: true } });

  return (
    <div className="flex flex-col gap-8">
      <PageTitle
        title="How I work"
        description="The process steps shown as pinned notes on Home and About, in this order. Hidden steps stay here but don't appear on the site."
      />
      <Flash ok={sp.ok} error={sp.error} />
      <LocaleTabs basePath="/admin/process" current={locale} states={aggregateStates(steps.flatMap((s) => s.translations))} />

      {steps.map((s, i) => {
        const tr = s.translations.find((t) => t.locale === locale);
        const en = s.translations.find((t) => t.locale === "en");
        return (
          <Card
            key={`${s.id}-${locale}`}
            title={`${String(i + 1).padStart(2, "0")} · ${en?.title ?? "Untitled"}`}
            description={`Text edited in ${localeNames[locale]}.`}
            actions={
              <div className="flex items-center gap-3">
                {!s.visible && <Badge tone="warn">Hidden</Badge>}
                <MoveButtons action={moveProcessStep} id={s.id} locale={locale} first={i === 0} last={i === steps.length - 1} label="step" />
              </div>
            }
          >
            <form action={saveProcessStep} className="grid gap-4 md:grid-cols-[2fr_1fr]">
              <input type="hidden" name="id" value={s.id} />
              <input type="hidden" name="locale" value={locale} />
              <Input label={`Title (${localeNames[locale]})`} name="title" defaultValue={tr?.title ?? en?.title} required maxLength={80} dir={dir(locale)} />
              <Select label="Icon" name="icon" options={ICON_OPTIONS} defaultValue={s.icon ?? ""} />
              <Textarea
                label={`Description (${localeNames[locale]})`}
                name="description"
                defaultValue={tr?.description ?? en?.description}
                required
                rows={3}
                maxLength={600}
                dir={dir(locale)}
                className="md:col-span-2"
              />
              <div className="flex flex-wrap items-center gap-4 md:col-span-2">
                <Checkbox label="Shown on the site" name="visible" defaultChecked={s.visible} />
                <Checkbox label="Translation reviewed" name="reviewed" defaultChecked={tr?.reviewed ?? locale === "en"} />
                <SubmitButton>Save step</SubmitButton>
                <SubmitButton variant="danger" formAction={deleteProcessStep} confirm="Delete this step in every language?">
                  Delete
                </SubmitButton>
              </div>
            </form>
            <div className="mt-6 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-end">
              {s.media && (
                <div className="relative aspect-[16/10] w-48 shrink-0 overflow-hidden rounded-lg border border-line">
                  <Image src={s.media.url} alt="" fill sizes="192px" className="object-cover" />
                </div>
              )}
              <form action={uploadProcessImage} className="flex flex-1 flex-wrap items-end gap-3">
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="locale" value={locale} />
                <Input label={s.media ? "Replace image (optional)" : "Image (optional)"} name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required className="min-w-0 flex-1" />
                <Input label="Image description (English)" name="alt" maxLength={200} className="min-w-0 flex-1" />
                <SubmitButton variant="secondary">Upload</SubmitButton>
              </form>
              {s.media && (
                <form action={removeProcessImage}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="locale" value={locale} />
                  <SubmitButton variant="danger">Remove image</SubmitButton>
                </form>
              )}
            </div>
          </Card>
        );
      })}

      <Card title="New step" description="Added at the end in English; translate it with the language tabs afterwards.">
        <form action={createProcessStep} className="grid gap-4">
          <input type="hidden" name="locale" value={locale} />
          <Input label="Title (English)" name="title" required maxLength={80} />
          <Textarea label="Description (English)" name="description" required rows={3} maxLength={600} />
          <div>
            <SubmitButton variant="secondary">Add step</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
