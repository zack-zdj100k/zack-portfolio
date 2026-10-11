import { localStorage } from "@/server/storage";

const TYPES: Record<string, string> = {
  webp: "image/webp",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  avif: "image/avif",
  glb: "model/gltf-binary",
};

/** Serves files uploaded with the local storage driver. Uploads are public images and models. */
export async function GET(_request: Request, { params }: RouteContext<"/media/[...key]">) {
  const key = (await params).key.join("/");
  let body: Buffer | null = null;
  try {
    body = await localStorage().get(key);
  } catch {
    body = null;
  }
  if (!body) return new Response("Not found", { status: 404 });
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  return new Response(new Uint8Array(body), {
    headers: {
      "content-type": TYPES[ext] ?? "application/octet-stream",
      // Keys are random and never reused, so files can be cached forever.
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
    },
  });
}
