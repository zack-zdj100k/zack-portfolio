/**
 * Moves the site's pictures to Cloudinary: every image in Admin → Media that is still stored with
 * the site (built-in screenshots and portrait in /public, and anything uploaded locally to ./uploads)
 * is uploaded, and its Media entry is switched to the Cloudinary copy. Pages, projects and settings
 * keep pointing at the same Media entries, so nothing else changes.
 *
 *   npm run media:cloudinary -- --dry-run     list what would move, change nothing
 *   npm run media:cloudinary                  move them
 *
 * Needs DATABASE_URL (the database the live site uses) and CLOUDINARY_URL in the environment or
 * .env. Run it from this folder on the computer that has ./uploads. Safe to run again: only entries
 * not yet on Cloudinary are touched. The originals are not deleted. The hero's artwork stays with
 * the site (see keepWithSite in src/lib/static-media.ts).
 */
import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/server/generated/prisma/client";
import { CloudinaryStorage } from "../src/server/storage/cloudinary";
import { keepWithSite, staticCloudKey } from "../src/lib/static-media";

const dryRun = process.argv.includes("--dry-run");
const root = path.resolve(__dirname, "..");

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL (the live site's database).");
  if (!process.env.CLOUDINARY_URL) throw new Error("Set CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME (Cloudinary → Settings → API Keys).");
  const cloud = new CloudinaryStorage(process.env.CLOUDINARY_URL, process.env.CLOUDINARY_FOLDER || "zack-portfolio");
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  const localDir = path.resolve(root, process.env.STORAGE_LOCAL_DIR || "./uploads");

  const assets = await prisma.mediaAsset.findMany({ where: { driver: "LOCAL" }, orderBy: { createdAt: "asc" } });
  let moved = 0;
  let kept = 0;
  const missing: string[] = [];
  const failed: string[] = [];

  for (const a of assets) {
    const builtIn = a.storageKey.startsWith("public:");
    const url = builtIn ? a.storageKey.slice("public:".length) : null;
    if (url && keepWithSite(url)) {
      kept++;
      continue;
    }
    const file = url ? path.join(root, "public", url) : path.join(localDir, a.storageKey);
    const key = url ? staticCloudKey(url) : a.storageKey;
    let body: Buffer;
    try {
      body = await readFile(file);
    } catch {
      missing.push(`${a.label ?? a.id}: ${path.relative(root, file)}`);
      continue;
    }
    if (dryRun) {
      console.log(`would move  ${path.relative(root, file)}  →  ${key}`);
      moved++;
      continue;
    }
    try {
      const cdnUrl = await cloud.put(key, body, a.mimeType);
      await prisma.mediaAsset.update({ where: { id: a.id }, data: { driver: "CLOUDINARY", storageKey: key, url: cdnUrl } });
      console.log(`moved  ${path.relative(root, file)}`);
      moved++;
    } catch (e) {
      failed.push(`${path.relative(root, file)}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  console.log(
    `\n${dryRun ? "Would move" : "Moved"} ${moved} picture(s) to Cloudinary. ${kept} built-in hero file(s) stay with the site.` +
      (dryRun ? "\nNothing was changed (dry run)." : ""),
  );
  if (missing.length) console.log(`\nNot found on this computer (left as they are):\n  ${missing.join("\n  ")}`);
  if (failed.length) {
    console.log(`\nFailed (left as they are; run again to retry):\n  ${failed.join("\n  ")}`);
    process.exitCode = 1;
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
