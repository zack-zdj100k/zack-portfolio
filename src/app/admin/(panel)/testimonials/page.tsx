import type { Metadata } from "next";
import { prisma } from "@/server/db";
import { deleteTestimonial, saveTestimonial } from "@/server/actions/inbox";
import { Card, Checkbox, Flash, Input, LocaleTabs, PageTitle, Select, STATUS_OPTIONS, StatusBadge, Textarea } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/buttons";
import { aggregateStates, editLocale } from "@/components/admin/params";
import { dir, localeNames } from "@/lib/i18n/locales";

export const metadata: Metadata = { title: "Testimonials" };

export default async function TestimonialsAdmin({ searchParams }: PageProps<"/admin/testimonials">) {
  const sp = await searchParams;
  const locale = editLocale(sp);
  const [items, projects] = await Promise.all([
    prisma.testimonial.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], include: { translations: true } }),
    prisma.project.findMany({ orderBy: { sortOrder: "asc" }, include: { translations: { where: { locale: "en" } } } }),
  ]);
  const projectOptions = [{ value: "", label: "Not linked to a project" }, ...projects.map((p) => ({ value: p.id, label: p.translations[0]?.title ?? p.slug }))];

  const fields = (t?: (typeof items)[number]) => {
    const tr = t?.translations.find((x) => x.locale === locale);
    const en = t?.translations.find((x) => x.locale === "en");
    return (
      <>
        <input type="hidden" name="locale" value={locale} />
        {t && <input type="hidden" name="id" value={t.id} />}
        <Input label="Client name" name="authorName" defaultValue={t?.authorName} required maxLength={120} />
        <Input label="Role / company (optional)" name="authorRole" defaultValue={t?.authorRole} maxLength={120} />
        <Select label="Project" name="projectId" options={projectOptions} defaultValue={t?.projectId ?? ""} />
        <Select label="Visibility" name="status" options={STATUS_OPTIONS} defaultValue={t?.status ?? "DRAFT"} />
        <Textarea label={`Quote (${localeNames[locale]})`} name="quote" defaultValue={tr?.quote ?? en?.quote} required rows={3} maxLength={1200} className="md:col-span-2" dir={dir(locale)} />
        <Input label="Order" name="sortOrder" type="number" defaultValue={t?.sortOrder ?? 0} min={0} max={999} />
        <div className="flex flex-col justify-end gap-2">
          <Checkbox
            label="The client approved publishing this, with their name"
            name="clientApproved"
            defaultChecked={t?.clientApproved}
            hint="Required before a testimonial can be published."
          />
          <Checkbox label="Translation reviewed" name="reviewed" defaultChecked={tr?.reviewed ?? locale === "en"} />
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <PageTitle
        title="Testimonials"
        description="Only real feedback, published with the client's permission. Published testimonials appear on the linked project's page."
      />
      <Flash ok={sp.ok} error={sp.error} />
      <LocaleTabs basePath="/admin/testimonials" current={locale} states={aggregateStates(items.flatMap((i) => i.translations))} />

      {items.map((t) => (
        <Card key={`${t.id}-${locale}`} title={t.authorName} actions={<StatusBadge status={t.status} />}>
          <form action={saveTestimonial} className="grid gap-4 md:grid-cols-2">
            {fields(t)}
            <div className="flex gap-3 md:col-span-2">
              <SubmitButton>Save</SubmitButton>
              <SubmitButton variant="danger" formAction={deleteTestimonial} confirm="Delete this testimonial?">
                Delete
              </SubmitButton>
            </div>
          </form>
        </Card>
      ))}

      <Card title="Add a testimonial" description="Saved as a draft unless you choose Published and confirm the client's approval.">
        <form action={saveTestimonial} className="grid gap-4 md:grid-cols-2">
          {fields()}
          <div className="md:col-span-2">
            <SubmitButton variant="secondary">Add testimonial</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
