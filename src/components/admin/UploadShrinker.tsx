"use client";

import { useEffect } from "react";

const SHRINK_ABOVE = 1.5 * 1024 * 1024; // photos bigger than this are resized before upload
const MAX_EDGE = 2400; // same as the server (src/server/services/media.ts)

/**
 * Admin uploads: large photos (a phone picture is often 5-12 MB) are resized in the browser to at
 * most 2400 px and re-encoded as WebP before the form is sent. The server re-encodes them anyway,
 * so nothing is lost, and the request stays small. When the host limits request size (Vercel: 4.5
 * MB), a form whose files are still too big is stopped with an explanation instead of failing.
 */
export function UploadShrinker({ limitBytes }: { limitBytes: number | null }) {
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const pending = new Map<HTMLFormElement, Promise<void>>();

    const onChange = (e: Event) => {
      const input = e.target as HTMLInputElement;
      if (input.type !== "file" || !input.files?.length || !input.form) return;
      const files = [...input.files];
      if (!files.some(shrinkable)) return;
      const form = input.form;
      const job = Promise.all(files.map((f) => (shrinkable(f) ? shrink(f) : f))).then((out) => {
        const dt = new DataTransfer();
        out.forEach((f) => dt.items.add(f));
        input.files = dt.files;
      });
      pending.set(form, job.finally(() => pending.delete(form)));
    };

    // On the window, capturing: runs before React's own form handling, so stopping here stops the upload.
    const onSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement;
      if (!main.contains(form)) return;
      const job = pending.get(form);
      if (job) {
        // Still resizing: send once it's done.
        e.preventDefault();
        e.stopImmediatePropagation();
        void job.then(() => form.requestSubmit(e.submitter as HTMLElement | null));
        return;
      }
      if (!limitBytes) return;
      const total = [...form.querySelectorAll<HTMLInputElement>('input[type="file"]')].flatMap((i) => [...(i.files ?? [])]).reduce((n, f) => n + f.size, 0);
      if (total > limitBytes) {
        e.preventDefault();
        e.stopImmediatePropagation();
        window.alert(
          `These files add up to ${mb(total)} MB; the hosting accepts at most ${mb(limitBytes)} MB per upload. ` +
            "Upload fewer files at once, or a smaller file (3D models: under 4 MB).",
        );
      }
    };

    main.addEventListener("change", onChange);
    window.addEventListener("submit", onSubmit, true);
    return () => {
      main.removeEventListener("change", onChange);
      window.removeEventListener("submit", onSubmit, true);
    };
  }, [limitBytes]);
  return null;
}

const mb = (n: number) => (n / 1024 / 1024).toFixed(1);

function shrinkable(f: File) {
  return f.size > SHRINK_ABOVE && /^image\/(jpeg|png|webp|avif)$/.test(f.type);
}

/** Resizes to MAX_EDGE and re-encodes as WebP; returns the original if the browser can't, or if it isn't smaller. */
async function shrink(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.9));
    if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[a-z0-9]+$/i, "") + ".webp", { type: "image/webp", lastModified: file.lastModified });
  } catch {
    return file;
  }
}
