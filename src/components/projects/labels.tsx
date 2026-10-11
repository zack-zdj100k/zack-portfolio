import { getTranslations } from "next-intl/server";
import type { ImageKind, ProjectCategory, ProjectOrigin, ProjectStage } from "@/server/generated/prisma/enums";

/** Category / origin / stage as small text tags. Text, not colour, carries the meaning. */
export async function ProjectTags({
  category,
  origin,
  stage,
  tone = "dark",
}: {
  category: ProjectCategory;
  origin: ProjectOrigin | null;
  stage: ProjectStage;
  tone?: "dark" | "paper";
}) {
  const t = await getTranslations("projects");
  const tags = [t(`category.${category}`), origin ? t(`origin.${origin}`) : null, t(`stage.${stage}`)].filter(Boolean);
  const cls =
    tone === "paper" ? "border-ink/25 text-ink/80" : "border-line text-mist/75";
  return (
    <ul className="flex flex-wrap gap-2" aria-label={t("tagsLabel")}>
      {tags.map((tag) => (
        <li key={tag} className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider ${cls}`}>
          {tag}
        </li>
      ))}
    </ul>
  );
}

/** One line under an image group when any image is not a real screenshot. */
export async function ImageKindNote({ kinds }: { kinds: ImageKind[] }) {
  const t = await getTranslations("projects");
  if (kinds.every((k) => k === "REAL")) return null;
  const kind = kinds.includes("CONCEPT") ? "CONCEPT" : kinds.includes("VISUAL_EXPLORATION") ? "VISUAL_EXPLORATION" : "DEMO";
  return <p className="text-sm text-mist/60">{t(`imageNote.${kind}`)}</p>;
}
