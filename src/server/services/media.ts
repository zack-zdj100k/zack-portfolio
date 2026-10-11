import "server-only";
import { randomBytes } from "node:crypto";
import sharp from "sharp";
import { prisma } from "@/server/db";
import { getStorage, localStorage } from "@/server/storage";

export const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
export const MAX_MODEL_BYTES = 25 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 50_000_000; // refuse decompression bombs
const MAX_EDGE = 2400;

export class UploadError extends Error {}

function randomKey(prefix: "images" | "models", ext: string) {
  const d = new Date();
  return `${prefix}/${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${randomBytes(12).toString("hex")}.${ext}`;
}

/**
 * Validates an uploaded image by decoding it (the extension and browser MIME type are ignored),
 * re-encodes it to WebP (which also strips EXIF/GPS metadata) and stores it.
 */
export async function saveImage(file: File, opts: { label?: string; alt?: Record<string, string>; keepAlpha?: boolean; maxEdge?: number } = {}) {
  if (!(file instanceof File) || file.size === 0) throw new UploadError("No file was selected.");
  if (file.size > MAX_IMAGE_BYTES) throw new UploadError("Image is larger than 12 MB.");
  const input = Buffer.from(await file.arrayBuffer());
  let meta: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
  try {
    meta = await sharp(input, { limitInputPixels: MAX_IMAGE_PIXELS }).metadata();
  } catch {
    throw new UploadError("This file is not a supported image (JPEG, PNG, WebP or AVIF).");
  }
  if (!meta.format || !["jpeg", "png", "webp", "avif", "heif"].includes(meta.format)) {
    throw new UploadError("Unsupported image format. Use JPEG, PNG, WebP or AVIF.");
  }
  if (!meta.width || !meta.height || meta.width < 16 || meta.height < 16) throw new UploadError("Image is too small.");

  const edge = opts.maxEdge ?? MAX_EDGE;
  const { data, info } = await sharp(input, { limitInputPixels: MAX_IMAGE_PIXELS })
    .rotate()
    .resize({ width: edge, height: edge, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 84, alphaQuality: 90, effort: 5 })
    .toBuffer({ resolveWithObject: true });

  const storage = getStorage();
  const key = randomKey("images", "webp");
  const url = await storage.put(key, data, "image/webp");
  return prisma.mediaAsset.create({
    data: {
      driver: storage.driver,
      storageKey: key,
      url,
      kind: "IMAGE",
      mimeType: "image/webp",
      width: info.width,
      height: info.height,
      bytes: data.length,
      label: opts.label ?? file.name.slice(0, 120),
      alt: opts.alt,
    },
  });
}

/** GLB (binary glTF) for hero option C. Checked by its magic header and declared length. */
export async function saveModel(file: File) {
  if (!(file instanceof File) || file.size === 0) throw new UploadError("No file was selected.");
  if (file.size > MAX_MODEL_BYTES) throw new UploadError("Model is larger than 25 MB.");
  const data = Buffer.from(await file.arrayBuffer());
  const magic = data.subarray(0, 4).toString("ascii");
  const version = data.readUInt32LE(4);
  const length = data.readUInt32LE(8);
  if (magic !== "glTF" || version !== 2 || length !== data.length) {
    throw new UploadError("This file is not a valid GLB (binary glTF 2.0) model.");
  }
  const storage = getStorage();
  const key = randomKey("models", "glb");
  const url = await storage.put(key, data, "model/gltf-binary");
  return prisma.mediaAsset.create({
    data: { driver: storage.driver, storageKey: key, url, kind: "MODEL", mimeType: "model/gltf-binary", bytes: data.length, label: file.name.slice(0, 120) },
  });
}

/** Deletes a media row and its stored file. Files shipped in /public ("public:" keys) are kept. */
export async function deleteMedia(id: string) {
  const media = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!media) return;
  await prisma.mediaAsset.delete({ where: { id } });
  if (media.storageKey.startsWith("public:")) return;
  const storage = media.driver === "CLOUDINARY" ? getStorage() : localStorage();
  await storage.delete(media.storageKey).catch(() => {});
}

/** How many places still use a media asset (so the library can block deleting it). */
export async function mediaUsage(id: string) {
  const [projects, frames, profile, settings, steps, ai, hotspots] = await Promise.all([
    prisma.projectImage.count({ where: { mediaId: id } }),
    prisma.heroFrame.count({ where: { mediaId: id } }),
    prisma.profile.count({ where: { portraitId: id } }),
    prisma.siteSettings.count({ where: { OR: [{ heroImageId: id }, { heroDepthId: id }, { heroModelId: id }, { ogImageId: id }] } }),
    prisma.processStep.count({ where: { mediaId: id } }),
    prisma.aiService.count({ where: { mediaId: id } }),
    prisma.projectHotspot.count({ where: { mediaId: id } }),
  ]);
  return projects + frames + profile + settings + steps + ai + hotspots;
}
