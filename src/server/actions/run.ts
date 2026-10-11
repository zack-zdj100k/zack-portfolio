import "server-only";
import { requireAdmin, type AdminIdentity } from "@/server/auth/session";
import { audit } from "@/server/audit";
import { done, errorMessage, fail, isRedirect, safeBack } from "./helpers";

/**
 * Wraps every admin mutation: authorises first, runs the work, writes the audit log and redirects
 * back with a flash message. Errors never leak internals to the browser.
 */
export async function adminAction(
  fd: FormData,
  opts: { back: string; entity: string; action: string; success: string },
  /** Returns the affected id, or { id, back } to land somewhere else (e.g. a new item's edit page). */
  work: (admin: AdminIdentity) => Promise<string | { id: string; back: string } | void | null>,
): Promise<never> {
  const admin = await requireAdmin();
  let back = safeBack(fd, opts.back);
  let entityId: string | null = null;
  try {
    const result = await work(admin);
    if (result && typeof result === "object") {
      entityId = result.id;
      back = result.back;
    } else {
      entityId = result ?? null;
    }
  } catch (e) {
    if (isRedirect(e)) throw e;
    fail(back, errorMessage(e));
  }
  await audit(admin.id, opts.action, opts.entity, entityId);
  done(back, opts.success);
}
