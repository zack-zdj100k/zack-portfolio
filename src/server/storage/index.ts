import "server-only";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "@/server/env";
import { assertSafeKey, CloudinaryStorage } from "./cloudinary";

// Storage abstraction. "local" writes to ./uploads (development, or a VPS with a persistent disk).
// "cloudinary" uploads to Cloudinary and serves from its CDN (serverless hosts have no disk).
export interface Storage {
  readonly driver: "LOCAL" | "CLOUDINARY";
  /** Stores the file and returns its public URL. */
  put(key: string, body: Buffer, contentType: string): Promise<string>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
}

export { assertSafeKey };

class LocalStorage implements Storage {
  readonly driver = "LOCAL" as const;
  private root = path.resolve(/*turbopackIgnore: true*/ process.cwd(), env.STORAGE_LOCAL_DIR);
  private resolve(key: string) {
    assertSafeKey(key);
    const full = path.resolve(this.root, key);
    if (!full.startsWith(this.root + path.sep)) throw new Error("Invalid storage key");
    return full;
  }
  async put(key: string, body: Buffer) {
    const full = this.resolve(key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, body);
    return `/media/${key}`;
  }
  async get(key: string) {
    try {
      return await readFile(this.resolve(key));
    } catch {
      return null;
    }
  }
  async delete(key: string) {
    await rm(this.resolve(key), { force: true });
  }
}

let instance: Storage | null = null;
export function getStorage(): Storage {
  instance ??= env.STORAGE_DRIVER === "cloudinary" ? new CloudinaryStorage(env.CLOUDINARY_URL, env.CLOUDINARY_FOLDER) : new LocalStorage();
  return instance;
}

/** Local storage regardless of the configured driver (for serving files uploaded before a switch). */
export const localStorage = () => new LocalStorage();
