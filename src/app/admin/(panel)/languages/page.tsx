import type { Metadata } from "next";
import { prisma } from "@/server/db";
import { saveLanguages } from "@/server/actions/settings";
import { Card, Flash, PageTitle, Table } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/buttons";
import { localeNames, locales } from "@/lib/i18n/locales";

export const metadata: Metadata = { title: "Languages" };

export default async function LanguagesAdmin({ searchParams }: PageProps<"/admin/languages">) {
  const sp = await searchParams;
  const settings = await prisma.localeSetting.findMany();
  const byCode = new Map(settings.map((s) => [s.code, s]));

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Languages"
        description='Turn languages on or off in the language switcher. Until a language is marked "reviewed", its pages show a short note that the translation was made automatically.'
      />
      <Flash ok={sp.ok} error={sp.error} />
      <Card>
        <form action={saveLanguages} className="flex flex-col gap-5">
          <Table head={["Language", "Code", "In switcher", "Reviewed by me"]}>
            {locales.map((code) => {
              const s = byCode.get(code);
              return (
                <tr key={code}>
                  <td className="px-4 py-3 text-mist" lang={code}>
                    {localeNames[code]}
                  </td>
                  <td className="px-4 py-3 text-mist/60">{code}</td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      name={`enabled:${code}`}
                      defaultChecked={code === "en" || (s?.enabled ?? true)}
                      disabled={code === "en"}
                      aria-label={`${localeNames[code]} shown in the switcher`}
                      className="size-4 accent-[#bbccd7]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      name={`reviewed:${code}`}
                      defaultChecked={s?.reviewed ?? code === "en"}
                      aria-label={`${localeNames[code]} reviewed`}
                      className="size-4 accent-[#bbccd7]"
                    />
                  </td>
                </tr>
              );
            })}
          </Table>
          <p className="text-sm text-mist/60">
            Turning a language off hides it from the switcher; its pages still open for anyone who has the link. English is the reference and is
            always on.
          </p>
          <div>
            <SubmitButton>Save languages</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
