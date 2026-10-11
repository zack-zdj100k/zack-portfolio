import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/server/db";
import { removePortrait, saveExperience, deleteExperience, saveProfile, saveProfileTranslation, uploadPortrait } from "@/server/actions/profile";
import { Card, Checkbox, Flash, Input, LocaleTabs, PageTitle, Textarea, StatusBadge } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/buttons";
import { editLocale, translationStates } from "@/components/admin/params";
import { dir, localeNames } from "@/lib/i18n/locales";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfileAdmin({ searchParams }: PageProps<"/admin/profile">) {
  const sp = await searchParams;
  const locale = editLocale(sp);
  const profile = await prisma.profile.findUniqueOrThrow({ where: { id: 1 }, include: { translations: true, portrait: true } });
  const experience = await prisma.experienceItem.findMany({ orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }], include: { translations: true } });
  const tr = profile.translations.find((t) => t.locale === locale);
  const en = profile.translations.find((t) => t.locale === "en");

  return (
    <div className="flex flex-col gap-8">
      <PageTitle title="Profile" description="Your name, title, introduction and About page. Empty fields are simply not shown on the site." />
      <Flash ok={sp.ok} error={sp.error} />

      <Card title="Identity">
        <form action={saveProfile} className="grid gap-5 md:grid-cols-2">
          <Input label="Public name" name="publicName" defaultValue={profile.publicName} required maxLength={40} hint="Shown in the hero, header and footer." />
          <Input label="Full name" name="fullName" defaultValue={profile.fullName} maxLength={120} hint="Optional. Only shown on About when the box below is ticked." />
          <div className="md:col-span-2">
            <Checkbox label="Show my full name on the About page" name="showFullName" defaultChecked={profile.showFullName} />
          </div>
          <Input
            label="Languages I speak"
            name="languages"
            defaultValue={profile.languages.join(", ")}
            className="md:col-span-2"
            hint="Comma-separated, e.g. Arabic, French, English. Leave empty to hide."
          />
          <p className="text-sm text-mist/60 md:col-span-2">
            Skills and how you use them are edited in{" "}
            <Link href="/admin/skills" className="text-mist underline decoration-ice/50 underline-offset-4">
              Skills
            </Link>
            .
          </p>
          <div className="md:col-span-2">
            <SubmitButton>Save identity</SubmitButton>
          </div>
        </form>
      </Card>

      <Card title="Profile photo" description="Shown on the About page. Until you upload one, a neutral placeholder is shown.">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="relative aspect-[4/5] w-40 shrink-0 overflow-hidden rounded-2xl border border-line bg-ink-3">
            {profile.portrait ? (
              <Image src={profile.portrait.url} alt="Current profile photo" fill sizes="160px" className="object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center text-xs text-mist/60">No photo</span>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <form action={uploadPortrait} className="flex flex-col gap-4">
              <Input label="Image (JPEG, PNG, WebP; up to 12 MB)" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required />
              <Input label="Description for screen readers (English)" name="alt" maxLength={200} placeholder="Zack smiling, wearing a dark jacket" />
              <div>
                <SubmitButton>{profile.portrait ? "Replace photo" : "Upload photo"}</SubmitButton>
              </div>
            </form>
            {profile.portrait && (
              <form action={removePortrait}>
                <SubmitButton variant="danger" confirm="Remove the photo from the About page?">
                  Remove photo
                </SubmitButton>
              </form>
            )}
          </div>
        </div>
      </Card>

      <Card
        title="Texts by language"
        description="The title appears in the hero and page titles. The short introduction appears on the home page, the biography on About."
      >
        <LocaleTabs basePath="/admin/profile" current={locale} states={translationStates(profile.translations)} />
        <form action={saveProfileTranslation} key={locale} className="grid gap-5">
          <input type="hidden" name="locale" value={locale} />
          <p className="text-sm text-mist/60">
            Editing: <strong className="text-mist">{localeNames[locale]}</strong>
            {!tr && " (no translation yet, the English text is shown to visitors)"}
          </p>
          <Input label="Professional title" name="title" defaultValue={tr?.title ?? (locale === "en" ? "" : en?.title)} required maxLength={160} dir={dir(locale)} />
          <Textarea label="Short introduction (home page)" name="intro" defaultValue={tr?.intro ?? (locale === "en" ? "" : en?.intro)} required rows={3} maxLength={600} dir={dir(locale)} />
          <Textarea label="Biography (About page)" name="bio" defaultValue={tr?.bio} rows={5} maxLength={3000} dir={dir(locale)} />
          <Input label="Location" name="location" defaultValue={tr?.location} maxLength={120} dir={dir(locale)} hint="Optional, e.g. Algiers, Algeria." />
          <Textarea
            label="Why work with me? (one strength per line)"
            name="whyMe"
            defaultValue={tr?.whyMe.join("\n")}
            rows={4}
            dir={dir(locale)}
            hint="Only things you can stand behind. Leave empty to hide the section."
          />
          <Textarea label="Outside of code (optional)" name="interest" defaultValue={tr?.interest} rows={2} maxLength={600} dir={dir(locale)} />
          <Checkbox label="I reviewed this translation" name="reviewed" defaultChecked={tr?.reviewed ?? locale === "en"} />
          <div>
            <SubmitButton>Save {localeNames[locale]} text</SubmitButton>
          </div>
        </form>
      </Card>

      <Card title="Experience" description="Only add real roles and dates. The section is hidden while it has no published entries.">
        <div className="flex flex-col gap-4">
          {experience.map((e) => {
            const t = e.translations.find((x) => x.locale === "en");
            return (
              <form key={e.id} action={saveExperience} className="grid gap-4 rounded-xl border border-line p-4 md:grid-cols-4">
                <input type="hidden" name="id" value={e.id} />
                <Input label="Role" name="role" defaultValue={t?.role} required className="md:col-span-2" />
                <Input label="From (YYYY-MM)" name="startDate" defaultValue={e.startDate.toISOString().slice(0, 7)} required />
                <Input label="To (YYYY-MM, empty = now)" name="endDate" defaultValue={e.endDate?.toISOString().slice(0, 7)} />
                <Input label="Organisation" name="organization" defaultValue={e.organization} className="md:col-span-2" />
                <Textarea label="Description" name="description" defaultValue={t?.description} rows={2} className="md:col-span-2" />
                <div className="flex flex-wrap items-center gap-3 md:col-span-4">
                  <Checkbox label="Published" name="published" defaultChecked={e.status === "PUBLISHED"} />
                  <StatusBadge status={e.status} />
                  <SubmitButton>Save</SubmitButton>
                  <SubmitButton variant="danger" formAction={deleteExperience} confirm="Delete this experience entry?">
                    Delete
                  </SubmitButton>
                </div>
              </form>
            );
          })}
          <form action={saveExperience} className="grid gap-4 rounded-xl border border-dashed border-line p-4 md:grid-cols-4">
            <Input label="Role" name="role" required className="md:col-span-2" />
            <Input label="From (YYYY-MM)" name="startDate" required placeholder="2024-03" />
            <Input label="To (YYYY-MM, empty = now)" name="endDate" />
            <Input label="Organisation" name="organization" className="md:col-span-2" />
            <Textarea label="Description" name="description" rows={2} className="md:col-span-2" />
            <div className="flex items-center gap-3 md:col-span-4">
              <Checkbox label="Published" name="published" />
              <SubmitButton variant="secondary">Add experience</SubmitButton>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
