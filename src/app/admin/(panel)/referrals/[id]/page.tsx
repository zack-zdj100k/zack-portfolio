import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import { archiveReferral, deleteReferral, updateReferral } from "@/server/actions/referral";
import { Card, Flash, PageTitle, Select, Textarea } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/buttons";
import { formatDate } from "@/components/admin/params";
import { countryName } from "@/lib/countries";
import { formatMoney } from "@/lib/money";
import { REFERRAL_STATUSES } from "@/components/admin/statuses";

export const metadata: Metadata = { title: "Referral" };

export default async function ReferralDetail({ params, searchParams }: PageProps<"/admin/referrals/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const r = await prisma.referral.findUnique({ where: { id }, include: { offer: true } });
  if (!r) notFound();

  const rows: [string, React.ReactNode][] = [
    ["Received", formatDate(r.createdAt)],
    ["Referrer", r.referrerName],
    ["Referrer email", r.referrerEmail ? <a href={`mailto:${r.referrerEmail}`}>{r.referrerEmail}</a> : "-"],
    ["Referrer phone", r.referrerPhone ?? "-"],
    ["Referrer country", countryName(r.referrerCountry, "en")],
    ["Business", r.clientName],
    ["Business contact", r.clientContact],
    ["Business country", r.clientCountry ? countryName(r.clientCountry, "en") : "-"],
    ["Needs", r.projectCategory.toLowerCase()],
    [
      "Reward promised at submission",
      r.rewardMinorSnapshot !== null && r.rewardCurrencySnapshot ? formatMoney(Number(r.rewardMinorSnapshot), r.rewardCurrencySnapshot, "en") : "No published offer applied",
    ],
    ["Site language", r.locale],
    ["Consent given", r.consent ? "Yes" : "No"],
    ["Paid on", r.paidAt ? formatDate(r.paidAt) : "-"],
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageTitle
        title={`${r.referrerName} → ${r.clientName}`}
        description={
          <Link href="/admin/referrals" className="underline underline-offset-4">
            All referrals
          </Link>
        }
      />
      <Flash ok={sp.ok} error={sp.error} />
      <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
        <Card title="Details">
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[200px_1fr]">
            {rows.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-mist/55">{k}</dt>
                <dd className="break-words text-mist">{v}</dd>
              </div>
            ))}
          </dl>
          {r.message && (
            <div className="mt-6 border-t border-line pt-5">
              <p className="mb-2 text-sm text-mist/55">Message</p>
              <p className="whitespace-pre-line text-mist/90">{r.message}</p>
            </div>
          )}
        </Card>
        <Card title="Status">
          <form action={updateReferral} className="flex flex-col gap-4">
            <input type="hidden" name="id" value={r.id} />
            <Select label="Status" name="status" options={REFERRAL_STATUSES} defaultValue={r.status} hint='Set "Reward due" once the offer conditions are met, then "Paid" after paying.' />
            <Textarea label="Private notes" name="adminNotes" defaultValue={r.adminNotes} rows={5} />
            <div>
              <SubmitButton>Save</SubmitButton>
            </div>
          </form>
          <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-5">
            <form action={archiveReferral}>
              <input type="hidden" name="id" value={r.id} />
              <SubmitButton variant="secondary">{r.archivedAt ? "Restore" : "Archive"}</SubmitButton>
            </form>
            <form action={deleteReferral}>
              <input type="hidden" name="id" value={r.id} />
              <SubmitButton variant="danger" confirm="Permanently delete this referral and the personal data in it?">
                Delete permanently
              </SubmitButton>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
