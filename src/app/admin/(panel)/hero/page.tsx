import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/server/db";
import { removeHeroModel, setHeroMode, uploadDepthMap, uploadFrames, uploadHeroImage, uploadHeroModel } from "@/server/actions/hero";
import { Badge, Card, Flash, Input, PageTitle } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/buttons";

export const metadata: Metadata = { title: "Hero 3D" };

const MODES = [
  {
    value: "DEPTH",
    name: "A. Depth effect",
    text: "Your cutout artwork becomes a 3D surface: it turns about 25 degrees as visitors scroll, with a moving rim light. Sharpest image, lightest download.",
  },
  {
    value: "SEQUENCE",
    name: "B. Turntable",
    text: "Frames from your 360° video with the background removed: the head turns a full circle as visitors scroll. The default.",
  },
  {
    value: "MODEL",
    name: "C. 3D model",
    text: "A real GLB model that can turn all the way round. Needs a model file. Without one, B is shown instead.",
  },
] as const;

export default async function HeroAdmin({ searchParams }: PageProps<"/admin/hero">) {
  const sp = await searchParams;
  const settings = await prisma.siteSettings.findUniqueOrThrow({
    where: { id: 1 },
    include: { heroImage: true, heroDepth: true, heroModel: true, heroFrames: { orderBy: { sortOrder: "asc" }, include: { media: true } } },
  });

  return (
    <div className="flex flex-col gap-8">
      <PageTitle
        title="Hero 3D"
        description="Choose how your 3D portrait moves on the home page. Everyone who prefers reduced motion, or whose browser can't run 3D, sees the still artwork."
      />
      <Flash ok={sp.ok} error={sp.error} />

      <Card title="Active option" description="Use the preview links to compare all three on the live page before choosing.">
        <form action={setHeroMode} className="flex flex-col gap-4">
          <fieldset className="grid gap-3 lg:grid-cols-3">
            <legend className="sr-only">Hero option</legend>
            {MODES.map((m) => (
              <label key={m.value} className="flex cursor-pointer flex-col gap-2 rounded-2xl border border-line p-5 has-[:checked]:border-mist has-[:checked]:bg-ink-3">
                <span className="flex items-center gap-3">
                  <input type="radio" name="mode" value={m.value} defaultChecked={settings.heroMode === m.value} className="size-4 accent-[#bbccd7]" />
                  <span className="font-bold text-mist">{m.name}</span>
                  {m.value === "MODEL" && !settings.heroModel && <Badge tone="warn">No model yet</Badge>}
                </span>
                <span className="text-sm text-mist/65">{m.text}</span>
                <a href={`/en?hero=${m.value.toLowerCase()}`} target="_blank" rel="noopener" className="mt-1 text-sm text-ice underline underline-offset-4">
                  Preview {m.name.slice(0, 1)}
                </a>
              </label>
            ))}
          </fieldset>
          <div>
            <SubmitButton>Use this option</SubmitButton>
          </div>
        </form>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="A. Artwork and depth map" description="The artwork needs a transparent background (PNG or WebP). The depth map is grayscale: white = closest to the viewer.">
          <div className="mb-5 grid grid-cols-2 gap-3">
            {settings.heroImage && (
              <div className="relative aspect-square overflow-hidden rounded-xl bg-ink-3">
                <Image src={settings.heroImage.url} alt="Current hero artwork" fill sizes="200px" className="object-contain" />
              </div>
            )}
            {settings.heroDepth && (
              <div className="relative aspect-square overflow-hidden rounded-xl bg-ink-3">
                <Image src={settings.heroDepth.url} alt="Current depth map" fill sizes="200px" className="object-contain" />
              </div>
            )}
          </div>
          <form action={uploadHeroImage} className="mb-4 flex flex-wrap items-end gap-3">
            <Input label="Replace artwork" name="file" type="file" accept="image/png,image/webp" required className="min-w-0 flex-1" />
            <SubmitButton variant="secondary">Upload</SubmitButton>
          </form>
          <form action={uploadDepthMap} className="flex flex-wrap items-end gap-3">
            <Input label="Replace depth map" name="file" type="file" accept="image/png,image/webp,image/jpeg" required className="min-w-0 flex-1" />
            <SubmitButton variant="secondary">Upload</SubmitButton>
          </form>
          <p className="mt-4 text-xs text-mist/55">
            Replacing the artwork? Regenerate a matching depth map with <code>npm run hero:assets</code> (see docs/hero-3d.md), or the
            effect will not line up.
          </p>
        </Card>

        <Card title="B. Turntable frames" description={`${settings.heroFrames.length} frames. Upload a new set to replace them all.`}>
          <div className="mb-5 grid grid-cols-6 gap-1.5 sm:grid-cols-10">
            {settings.heroFrames.map((f, i) => (
              <div key={f.id} className="relative aspect-[3/5] overflow-hidden rounded-lg bg-ink-3">
                <Image src={f.media.url} alt={`Frame ${i + 1}`} fill sizes="80px" className="object-contain" />
              </div>
            ))}
          </div>
          <form action={uploadFrames} className="flex flex-col gap-3">
            <Input
              label="New frames (select all files at once)"
              name="files"
              type="file"
              accept="image/png,image/webp,image/jpeg"
              multiple
              required
              hint="Played in file-name order (000.webp, 001.webp...). Best: 36 to 60 frames of one full turn, same framing, transparent background. A new 360° video can be turned into frames with scripts/build-hero-turntable.py."
            />
            <div>
              <SubmitButton variant="secondary" confirm="Replace all turntable frames?">
                Replace frames
              </SubmitButton>
            </div>
          </form>
        </Card>
      </div>

      <Card title="C. 3D model (GLB)" description="Binary glTF 2.0 (.glb), up to 25 MB. Smaller is better for phones: aim for under 6 MB.">
        {settings.heroModel ? (
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-mist/80">
            <Badge tone="ok">Uploaded</Badge>
            <span>{settings.heroModel.label}</span>
            <span className="text-mist/60">{(settings.heroModel.bytes / 1024 / 1024).toFixed(1)} MB</span>
            <form action={removeHeroModel}>
              <input type="hidden" name="id" value={settings.heroModel.id} />
              <SubmitButton variant="danger" confirm="Remove the 3D model from the hero?">
                Remove
              </SubmitButton>
            </form>
          </div>
        ) : (
          <p className="mb-4 text-sm text-mist/60">No model uploaded. docs/hero-3d.md explains how to make one from your artwork.</p>
        )}
        <form action={uploadHeroModel} className="flex flex-wrap items-end gap-3">
          <Input label="Upload .glb" name="file" type="file" accept=".glb,model/gltf-binary" required className="min-w-0 flex-1" />
          <SubmitButton variant="secondary">Upload model</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
