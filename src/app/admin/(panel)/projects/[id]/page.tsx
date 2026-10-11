import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowUp } from "lucide-react";
import { prisma } from "@/server/db";
import {
  addDashboardScreens,
  addProjectImages,
  deleteHotspot,
  saveDashboardScreen,
  saveHotspot,
  saveProject,
  saveProjectLinks,
  saveProjectTranslation,
  updateProjectImage,
} from "@/server/actions/projects";
import { HotspotPicker } from "@/components/admin/HotspotPicker";
import { DASHBOARD_ICON_NAMES } from "@/components/projects/dashboard-icons";
import { CATEGORY_OPTIONS, Card, Checkbox, Flash, Input, LocaleTabs, PageTitle, Select, STATUS_OPTIONS, Textarea } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/buttons";
import { editLocale, translationStates } from "@/components/admin/params";
import { dir, localeNames } from "@/lib/i18n/locales";

export const metadata: Metadata = { title: "Edit project" };

const KIND_OPTIONS = [
  { value: "REAL", label: "Real screenshot" },
  { value: "CONCEPT", label: "Concept visual (labelled on the site)" },
  { value: "DEMO", label: "Demo build (labelled on the site)" },
];

export default async function ProjectEditor({ params, searchParams }: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const locale = editLocale(sp);
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      translations: true,
      images: { orderBy: { sortOrder: "asc" }, include: { media: true, hotspots: { orderBy: { sortOrder: "asc" } } } },
      links: true,
    },
  });
  if (!project) notFound();
  const tr = project.translations.find((t) => t.locale === locale);
  const en = project.translations.find((t) => t.locale === "en");
  const link = (type: "LIVE" | "DEMO" | "REPO") => project.links.find((l) => l.type === type)?.url;
  const gallery = project.images.filter((i) => i.section === "GALLERY");
  const screens = project.images.filter((i) => i.section === "DASHBOARD");
  // Per-language text maps: the language being edited, else English as a starting point.
  const text = (map: unknown) => {
    const m = (map as Record<string, string> | null) ?? {};
    return m[locale] ?? m.en ?? "";
  };

  return (
    <div className="flex flex-col gap-8">
      <PageTitle
        title={en?.title ?? project.slug}
        description={
          <>
            <Link href="/admin/projects" className="underline underline-offset-4">
              All projects
            </Link>{" "}
            ·{" "}
            <a href={`/en/projects/${project.slug}`} target="_blank" rel="noopener" className="underline underline-offset-4">
              View on site
            </a>{" "}
            (drafts need preview mode)
          </>
        }
      />
      <Flash ok={sp.ok} error={sp.error} />

      <Card title="Details" description="Use truthful labels: a project is Launched only when it is live for real users.">
        <form action={saveProject} className="grid gap-5 md:grid-cols-3">
          <input type="hidden" name="id" value={project.id} />
          <Input label="Web address (slug)" name="slug" defaultValue={project.slug} required maxLength={80} hint="Letters, numbers and dashes." />
          <Select label="Type" name="category" options={CATEGORY_OPTIONS} defaultValue={project.category} />
          <Select
            label="Client, personal or concept?"
            name="origin"
            defaultValue={project.origin ?? ""}
            options={[
              { value: "", label: "Not set (no label shown)" },
              { value: "CLIENT", label: "Client project" },
              { value: "PERSONAL", label: "Personal project" },
              { value: "CONCEPT", label: "Concept" },
            ]}
          />
          <Select
            label="Status"
            name="stage"
            defaultValue={project.stage}
            options={[
              { value: "CONCEPT", label: "Concept" },
              { value: "IN_PROGRESS", label: "In progress" },
              { value: "LAUNCHED", label: "Launched" },
            ]}
          />
          <Input label="Date (YYYY-MM)" name="projectDate" defaultValue={project.projectDate?.toISOString().slice(0, 7)} placeholder="2026-09" />
          <Select label="Visibility" name="status" options={STATUS_OPTIONS} defaultValue={project.status} />
          <Input
            label="Technologies"
            name="technologies"
            defaultValue={project.technologies.join(", ")}
            className="md:col-span-3"
            hint="Comma-separated, e.g. Next.js, PostgreSQL."
          />
          <div className="md:col-span-3">
            <Checkbox label="Show on the home page" name="featured" defaultChecked={project.featured} />
          </div>
          <div className="md:col-span-3">
            <SubmitButton>Save details</SubmitButton>
          </div>
        </form>
      </Card>

      <Card title="Text by language" description="Only the title and summary are required. Empty sections are hidden on the project page.">
        <LocaleTabs basePath={`/admin/projects/${project.id}`} current={locale} states={translationStates(project.translations)} />
        <form action={saveProjectTranslation} key={locale} className="grid gap-5 md:grid-cols-2">
          <input type="hidden" name="id" value={project.id} />
          <input type="hidden" name="locale" value={locale} />
          <p className="text-sm text-mist/60 md:col-span-2">
            Editing: <strong className="text-mist">{localeNames[locale]}</strong>
            {!tr && locale !== "en" && " (not translated yet: prefilled with English)"}
          </p>
          <Input label="Title" name="title" defaultValue={tr?.title ?? en?.title} required maxLength={120} dir={dir(locale)} />
          <Textarea label="Summary (one or two sentences)" name="summary" defaultValue={tr?.summary ?? en?.summary} rows={2} maxLength={600} dir={dir(locale)} />
          <Textarea label="The goal / problem" name="problem" defaultValue={tr?.problem} dir={dir(locale)} />
          <Textarea label="My role" name="role" defaultValue={tr?.role} dir={dir(locale)} />
          <Textarea label="The solution" name="solution" defaultValue={tr?.solution} dir={dir(locale)} />
          <Textarea label="The challenge" name="challenge" defaultValue={tr?.challenge} dir={dir(locale)} />
          <Textarea label="Outcome (only real, verifiable results)" name="outcome" defaultValue={tr?.outcome} dir={dir(locale)} />
          <Textarea label="Features (one per line)" name="features" defaultValue={(tr ?? en)?.features.join("\n")} rows={5} dir={dir(locale)} />
          <div className="md:col-span-2">
            <Checkbox label="I reviewed this translation" name="reviewed" defaultChecked={tr?.reviewed ?? locale === "en"} />
          </div>
          <div className="md:col-span-2">
            <SubmitButton>Save {localeNames[locale]} text</SubmitButton>
          </div>
        </form>
      </Card>

      <Card title="Images" description="The first wide image is the cover. Concept and demo images get a visible label on the site.">
        <div className="mb-6 flex flex-col gap-3">
          {gallery.map((img, i) => (
            <form key={img.id} action={updateProjectImage} className="flex flex-col gap-4 rounded-xl border border-line p-3 md:flex-row md:items-end">
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="imageId" value={img.id} />
              <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-lg bg-ink-3 md:w-40">
                <Image src={img.media.url} alt="" fill sizes="160px" className="object-cover object-top" />
              </div>
              <Select label="Kind" name="kind" options={KIND_OPTIONS} defaultValue={img.kind} className="md:w-56" />
              <Input
                label="Description (English, for screen readers)"
                name="alt"
                defaultValue={(img.media.alt as Record<string, string> | null)?.en}
                maxLength={200}
                className="min-w-0 flex-1"
              />
              <div className="flex flex-wrap gap-2">
                <SubmitButton variant="secondary">Save</SubmitButton>
                <button name="op" value="up" disabled={i === 0} aria-label="Move earlier" className="flex size-10 items-center justify-center rounded-full border border-line disabled:opacity-30">
                  <ArrowUp aria-hidden className="size-4" />
                </button>
                <button
                  name="op"
                  value="down"
                  disabled={i === gallery.length - 1}
                  aria-label="Move later"
                  className="flex size-10 items-center justify-center rounded-full border border-line disabled:opacity-30"
                >
                  <ArrowDown aria-hidden className="size-4" />
                </button>
                <SubmitButton variant="danger" name="op" value="remove" confirm="Remove this image from the project?">
                  Remove
                </SubmitButton>
              </div>
            </form>
          ))}
        </div>
        <form action={addProjectImages} className="grid gap-4 rounded-xl border border-dashed border-line p-4 md:grid-cols-[2fr_1fr_2fr_auto] md:items-end">
          <input type="hidden" name="id" value={project.id} />
          <Input label="Add images" name="files" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple required />
          <Select label="Kind" name="kind" options={KIND_OPTIONS} defaultValue="REAL" />
          <Input label="Description (English)" name="alt" maxLength={200} />
          <SubmitButton>Upload</SubmitButton>
        </form>
      </Card>

      <div id="dashboard" className="scroll-mt-24">
        <Card
          title="Dashboard tour"
          description={`Admin screens of this project with numbered markers explaining each icon, shown on the project page. Texts are edited in ${localeNames[locale]} (switch language with the tabs at the top). Never upload screens that show customer names, phones or emails.`}
        >
          <div className="flex flex-col gap-8">
            {screens.map((screen, si) => (
              <div key={screen.id} className="flex flex-col gap-4 rounded-xl border border-line p-4">
                <form action={saveDashboardScreen} className="grid gap-3 md:grid-cols-[1fr_220px_auto] md:items-end">
                  <input type="hidden" name="projectId" value={project.id} />
                  <input type="hidden" name="imageId" value={screen.id} />
                  <input type="hidden" name="locale" value={locale} />
                  <Input label={`Screen ${si + 1} name (${localeNames[locale]})`} name="title" defaultValue={text(screen.title)} maxLength={60} dir={dir(locale)} />
                  <Select label="Label on the site" name="kind" options={KIND_OPTIONS.filter((k) => k.value !== "CONCEPT")} defaultValue={screen.kind} />
                  <div className="flex flex-wrap gap-2">
                    <SubmitButton variant="secondary">Save</SubmitButton>
                    <SubmitButton variant="danger" formAction={updateProjectImage} name="op" value="remove" confirm="Remove this screen and its markers?">
                      Remove
                    </SubmitButton>
                  </div>
                </form>
                <HotspotPicker
                  imageId={screen.id}
                  src={screen.media.url}
                  width={screen.media.width ?? 1920}
                  height={screen.media.height ?? 1200}
                  hotspots={screen.hotspots.map((h) => ({ id: h.id, x: h.x, y: h.y }))}
                />
                <div className="flex flex-col gap-2">
                  {screen.hotspots.map((h, hi) => (
                    <form key={h.id} action={saveHotspot} className="grid gap-3 rounded-lg border border-line/70 p-3 md:grid-cols-[32px_80px_80px_160px_1fr_2fr_auto] md:items-end">
                      <input type="hidden" name="projectId" value={project.id} />
                      <input type="hidden" name="imageId" value={screen.id} />
                      <input type="hidden" name="hotspotId" value={h.id} />
                      <input type="hidden" name="locale" value={locale} />
                      <span className="pb-3 text-sm font-bold tabular-nums text-mist/70">{hi + 1}</span>
                      <Input label="X %" name="x" defaultValue={h.x} required />
                      <Input label="Y %" name="y" defaultValue={h.y} required />
                      <Select label="Icon" name="icon" options={DASHBOARD_ICON_NAMES.map((n) => ({ value: n, label: n }))} defaultValue={h.icon} />
                      <Input label="Name" name="label" defaultValue={text(h.label)} maxLength={80} required dir={dir(locale)} />
                      <Input label="What it does for the business" name="body" defaultValue={text(h.body)} maxLength={300} required dir={dir(locale)} />
                      <div className="flex gap-2">
                        <SubmitButton variant="secondary">Save</SubmitButton>
                        <SubmitButton variant="danger" formAction={deleteHotspot} confirm="Remove this marker?">
                          Remove
                        </SubmitButton>
                      </div>
                    </form>
                  ))}
                  <form action={saveHotspot} className="grid gap-3 rounded-lg border border-dashed border-line p-3 md:grid-cols-[80px_80px_160px_1fr_2fr_auto] md:items-end">
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="imageId" value={screen.id} />
                    <input type="hidden" name="locale" value={locale} />
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-mist/85">X %</span>
                      <input id={`new-x-${screen.id}`} name="x" defaultValue="50" required className="field-input" />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-mist/85">Y %</span>
                      <input id={`new-y-${screen.id}`} name="y" defaultValue="50" required className="field-input" />
                    </label>
                    <Select label="Icon" name="icon" options={DASHBOARD_ICON_NAMES.map((n) => ({ value: n, label: n }))} defaultValue="circle-check" />
                    <Input label="Name" name="label" maxLength={80} required dir={dir(locale)} />
                    <Input label="What it does for the business" name="body" maxLength={300} required dir={dir(locale)} />
                    <SubmitButton>Add marker</SubmitButton>
                  </form>
                </div>
              </div>
            ))}
            <form action={addDashboardScreens} className="grid gap-4 rounded-xl border border-dashed border-line p-4 md:grid-cols-[2fr_1fr_1fr_auto] md:items-end">
              <input type="hidden" name="id" value={project.id} />
              <Input label="Add dashboard screens" name="files" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple required />
              <Input label="Screen name (English)" name="title" maxLength={60} placeholder="Dashboard" />
              <Select label="Label on the site" name="kind" options={KIND_OPTIONS.filter((k) => k.value !== "CONCEPT")} defaultValue="DEMO" />
              <SubmitButton>Upload</SubmitButton>
            </form>
          </div>
        </Card>
      </div>

      <Card title="Links" description="Optional. Leave empty to hide.">
        <form action={saveProjectLinks} className="grid gap-4 md:grid-cols-3">
          <input type="hidden" name="id" value={project.id} />
          <Input label="Live site" name="LIVE" type="url" defaultValue={link("LIVE")} placeholder="https://" />
          <Input label="Demo" name="DEMO" type="url" defaultValue={link("DEMO")} placeholder="https://" />
          <Input label="Source code" name="REPO" type="url" defaultValue={link("REPO")} placeholder="https://" />
          <div className="md:col-span-3">
            <SubmitButton>Save links</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
