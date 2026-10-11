import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/server/db";
import { Badge, Flash, PageTitle, Table } from "@/components/admin/ui";
import { formatDate } from "@/components/admin/params";
import { INQUIRY_STATUSES } from "@/components/admin/statuses";

export const metadata: Metadata = { title: "Inquiries" };

export default async function InquiriesAdmin({ searchParams }: PageProps<"/admin/inquiries">) {
  const sp = await searchParams;
  const archived = sp.view === "archived";
  const status = INQUIRY_STATUSES.find((s) => s.value === sp.status)?.value;
  const waitlist = sp.view === "waitlist";
  const rows = await prisma.contactInquiry.findMany({
    where: { archivedAt: archived ? { not: null } : null, ...(status ? { status } : {}), ...(waitlist ? { kind: "WAITLIST" } : {}) },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { aiService: { include: { translations: { where: { locale: "en" } } } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Inquiries" description="Messages from the contact form and Coming Soon waitlists. Private: only visible here." />
      <Flash ok={sp.ok} error={sp.error} />
      <nav aria-label="Filter" className="flex flex-wrap gap-2">
        {[{ href: "/admin/inquiries", label: "All open", active: !status && !archived && !waitlist }, ...INQUIRY_STATUSES.map((s) => ({ href: `/admin/inquiries?status=${s.value}`, label: s.label, active: status === s.value })), { href: "/admin/inquiries?view=waitlist", label: "Waitlist", active: waitlist }, { href: "/admin/inquiries?view=archived", label: "Archived", active: archived }].map((f) => (
          <Link
            key={f.href}
            href={f.href}
            aria-current={f.active ? "page" : undefined}
            className={`rounded-full border px-3.5 py-1.5 text-sm ${f.active ? "border-mist bg-mist text-ink" : "border-line text-mist/75 hover:border-ice/60"}`}
          >
            {f.label}
          </Link>
        ))}
      </nav>
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-10 text-center text-mist/60">Nothing here.</p>
      ) : (
        <Table head={["Received", "Name", "Contact", "Country", "Type", "Status"]}>
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-ink-3">
              <td className="px-4 py-3 text-mist/60">{formatDate(r.createdAt)}</td>
              <td className="px-4 py-3">
                <Link href={`/admin/inquiries/${r.id}`} className="font-medium text-mist underline-offset-4 hover:underline">
                  {r.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-mist/80">{r.email ?? r.phone}</td>
              <td className="px-4 py-3 text-mist/70">{r.country}</td>
              <td className="px-4 py-3 text-mist/70">
                {r.kind === "WAITLIST" && <Badge tone="info">Waitlist</Badge>} {r.aiService ? (r.aiService.translations[0]?.title ?? r.aiService.key) : (r.projectCategory?.toLowerCase() ?? "-")}
              </td>
              <td className="px-4 py-3">
                <Badge tone={r.status === "NEW" ? "info" : r.status === "CLOSED" ? "neutral" : "ok"}>{INQUIRY_STATUSES.find((s) => s.value === r.status)?.label}</Badge>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
