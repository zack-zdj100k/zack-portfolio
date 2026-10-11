import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/server/db";
import { Badge, Card, Flash, PageTitle } from "@/components/admin/ui";
import { formatDate } from "@/components/admin/params";

export const metadata: Metadata = { title: "Dashboard" };

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  const sp = await searchParams;
  const [inquiries, referrals, draftPackages, draftOffers, unreviewed, projects, settings, recentInq, recentRef] = await Promise.all([
    prisma.contactInquiry.count({ where: { status: "NEW", archivedAt: null } }),
    prisma.referral.count({ where: { status: "NEW", archivedAt: null } }),
    prisma.pricingPackage.count({ where: { status: "DRAFT" } }),
    prisma.countryOffer.count({ where: { status: "DRAFT" } }),
    prisma.localeSetting.findMany({ where: { reviewed: false, enabled: true }, select: { code: true } }),
    prisma.project.findMany({ select: { status: true, stage: true, origin: true } }),
    prisma.siteSettings.findUnique({ where: { id: 1 }, select: { contactEmail: true, whatsapp: true, showWhatsapp: true, heroMode: true, heroModelId: true } }),
    prisma.contactInquiry.findMany({ where: { archivedAt: null }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.referral.findMany({ where: { archivedAt: null }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  const profile = await prisma.profile.findUnique({ where: { id: 1 }, select: { portraitId: true, languages: true } });

  // What still needs the owner before launch.
  const todo = [
    draftPackages > 0 && { href: "/admin/services", text: `${draftPackages} pricing package(s) are drafts. Confirm the prices and publish them.` },
    draftOffers > 0 && { href: "/admin/referral", text: `${draftOffers} referral offer(s) are drafts. Approve the terms and publish.` },
    unreviewed.length > 0 && {
      href: "/admin/languages",
      text: `${unreviewed.length} language(s) show "translated automatically": ${unreviewed.map((u) => u.code).join(", ")}.`,
    },
    !settings?.contactEmail && { href: "/admin/settings", text: "No public contact email yet." },
    !(settings?.whatsapp && settings.showWhatsapp) && {
      href: "/admin/settings",
      text: "No WhatsApp number shown. Many visitors will look for it first on their phone.",
    },
    !profile?.portraitId && { href: "/admin/profile", text: "No profile photo yet (About page shows a placeholder)." },
    projects.some((p) => p.origin === null) && { href: "/admin/projects", text: "Some projects have no Client / Personal / Concept label yet." },
    settings?.heroMode === "MODEL" && !settings.heroModelId && { href: "/admin/hero", text: "Hero option C is selected but no 3D model is uploaded (option B is shown instead)." },
  ].filter((x): x is { href: string; text: string } => !!x);

  return (
    <div className="flex flex-col gap-8">
      <PageTitle title="Dashboard" description="New messages, and what still needs your input before launch." />
      <Flash ok={sp.ok} error={sp.error} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat href="/admin/inquiries" label="New inquiries" value={inquiries} />
        <Stat href="/admin/referrals" label="New referrals" value={referrals} />
        <Stat href="/admin/projects" label="Published projects" value={projects.filter((p) => p.status === "PUBLISHED").length} />
        <Stat href="/admin/services" label="Draft prices" value={draftPackages} />
      </div>

      {todo.length > 0 && (
        <Card title="Before going live" description="These items are hidden or labelled on the public site until you act on them.">
          <ul className="flex flex-col gap-2">
            {todo.map((t) => (
              <li key={t.href + t.text}>
                <Link href={t.href} className="flex items-start gap-3 rounded-xl border border-line px-4 py-3 text-sm text-mist/85 hover:border-ice/60">
                  <Badge tone="warn">To do</Badge>
                  <span>{t.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Latest inquiries">
          {recentInq.length === 0 ? (
            <p className="text-sm text-mist/60">No inquiries yet. They appear here when someone uses the contact form.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recentInq.map((i) => (
                <li key={i.id}>
                  <Link href={`/admin/inquiries/${i.id}`} className="flex items-center justify-between gap-3 py-3 text-sm hover:text-mist">
                    <span className="truncate text-mist/85">{i.name}</span>
                    <span className="flex shrink-0 items-center gap-3 text-mist/60">
                      {i.status === "NEW" && <Badge tone="info">New</Badge>}
                      {formatDate(i.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Latest referrals">
          {recentRef.length === 0 ? (
            <p className="text-sm text-mist/60">No referrals yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recentRef.map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/referrals/${r.id}`} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <span className="truncate text-mist/85">
                      {r.referrerName} → {r.clientName}
                    </span>
                    <span className="flex shrink-0 items-center gap-3 text-mist/60">
                      <Badge tone={r.status === "NEW" ? "info" : "neutral"}>{r.status.replace("_", " ").toLowerCase()}</Badge>
                      {formatDate(r.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stat({ href, label, value }: { href: string; label: string; value: number }) {
  return (
    <Link href={href} className="rounded-2xl border border-line bg-ink-2 p-5 hover:border-ice/60">
      <p className="text-sm text-mist/60">{label}</p>
      <p className="mt-2 text-4xl font-black text-mist">{value}</p>
    </Link>
  );
}
