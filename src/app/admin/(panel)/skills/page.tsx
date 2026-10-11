import type { Metadata } from "next";
import { prisma } from "@/server/db";
import { createSkill, createSkillGroup, deleteSkill, deleteSkillGroup, moveSkill, moveSkillGroup, saveSkill, saveSkillGroup } from "@/server/actions/skills";
import { Badge, Card, Checkbox, Flash, Input, LocaleTabs, PageTitle, Select, Textarea } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/buttons";
import { MoveButtons } from "@/components/admin/MoveButtons";
import { aggregateStates, editLocale } from "@/components/admin/params";
import { dir, localeNames } from "@/lib/i18n/locales";

export const metadata: Metadata = { title: "Skills" };

export default async function SkillsAdmin({ searchParams }: PageProps<"/admin/skills">) {
  const sp = await searchParams;
  const locale = editLocale(sp);
  const [groups, projects] = await Promise.all([
    prisma.skillGroup.findMany({
      orderBy: { sortOrder: "asc" },
      include: { translations: true, skills: { orderBy: { sortOrder: "asc" }, include: { translations: true, projects: true } } },
    }),
    prisma.project.findMany({ orderBy: { sortOrder: "asc" }, include: { translations: { where: { locale: "en" } } } }),
  ]);
  const groupOptions = groups.map((g) => ({ value: g.id, label: g.translations.find((t) => t.locale === "en")?.name ?? g.key }));
  const states = aggregateStates([...groups.flatMap((g) => g.translations), ...groups.flatMap((g) => g.skills.flatMap((s) => s.translations))]);

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
                  <div key={`${s.id}-${locale}`} className="rounded-xl border border-line p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="flex items-center gap-2 font-bold text-mist">
                        {s.name}
                        {!s.visible && <Badge tone="warn">Hidden</Badge>}
                      </p>
                      <MoveButtons action={moveSkill} id={s.id} locale={locale} first={si === 0} last={si === g.skills.length - 1} label={s.name} />
                    </div>
                    <form action={saveSkill} className="grid gap-4 md:grid-cols-4">
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="locale" value={locale} />
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
                  </div>
                );
              })}
              <form action={createSkill} className="flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-line p-4">
                <input type="hidden" name="groupId" value={g.id} />
                <input type="hidden" name="locale" value={locale} />
                <Input label="Add a technology to this group" name="name" required maxLength={60} placeholder="e.g. Kotlin" className="min-w-0 flex-1" />
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
