import "server-only";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "@/server/env";

// Storage abstraction. "local" writes to ./uploads (development, or a VPS with a persistent disk).
// "cloudinary" uploads to Cloudinary and serves from its CDN (serverless hosts have no disk).
export interface Storage {
  readonly driver: "LOCAL" | "CLOUDINARY";
  /** Stores the file and returns its public URL. */
  put(key: string, body: Buffer, contentType: string): Promise<string>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
}

// Keys are generated server-side ("images/2026/10/<random>.webp"); this is defence in depth.
export function assertSafeKey(key: string) {
  if (!/^(images|models)\/[a-z0-9/_.-]+$/i.test(key) || key.includes("..")) throw new Error("Invalid storage key");
}

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

/** Cloudinary over its REST API (no SDK). Config: CLOUDINARY_URL=cloudinary://key:secret@cloud */
class CloudinaryStorage implements Storage {
  readonly driver = "CLOUDINARY" as const;
  private cloud: string;
  private key: string;
  private secret: string;
  constructor() {
    const m = env.CLOUDINARY_URL.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (!m) throw new Error("STORAGE_DRIVER=cloudinary needs CLOUDINARY_URL=cloudinary://key:secret@cloud");
    [, this.key, this.secret, this.cloud] = m;
  }
  // Images are "image" resources (CDN transforms); GLB models are "raw" files kept byte-for-byte.
  private resource(key: string) {
    return key.startsWith("models/") ? "raw" : "image";
  }
  private publicId(key: string) {
    assertSafeKey(key);
    const id = `${env.CLOUDINARY_FOLDER.replace(/\/$/, "")}/${key}`;
    return this.resource(key) === "raw" ? id : id.replace(/\.[a-z0-9]+$/i, "");
  }
  private sign(params: Record<string, string | number>) {
    const toSign = Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join("&");
    return createHash("sha1").update(toSign + this.secret).digest("hex");
  }
  private url(key: string) {
    const id = this.publicId(key);
    return this.resource(key) === "raw"
      ? `https://res.cloudinary.com/${this.cloud}/raw/upload/${id}`
      : `https://res.cloudinary.com/${this.cloud}/image/upload/f_auto,q_auto/${id}`;
  }
  private async call(action: "upload" | "destroy", key: string, file?: Blob) {
    const params = { invalidate: "true", overwrite: "true", public_id: this.publicId(key), timestamp: Math.floor(Date.now() / 1000) };
    const form = new FormData();
    for (const [k, v] of Object.entries(params)) form.append(k, String(v));
    form.append("api_key", this.key);
    form.append("signature", this.sign(params));
    if (file) form.append("file", file);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${this.cloud}/${this.resource(key)}/${action}`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`Cloudinary ${action} failed with status ${res.status}`);
  }
  async put(key: string, body: Buffer, contentType: string) {
    await this.call("upload", key, new Blob([new Uint8Array(body)], { type: contentType }));
    return this.url(key);
  }
  async get(key: string) {
    const res = await fetch(this.url(key), { signal: AbortSignal.timeout(30_000) });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Cloudinary GET failed with status ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  }
  async delete(key: string) {
    await this.call("destroy", key);
  }
}

let instance: Storage | null = null;
export function getStorage(): Storage {
  instance ??= env.STORAGE_DRIVER === "cloudinary" ? new CloudinaryStorage() : new LocalStorage();
  return instance;
}

/** Local storage regardless of the configured driver (for serving files uploaded before a switch). */
export const localStorage = () => new LocalStorage();
