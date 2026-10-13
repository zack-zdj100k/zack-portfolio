import { createHash } from "node:crypto";

// No "server-only" import: scripts/media-to-cloudinary.ts uses this module too. Never import it from
// client code (it needs the API secret).

// Keys are generated server-side ("images/2026/10/<random>.webp"); this is defence in depth.
export function assertSafeKey(key: string) {
  if (!/^(images|models)\/[a-z0-9/_.-]+$/i.test(key) || key.includes("..")) throw new Error("Invalid storage key");
}

/** Cloudinary over its REST API (no SDK). Config: CLOUDINARY_URL=cloudinary://key:secret@cloud */
export class CloudinaryStorage {
  readonly driver = "CLOUDINARY" as const;
  private cloud: string;
  private key: string;
  private secret: string;
  constructor(
    cloudinaryUrl: string,
    private folder: string,
  ) {
    const m = cloudinaryUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (!m) throw new Error("STORAGE_DRIVER=cloudinary needs CLOUDINARY_URL=cloudinary://key:secret@cloud");
    [, this.key, this.secret, this.cloud] = m;
  }
  // Images are "image" resources (CDN transforms); GLB models are "raw" files kept byte-for-byte.
  private resource(key: string) {
    return key.startsWith("models/") ? "raw" : "image";
  }
  private publicId(key: string) {
    assertSafeKey(key);
    const id = `${this.folder.replace(/\/$/, "")}/${key}`;
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
    if (!res.ok) {
      // Cloudinary explains the problem in the body (bad key, folder not allowed...); no secrets in it.
      const detail = await res
        .json()
        .then((b: { error?: { message?: string } }) => b.error?.message)
        .catch(() => undefined);
      throw new Error(`Cloudinary ${action} failed with status ${res.status}${detail ? `: ${detail}` : ""}`);
    }
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

