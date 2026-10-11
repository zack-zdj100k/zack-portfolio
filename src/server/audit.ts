import "server-only";
import { prisma } from "@/server/db";

/** Records who changed what (never the content itself). */
export async function audit(adminId: string, action: string, entity: string, entityId?: string | null) {
  await prisma.adminAuditLog.create({ data: { adminId, action, entity, entityId: entityId ?? null } }).catch(() => {});
}
