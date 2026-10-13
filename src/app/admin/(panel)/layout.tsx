import Link from "next/link";
import { cookies } from "next/headers";
import { requireAdminPage } from "@/server/auth/session";
import { PREVIEW_COOKIE } from "@/server/services/content";
import { prisma } from "@/server/db";
import { logout } from "@/server/actions/auth";
import { togglePreview } from "@/server/actions/settings";
import { AdminNav } from "@/components/admin/AdminNav";
import { UnsavedChangesGuard } from "@/components/admin/UnsavedChangesGuard";
import { UploadShrinker } from "@/components/admin/UploadShrinker";

// Vercel refuses request bodies over 4.5 MB; keep uploads under that with a little room for the form.
const UPLOAD_LIMIT = process.env.VERCEL ? 4.3 * 1024 * 1024 : null;

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdminPage();
  const [preview, newInquiries, newReferrals] = await Promise.all([
    cookies().then((c) => c.get(PREVIEW_COOKIE)?.value === "1"),
    prisma.contactInquiry.count({ where: { status: "NEW", archivedAt: null } }),
    prisma.referral.count({ where: { status: "NEW", archivedAt: null } }),
  ]);

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-line bg-ink-2 lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:border-b-0 lg:border-e">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:block lg:py-6">
          <Link href="/admin" className="text-2xl font-black uppercase tracking-tight display-gradient">
            ZACK
          </Link>
          <p className="hidden truncate text-xs text-mist/60 lg:mt-1 lg:block">{admin.email}</p>
        </div>
        <AdminNav counts={{ inquiries: newInquiries, referrals: newReferrals }} />
        <div className="hidden flex-col gap-2 border-t border-line px-5 py-5 lg:flex">
          <form action={togglePreview}>
            <button type="submit" className="w-full rounded-full border border-line px-4 py-2 text-sm text-mist/85 hover:border-ice/60">
              {preview ? "Drafts preview: ON" : "Drafts preview: OFF"}
            </button>
          </form>
          <a href="/en" target="_blank" rel="noopener" className="rounded-full border border-line px-4 py-2 text-center text-sm text-mist/85 hover:border-ice/60">
            View site
          </a>
          <form action={logout}>
            <button type="submit" className="w-full rounded-full px-4 py-2 text-sm text-mist/60 hover:text-mist">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-8 sm:px-6 md:px-10 md:py-10">
        <UnsavedChangesGuard />
        <UploadShrinker limitBytes={UPLOAD_LIMIT} />
        {children}
        <div className="mt-16 flex flex-wrap gap-2 border-t border-line pt-6 lg:hidden">
          <form action={togglePreview}>
            <button type="submit" className="rounded-full border border-line px-4 py-2 text-sm">
              {preview ? "Drafts preview: ON" : "Drafts preview: OFF"}
            </button>
          </form>
          <a href="/en" target="_blank" rel="noopener" className="rounded-full border border-line px-4 py-2 text-sm">
            View site
          </a>
          <form action={logout}>
            <button type="submit" className="rounded-full px-4 py-2 text-sm text-mist/60">
              Sign out
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
