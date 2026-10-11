import "server-only";
import { clientIp, isSameOrigin, rateLimit } from "./rate-limit";

export type FormFailure = { ok: false; error: "validation" | "rate_limited" | "server" | "forbidden"; fields?: Record<string, string> };

const MIN_FILL_MS = 2500; // humans don't fill a form in under 2.5 s

/**
 * Shared abuse checks for public forms. Returns a failure response, or null when the request may
 * proceed. Bots that trip the honeypot or the timer get a fake success, so they learn nothing.
 */
export async function checkPublicForm(
  scope: string,
  body: Record<string, unknown>,
): Promise<{ response: Response | null; silentlyDrop: boolean }> {
  if (!(await isSameOrigin())) {
    return { response: Response.json({ ok: false, error: "forbidden" } satisfies FormFailure, { status: 403 }), silentlyDrop: false };
  }
  const startedAt = Number(body._t);
  const age = Date.now() - startedAt;
  const honeypot = typeof body.website === "string" && body.website.trim() !== "";
  // No maximum age: a phone tab left open overnight must still deliver its message.
  if (honeypot || !Number.isFinite(startedAt) || startedAt <= 0 || age < MIN_FILL_MS) {
    return { response: Response.json({ ok: true }), silentlyDrop: true };
  }
  const ip = await clientIp();
  const allowed = (await rateLimit(scope, ip, 5, 600)) && (await rateLimit(`${scope}:day`, ip, 20, 86_400));
  if (!allowed) {
    return { response: Response.json({ ok: false, error: "rate_limited" } satisfies FormFailure, { status: 429 }), silentlyDrop: false };
  }
  return { response: null, silentlyDrop: false };
}

/** Parses a JSON body of bounded size; returns null for anything else. */
export async function readJson(request: Request, maxBytes = 32_000): Promise<Record<string, unknown> | null> {
  if (!request.headers.get("content-type")?.includes("application/json")) return null;
  const raw = await request.text();
  if (raw.length > maxBytes) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
