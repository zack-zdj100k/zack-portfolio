import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import { archiveInquiry, deleteInquiry, updateInquiry } from "@/server/actions/inbox";
import { Card, Flash, PageTitle, Select, Textarea } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/buttons";
import { formatDate } from "@/components/admin/params";
import { INQUIRY_STATUSES } from "@/components/admin/statuses";
import { countryName } from "@/lib/countries";
import { whatsappHref } from "@/components/ui/social";

export const metadata: Metadata = { title: "Inquiry" };

export default async function InquiryDetail({ params, searchParams }: PageProps<"/admin/inquiries/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const q = await prisma.contactInquiry.findUnique({ where: { id } });
  if (!q) notFound();

  const rows: [string, React.ReactNode][] = [
    ["Received", formatDate(q.createdAt)],
    ["Email", q.email ? <a href={`mailto:${q.email}`} className="underline underline-offset-4">{q.email}</a> : "-"],
    [
      "Phone",
      q.phone ? (
        <span className="flex flex-wrap gap-3">
          <a href={`tel:${q.phone.replace(/\s/g, "")}`} className="underline underline-offset-4">
            {q.phone}
          </a>
          <a href={whatsappHref(q.phone)} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
            WhatsApp
          </a>
        </span>
      ) : (
        "-"
      ),
    ],
    ["Country", countryName(q.country, "en")],
    ["Project type", q.projectCategory?.toLowerCase() ?? "Not sure yet"],
    ["Budget", q.budget ?? "-"],
    ["Timeline", q.timeline ?? "-"],
    ["Site language", q.locale],
    ["Consent given", q.consent ? "Yes" : "No"],
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageTitle
        title={q.name}
        description={
          <Link href="/admin/inquiries" className="underline underline-offset-4">
            All inquiries
          </Link>
        }
      />
      <Flash ok={sp.ok} error={sp.error} />
      <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
        <Card title="Message">
          <p className="mb-6 whitespace-pre-line text-mist/90">{q.message}</p>
          <dl className="grid gap-x-6 gap-y-3 border-t border-line pt-5 text-sm sm:grid-cols-[160px_1fr]">
            {rows.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-mist/55">{k}</dt>
                <dd className="break-words text-mist">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <Card title="Follow-up">
          <form action={updateInquiry} className="flex flex-col gap-4">
            <input type="hidden" name="id" value={q.id} />
            <Select label="Status" name="status" options={INQUIRY_STATUSES} defaultValue={q.status} />
            <Textarea label="Private notes" name="adminNotes" defaultValue={q.adminNotes} rows={5} />
            <div>
              <SubmitButton>Save</SubmitButton>
            </div>
          </form>
          <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-5">
            <form action={archiveInquiry}>
              <input type="hidden" name="id" value={q.id} />
              <SubmitButton variant="secondary">{q.archivedAt ? "Restore" : "Archive"}</SubmitButton>
            </form>
            <form action={deleteInquiry}>
              <input type="hidden" name="id" value={q.id} />
              <SubmitButton variant="danger" confirm="Permanently delete this inquiry and the personal data in it?">
                Delete permanently
              </SubmitButton>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
