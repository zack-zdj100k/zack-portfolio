import type { Metadata } from "next";
import { prisma } from "@/server/db";
import { createSkill, createSkillGroup, deleteSkill, deleteSkillGroup, moveSkill, moveSkillGroup, saveSkill, saveSkillGroup } from "@/server/actions/skills";
import { Badge, Card, Checkbox, Flash, Input, LocaleTabs, PageTitle, Select, Textarea } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/buttons";
import { MoveButtons } from "@/components/admin/MoveButtons";
import { aggregateStates, editLocale } from "@/components/admin/params";
import { dir, localeNames } from "@/lib/i18n/locales";
import { stackSymbol } from "@/lib/stack";
import { tint } from "@/components/about/skill-tints";

export const metadata: Metadata = { title: "Skills" };

export default async function SkillsAdmin({ searchParams }: PageProps<"/admin/skills">) {
  const sp = await searchParams;
  const locale = editLocale(sp);
  const editing = typeof sp.edit === "string" ? sp.edit : null;
  const [groups, projects] = await Promise.all([
    prisma.skillGroup.findMany({
      orderBy: { sortOrder: "asc" },
      include: { translations: true, skills: { orderBy: { sortOrder: "asc" }, include: { translations: true, projects: true } } },
    }),
    prisma.project.findMany({ orderBy: { sortOrder: "asc" }, include: { translations: { where: { locale: "en" } } } }),
  ]);
  const groupOptions = groups.map((g) => ({ value: g.id, label: g.translations.find((t) => t.locale === "en")?.name ?? g.key }));
  const states = aggregateStates([...groups.flatMap((g) => g.translations), ...groups.flatMap((g) => g.skills.flatMap((s) => s.translations))]);
  const groupName = (g: (typeof groups)[number]) => g.translations.find((t) => t.locale === "en")?.name ?? g.key;
  // Same colours as the public table: one per visible group, in order.
  const visibleIndex = new Map(groups.filter((g) => g.visible).map((g, i) => [g.id, i]));
  const editHref = (id: string) => `/admin/skills?locale=${locale}&edit=${id}#skill-${id}`;
  const backTo = (id: string) => `/admin/skills?locale=${locale}&edit=${id}#skill-${id}`;

  return (
    <div className="flex flex-col gap-8">
      <PageTitle
        title="Skills"
        description={
          <>
            The periodic table on Home and About, and the &quot;How I use my technologies&quot; section on About. Groups keep frameworks, databases and tools out
            of &quot;Programming languages&quot;. No levels or ratings are shown. A skill appears in &quot;How I use&quot; only once it has a description or a
            linked project.
          </>
        }
      />
      <Flash ok={sp.ok} error={sp.error} />
      <LocaleTabs basePath="/admin/skills" current={locale} states={states} />

      <Card
        title="My stack, as a periodic table"
        description="Every technology, by group, as it appears on Home and About. Click a tile to edit it (name, symbol, group, how you use it, projects), × to delete it, + to add one to that group. A technology can be in several groups: add it to each one and the site shows a single tile lit by every group."
      >
        <form action={createSkill} className="mb-8 grid gap-3 rounded-xl border border-dashed border-line p-4 md:grid-cols-[1fr_120px_1fr_auto] md:items-end">
          <input type="hidden" name="locale" value={locale} />
          <Input label="New technology" name="name" required maxLength={60} placeholder="e.g. Kotlin" />
          <Input label="Symbol" name="symbol" maxLength={3} placeholder="Auto" />
          <Select label="Group" name="groupId" options={groupOptions} defaultValue={groups[0]?.id} />
          <SubmitButton>Add to the table</SubmitButton>
        </form>
        <div className="flex flex-col gap-6">
          {groups.map((g) => {
            const style = tint(visibleIndex.get(g.id) ?? 5);
            return (
              <div key={g.id} className="flex flex-col gap-2">
                <p className="flex items-center gap-2 text-sm font-medium text-mist/85">
                  <span aria-hidden className={`size-2.5 rounded-sm ${style.swatch}`} />
                  {groupName(g)}
                  {!g.visible && <Badge tone="warn">Hidden</Badge>}
                </p>
                <ul className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2">
                  {g.skills.map((s) => (
                    <li key={s.id} className={`relative ${s.visible && g.visible ? "" : "opacity-45"}`}>
                      <a
                        href={editHref(s.id)}
                        title={`Edit ${s.name}`}
                        className={`flex aspect-square flex-col justify-between rounded-xl p-2.5 transition-transform hover:-translate-y-0.5 ${style.tile} ${style.text} ${
                          editing === s.id ? "outline outline-2 outline-offset-2 outline-ice" : ""
                        }`}
                      >
                        <span className="text-[0.6rem] uppercase opacity-70">{s.visible ? "Edit" : "Hidden"}</span>
                        <span className="text-2xl font-bold leading-none">{s.symbol || stackSymbol(s.name)}</span>
                        <span className="truncate text-[0.65rem] opacity-80">{s.name}</span>
                      </a>
                      <form action={deleteSkill} className="absolute end-1.5 top-1.5">
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="locale" value={locale} />
                        <SubmitButton
                          variant="danger"
                          confirm={`Delete ${s.name} from ${groupName(g)}?`}
                          ariaLabel={`Delete ${s.name}`}
                          pendingText="…"
                          className="!size-7 !bg-ink/70 !px-0 text-base leading-none"
                        >
                          ×
                        </SubmitButton>
                      </form>
                    </li>
                  ))}
                  <li>
                    <a
                      href={`/admin/skills?locale=${locale}#add-${g.id}`}
                      title={`Add a technology to ${groupName(g)}`}
                      className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-line text-3xl text-mist/60 hover:border-ice/60 hover:text-mist"
                    >
                      +
                    </a>
                  </li>
                </ul>
              </div>
            );
          })}
        </div>
      </Card>

      {groups.map((g, gi) => {
        const gt = g.translations.find((t) => t.locale === locale);
        const gen = g.translations.find((t) => t.locale === "en");
        return (
          <Card
            key={`${g.id}-${locale}`}
            title={gen?.name ?? g.key}
            description={`${g.skills.length} skill(s). Texts edited in ${localeNames[locale]}.`}
            actions={
              <div className="flex items-center gap-3">
                {!g.visible && <Badge tone="warn">Hidden</Badge>}
                <MoveButtons action={moveSkillGroup} id={g.id} locale={locale} first={gi === 0} last={gi === groups.length - 1} label="group" />
              </div>
            }
          >
            <form action={saveSkillGroup} className="mb-6 grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
              <input type="hidden" name="id" value={g.id} />
              <input type="hidden" name="locale" value={locale} />
              <Input label={`Group name (${localeNames[locale]})`} name="name" defaultValue={gt?.name ?? gen?.name} required maxLength={80} dir={dir(locale)} />
              <div className="flex flex-col gap-2 pb-1">
                <Checkbox label="Shown on the site" name="visible" defaultChecked={g.visible} />
                <Checkbox label="Translation reviewed" name="reviewed" defaultChecked={gt?.reviewed ?? locale === "en"} />
              </div>
              <div className="flex gap-2">
                <SubmitButton variant="secondary">Save group</SubmitButton>
                <SubmitButton variant="danger" formAction={deleteSkillGroup} confirm="Delete this group and every skill in it?">
                  Delete
                </SubmitButton>
              </div>
            </form>

            <div className="flex flex-col gap-4">
              {g.skills.map((s, si) => {
                const st = s.translations.find((t) => t.locale === locale);
                const linked = new Set(s.projects.map((p) => p.projectId));
                return (
                  <div key={`${s.id}-${locale}`} id={`skill-${s.id}`} className="scroll-mt-24 rounded-xl border border-line p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="flex items-center gap-2 font-bold text-mist">
                        {s.name}
                        {!s.visible && <Badge tone="warn">Hidden</Badge>}
                      </p>
                      <MoveButtons action={moveSkill} id={s.id} locale={locale} first={si === 0} last={si === g.skills.length - 1} label={s.name} />
                    </div>
                    <details open={editing === s.id} className="group mt-2">
                      <summary className="cursor-pointer select-none text-sm text-ice/90 hover:text-ice">
                        <span className="group-open:hidden">Edit</span>
                        <span className="hidden group-open:inline">Close</span>
                      </summary>
                      <form action={saveSkill} className="mt-3 grid gap-4 md:grid-cols-4">
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="back" value={backTo(s.id)} />
                        <Input label="Name" name="name" defaultValue={s.name} required maxLength={60} hint="Not translated (brand names)." />
                        <Input label="Table symbol" name="symbol" defaultValue={s.symbol} maxLength={3} hint="Optional, e.g. Py. Empty = automatic." />
                        <Select label="Group" name="groupId" options={groupOptions} defaultValue={g.id} />
                        <div className="flex flex-col justify-end gap-2 pb-1">
                          <Checkbox label="Shown on the site" name="visible" defaultChecked={s.visible} />
                        </div>
                        <Textarea
                          label={`How I use it (${localeNames[locale]})`}
                          name="usage"
                          defaultValue={st?.usage}
                          rows={3}
                          maxLength={2000}
                          dir={dir(locale)}
                          className="md:col-span-4"
                          hint="Your own words: what you build with it and how. Leave empty to show only the name."
                        />
                        <fieldset className="md:col-span-4">
                          <legend className="mb-2 text-sm font-medium text-mist/85">Projects that show this skill</legend>
                          <div className="flex flex-wrap gap-x-6 gap-y-2">
                            {projects.map((p) => (
                              <label key={p.id} className="flex items-center gap-2 text-sm text-mist/85">
                                <input type="checkbox" name="projectIds" value={p.id} defaultChecked={linked.has(p.id)} className="size-4 accent-[#bbccd7]" />
                                {p.translations[0]?.title ?? p.slug}
                              </label>
                            ))}
                          </div>
                        </fieldset>
                        <div className="flex flex-wrap items-center gap-3 md:col-span-4">
                          <Checkbox label="Translation reviewed" name="reviewed" defaultChecked={st?.reviewed ?? locale === "en"} />
                          <SubmitButton>Save skill</SubmitButton>
                          <SubmitButton variant="danger" formAction={deleteSkill} confirm={`Delete ${s.name}?`}>
                            Delete
                          </SubmitButton>
                        </div>
                      </form>
                    </details>
                  </div>
                );
              })}
              <form action={createSkill} id={`add-${g.id}`} className="flex scroll-mt-24 flex-wrap items-end gap-3 rounded-xl border border-dashed border-line p-4">
                <input type="hidden" name="groupId" value={g.id} />
                <input type="hidden" name="locale" value={locale} />
                <Input label="Add a technology to this group" name="name" required maxLength={60} placeholder="e.g. Kotlin" className="min-w-0 flex-1" />
                <Input label="Symbol" name="symbol" maxLength={3} placeholder="Auto" className="w-28" />
                <SubmitButton variant="secondary">Add</SubmitButton>
              </form>
            </div>
          </Card>
        );
      })}

      <Card title="New group">
        <form action={createSkillGroup} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="locale" value={locale} />
          <Input label="Group name (English)" name="name" required maxLength={80} placeholder="e.g. Cloud" className="min-w-0 flex-1" />
          <SubmitButton variant="secondary">Add group</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
