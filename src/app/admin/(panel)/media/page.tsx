import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/server/db";
import { removeMedia, saveMediaAlt, uploadMedia } from "@/server/actions/inbox";
import { Badge, Card, Flash, Input, PageTitle } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/buttons";

export const metadata: Metadata = { title: "Media" };

export default async function MediaAdmin({ searchParams }: PageProps<"/admin/media">) {
  const sp = await searchParams;
  const media = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    include: { _count: { select: { projectImages: true, heroFrames: true, portraitOf: true, heroImageOf: true, heroDepthOf: true, heroModelOf: true, ogImageOf: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Media"
        description="Every uploaded image and model. Images are checked, resized and converted to WebP on upload; location data in photos is removed."
      />
      <Flash ok={sp.ok} error={sp.error} />
      <Card title="Upload images">
        <form action={uploadMedia} className="flex flex-wrap items-end gap-3">
          <Input label="Images (JPEG, PNG, WebP, AVIF; up to 12 MB each)" name="files" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple required className="min-w-0 flex-1" />
          <SubmitButton>Upload</SubmitButton>
        </form>
      </Card>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {media.map((m) => {
          const uses = Object.values(m._count).reduce((a, b) => a + b, 0);
          const alt = (m.alt as Record<string, string> | null)?.en ?? "";
          return (
            <li key={m.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-ink-2 p-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-ink-3">
                {m.kind === "IMAGE" ? (
                  <Image src={m.url} alt="" fill sizes="300px" className="object-contain" />
                ) : (
                  <span className="flex size-full items-center justify-center text-sm text-mist/60">3D model (.glb)</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-mist/60">
                <span className="truncate">{m.label ?? "Untitled"}</span>
                {m.width && (
                  <span>
                    {m.width}×{m.height}
                  </span>
                )}
                {uses > 0 ? <Badge tone="ok">used {uses}×</Badge> : <Badge>unused</Badge>}
                {m.storageKey.startsWith("public:") && <Badge>built-in</Badge>}
              </div>
              {m.kind === "IMAGE" && (
                <form action={saveMediaAlt} className="flex items-end gap-2">
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="locale" value="en" />
                  <Input label="Description (English)" name="alt" defaultValue={alt} maxLength={200} className="min-w-0 flex-1" />
                  <SubmitButton variant="secondary">Save</SubmitButton>
                </form>
              )}
              {uses === 0 && (
                <form action={removeMedia}>
                  <input type="hidden" name="id" value={m.id} />
                  <SubmitButton variant="danger" confirm="Delete this file permanently?">
                    Delete
                  </SubmitButton>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
