import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import { prisma } from "@/server/db";
import { createProject, deleteProject, moveProject, setProjectStatus } from "@/server/actions/projects";
import { Badge, CATEGORY_OPTIONS, Card, Flash, Input, PageTitle, Select, StatusBadge } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/buttons";

export const metadata: Metadata = { title: "Projects" };

const STAGE = { CONCEPT: "Concept", IN_PROGRESS: "In progress", LAUNCHED: "Launched" } as const;

export default async function ProjectsAdmin({ searchParams }: PageProps<"/admin/projects">) {
  const sp = await searchParams;
  const projects = await prisma.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { translations: { where: { locale: "en" } }, images: { orderBy: { sortOrder: "asc" }, take: 1, include: { media: true } } },
  });

  return (
    <div className="flex flex-col gap-8">
      <PageTitle title="Projects" description="Add, edit, reorder, publish and remove projects. The order here is the order on the site." />
      <Flash ok={sp.ok} error={sp.error} />

      <Card title="New project">
        <form action={createProject} className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_auto] md:items-end">
          <Input label="Title" name="title" required maxLength={120} />
          <Input label="Web address (optional)" name="slug" maxLength={80} hint="Made from the title if empty." />
          <Select label="Type" name="category" options={CATEGORY_OPTIONS} defaultValue="WEBSITE" />
          <SubmitButton>Create draft</SubmitButton>
        </form>
      </Card>

      {projects.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-10 text-center text-mist/60">No projects yet. Create the first one above.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {projects.map((p, i) => {
            const t = p.translations[0];
            return (
              <li key={p.id} className="flex flex-col gap-4 rounded-2xl border border-line bg-ink-2 p-4 sm:flex-row sm:items-center">
                <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl bg-ink-3 sm:w-36">
                  {p.images[0] && <Image src={p.images[0].media.url} alt="" fill sizes="144px" className="object-cover object-top" />}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <Link href={`/admin/projects/${p.id}`} className="truncate text-lg font-bold text-mist hover:underline">
                    {t?.title ?? p.slug}
                  </Link>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={p.status} />
                    <Badge>{p.category.toLowerCase()}</Badge>
                    <Badge>{STAGE[p.stage]}</Badge>
                    {p.origin ? <Badge>{p.origin.toLowerCase()}</Badge> : <Badge tone="warn">no type label</Badge>}
                    {p.featured && <Badge tone="info">on home page</Badge>}
                  </div>
                  <p className="text-xs text-mist/60">/projects/{p.slug}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <form action={moveProject} className="flex gap-1">
                    <input type="hidden" name="id" value={p.id} />
                    <button name="dir" value="up" disabled={i === 0} aria-label="Move up" className="flex size-10 items-center justify-center rounded-full border border-line disabled:opacity-30">
                      <ArrowUp aria-hidden className="size-4" />
                    </button>
                    <button
                      name="dir"
                      value="down"
                      disabled={i === projects.length - 1}
                      aria-label="Move down"
                      className="flex size-10 items-center justify-center rounded-full border border-line disabled:opacity-30"
                    >
                      <ArrowDown aria-hidden className="size-4" />
                    </button>
                  </form>
                  <form action={setProjectStatus}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="status" value={p.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"} />
                    <SubmitButton variant="secondary">{p.status === "PUBLISHED" ? "Unpublish" : "Publish"}</SubmitButton>
                  </form>
                  <Link href={`/admin/projects/${p.id}`} className="inline-flex h-10 items-center rounded-full border border-line px-5 text-sm hover:border-ice/60">
                    Edit
                  </Link>
                  <form action={deleteProject}>
                    <input type="hidden" name="id" value={p.id} />
                    <SubmitButton variant="danger" confirm={`Delete "${t?.title ?? p.slug}" and its images? This can't be undone.`}>
                      Delete
                    </SubmitButton>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
