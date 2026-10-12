import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowUp } from "lucide-react";
import { prisma } from "@/server/db";
import {
  addDashboardScreens,
  addProjectImages,
  deleteArchitectureNode,
  deleteHotspot,
  moveArchitectureNode,
  removeHotspotImage,
  removeProjectImage,
  saveArchitecture,
  saveArchitectureNode,
  saveDashboardScreen,
  saveHotspot,
  saveProject,
  saveProjectLinks,
  saveProjectTranslation,
  updateProjectImage,
  uploadHotspotImage,
} from "@/server/actions/projects";
import { HotspotPicker } from "@/components/admin/HotspotPicker";
import { TechListEditor } from "@/components/admin/TechListEditor";
import { techKey } from "@/components/projects/TechTiles";
import { MoveButtons } from "@/components/admin/MoveButtons";
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
  { value: "VISUAL_EXPLORATION", label: "Visual exploration (labelled on the site)" },
];

const ARCH_STATUS = [
  { value: "HIDDEN", label: "Hidden (no section on the project page)" },
  { value: "PROPOSED", label: "Proposed: shown with a “Concept / proposed architecture” label" },
  { value: "CONFIRMED", label: "Confirmed: matches the real project" },
];
const ARCH_KINDS = [
  { value: "CLIENT", label: "Visitor / client (browser, phone)" },
  { value: "FRONTEND", label: "Frontend (website or app screens)" },
  { value: "API", label: "API" },
  { value: "BACKEND", label: "Backend / server" },
  { value: "DATABASE", label: "Database" },
  { value: "EXTERNAL", label: "External service (payments, storage, email...)" },
];

