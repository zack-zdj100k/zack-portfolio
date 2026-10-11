import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/server/db";
import { Badge, Flash, PageTitle, Table } from "@/components/admin/ui";
import { formatDate } from "@/components/admin/params";
import { formatMoney } from "@/lib/money";
import { REFERRAL_STATUSES } from "@/components/admin/statuses";

export const metadata: Metadata = { title: "Referrals" };

export default async function ReferralsAdmin({ searchParams }: PageProps<"/admin/referrals">) {
  const sp = await searchParams;
  const archived = sp.view === "archived";
  const status = REFERRAL_STATUSES.find((s) => s.value === sp.status)?.value;
  const rows = await prisma.referral.findMany({
    where: { archivedAt: archived ? { not: null } : null, ...(status ? { status } : {}) },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Referrals" description="Submitted from the referral page. Private: only visible here." />
      <Flash ok={sp.ok} error={sp.error} />
      <nav aria-label="Filter" className="flex flex-wrap gap-2">
        <Filter href="/admin/referrals" active={!status && !archived}>
          All open
        </Filter>
        {REFERRAL_STATUSES.map((s) => (
          <Filter key={s.value} href={`/admin/referrals?status=${s.value}`} active={status === s.value}>
            {s.label}
          </Filter>
        ))}
        <Filter href="/admin/referrals?view=archived" active={archived}>
          Archived
        </Filter>
      </nav>
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-10 text-center text-mist/60">Nothing here.</p>
      ) : (
        <Table head={["Received", "Referrer", "Business", "Type", "Reward", "Status"]}>
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-ink-3">
              <td className="px-4 py-3 text-mist/60">{formatDate(r.createdAt)}</td>
              <td className="px-4 py-3">
                <Link href={`/admin/referrals/${r.id}`} className="font-medium text-mist underline-offset-4 hover:underline">
                  {r.referrerName}
                </Link>
                <span className="block text-xs text-mist/60">{r.referrerCountry}</span>
              </td>
              <td className="px-4 py-3 text-mist/85">{r.clientName}</td>
              <td className="px-4 py-3 text-mist/70">{r.projectCategory.toLowerCase()}</td>
              <td className="px-4 py-3 text-mist/85">
                {r.rewardMinorSnapshot !== null && r.rewardCurrencySnapshot ? formatMoney(Number(r.rewardMinorSnapshot), r.rewardCurrencySnapshot, "en") : "-"}
              </td>
              <td className="px-4 py-3">
                <Badge tone={r.status === "NEW" ? "info" : r.status === "REWARD_DUE" ? "warn" : r.status === "PAID" ? "ok" : "neutral"}>
                  {REFERRAL_STATUSES.find((s) => s.value === r.status)?.label}
                </Badge>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}

function Filter({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full border px-3.5 py-1.5 text-sm ${active ? "border-mist bg-mist text-ink" : "border-line text-mist/75 hover:border-ice/60"}`}
    >
      {children}
    </Link>
  );
}