export default async function ProjectEditor({ params, searchParams }: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const locale = editLocale(sp);
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      translations: true,
      images: { orderBy: { sortOrder: "asc" }, include: { media: true, hotspots: { orderBy: { sortOrder: "asc" }, include: { media: true } } } },
      links: true,
      architectureNodes: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!project) notFound();
  // Technology suggestions and tile colours come from Admin → Skills (visible groups, in order).
  const skillGroups = await prisma.skillGroup.findMany({
    where: { visible: true },
    orderBy: { sortOrder: "asc" },
    include: { skills: { where: { visible: true }, orderBy: { sortOrder: "asc" }, select: { name: true } } },
  });
  const skillGroupOf: Record<string, number> = {};
  skillGroups.forEach((g, gi) => g.skills.forEach((s) => (skillGroupOf[techKey(s.name)] ??= gi)));
  const skillNames = [...new Set(skillGroups.flatMap((g) => g.skills.map((s) => s.name)))];
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
          <div className="md:col-span-3">
            <TechListEditor name="technologies" defaultValue={project.technologies} suggestions={skillNames} groupOf={skillGroupOf} />
          </div>
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
                    <SubmitButton variant="danger" formAction={removeProjectImage} confirm="Remove this screen and its markers?">
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
                    <div key={h.id} className="flex flex-col gap-2">
                      <form action={saveHotspot} className="grid gap-3 rounded-lg border border-line/70 p-3 md:grid-cols-[32px_80px_80px_160px_1fr_2fr_auto] md:items-end">
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
                      <div className="flex flex-wrap items-end gap-3 ps-3">
                        {h.media && (
                          <a href={h.media.url} target="_blank" rel="noopener" className="relative block h-14 w-24 shrink-0 overflow-hidden rounded-md border border-line">
                            <Image src={h.media.url} alt="" fill sizes="96px" className="object-cover object-top" />
                          </a>
                        )}
                        <form action={uploadHotspotImage} className="flex flex-1 flex-wrap items-end gap-3">
                          <input type="hidden" name="projectId" value={project.id} />
                          <input type="hidden" name="hotspotId" value={h.id} />
                          <Input
                            label={h.media ? "Replace this feature's screenshot" : "This feature's own screenshot"}
                            name="file"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            required
                            className="min-w-0 flex-1"
                            hint="Shown on the project page while visitors read this feature. Without one, the page zooms into the marker's area."
                          />
                          <SubmitButton variant="secondary">Upload</SubmitButton>
                        </form>
                        {h.media && (
                          <form action={removeHotspotImage}>
                            <input type="hidden" name="projectId" value={project.id} />
                            <input type="hidden" name="hotspotId" value={h.id} />
                            <SubmitButton variant="danger">Remove screenshot</SubmitButton>
                          </form>
                        )}
                      </div>
                    </div>
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

      <div id="architecture" className="scroll-mt-24">
        <Card
          title="How it's built"
          description={`Architecture section on the project page: plain-language texts and a flow graph. Keep it true to the real project; if anything is unconfirmed, choose “Proposed”. Texts edited in ${localeNames[locale]} (language tabs are in “Text by language”).`}
        >
          <form action={saveArchitecture} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="id" value={project.id} />
            <input type="hidden" name="locale" value={locale} />
            <Select label="Status" name="architectureStatus" options={ARCH_STATUS} defaultValue={project.architectureStatus} className="md:col-span-2" />
            <Textarea label="Frontend: how it's built and what users interact with" name="frontendText" defaultValue={tr?.frontendText ?? en?.frontendText} rows={3} maxLength={2000} dir={dir(locale)} />
            <Textarea label="Backend / server: how requests and business logic are handled" name="backendText" defaultValue={tr?.backendText ?? en?.backendText} rows={3} maxLength={2000} dir={dir(locale)} />
            <Textarea label="Database: which one, and what kind of information it stores" name="databaseText" defaultValue={tr?.databaseText ?? en?.databaseText} rows={3} maxLength={2000} dir={dir(locale)} />
            <Textarea label="Request flow: browser → website → server → database / services" name="flowText" defaultValue={tr?.flowText ?? en?.flowText} rows={3} maxLength={2000} dir={dir(locale)} />
            <div className="md:col-span-2">
              <SubmitButton>Save architecture</SubmitButton>
            </div>
          </form>

          <h3 className="mb-1 mt-8 border-t border-line pt-6 font-bold text-mist">Flow graph</h3>
          <p className="mb-4 text-sm text-mist/60">Main chain from left to right (top to bottom on phones). A step can branch off a main step, e.g. image storage off the server. Empty names use the default name for the kind.</p>
          <div className="flex flex-col gap-3">
            {(() => {
              const main = project.architectureNodes.filter((n) => !n.parentId);
              const parentOptions = [{ value: "", label: "Main chain" }, ...main.map((m, mi) => ({ value: m.id, label: `Branch of step ${mi + 1} (${m.kind.toLowerCase()})` }))];
              const row = (n: (typeof project.architectureNodes)[number], idx: number, siblings: typeof project.architectureNodes, branch: boolean) => (
                <div key={`${n.id}-${locale}`} className={`rounded-xl border border-line p-3 ${branch ? "ms-6 border-dashed md:ms-12" : ""}`}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-bold text-mist">{branch ? `↳ Branch ${idx + 1}` : `Step ${idx + 1}`}</span>
                    <MoveButtons action={moveArchitectureNode} id={n.id} locale={locale} first={idx === 0} last={idx === siblings.length - 1} label="step" />
                  </div>
                  <form action={saveArchitectureNode} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr] md:items-end">
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="nodeId" value={n.id} />
                    <input type="hidden" name="locale" value={locale} />
                    <Select label="Kind" name="kind" options={ARCH_KINDS} defaultValue={n.kind} />
                    <Input label="Technology" name="technology" defaultValue={n.technology} maxLength={80} placeholder="e.g. PostgreSQL" />
                    <Select label="Position" name="parentId" options={parentOptions.filter((o) => o.value !== n.id)} defaultValue={n.parentId ?? ""} />
                    <Input label={`Name (${localeNames[locale]})`} name="label" defaultValue={text(n.label)} maxLength={80} dir={dir(locale)} placeholder="Optional" />
                    <Input label={`One-line explanation (${localeNames[locale]})`} name="body" defaultValue={text(n.body)} maxLength={300} dir={dir(locale)} className="md:col-span-2" />
                    <div className="flex gap-2 md:col-span-3">
                      <SubmitButton variant="secondary">Save</SubmitButton>
                      <SubmitButton variant="danger" formAction={deleteArchitectureNode} confirm="Delete this step (and its branches)?">
                        Delete
                      </SubmitButton>
                    </div>
                  </form>
                </div>
              );
              return (
                <>
                  {main.map((m, mi) => {
                    const branches = project.architectureNodes.filter((b) => b.parentId === m.id);
                    return (
                      <div key={m.id} className="flex flex-col gap-2">
                        {row(m, mi, main, false)}
                        {branches.map((b, bi) => row(b, bi, branches, true))}
                      </div>
                    );
                  })}
                  <form action={saveArchitectureNode} className="grid gap-3 rounded-xl border border-dashed border-line p-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="locale" value={locale} />
                    <Select label="New step: kind" name="kind" options={ARCH_KINDS} defaultValue="BACKEND" />
                    <Input label="Technology" name="technology" maxLength={80} />
                    <Select label="Position" name="parentId" options={parentOptions} defaultValue="" />
                    <SubmitButton variant="secondary">Add step</SubmitButton>
                  </form>
                </>
              );
            })()}
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
