import "server-only";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/server/db";
import { env } from "@/server/env";

/** Client IP from the proxy headers. Only trustworthy behind a proxy that sets them (Vercel, nginx). */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/**
 * Fixed-window limiter stored in Postgres, so it works across serverless instances.
 * Keys are HMACed: no raw IPs or emails end up in the database.
 * Returns true when the request is allowed.
 */
export async function rateLimit(scope: string, subject: string, limit: number, windowSeconds: number) {
  const key = createHmac("sha256", env.SESSION_SECRET).update(`${scope}:${subject}`).digest("hex");
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowSeconds * 1000);
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimitBucket" ("key", "count", "resetAt") VALUES (${key}, 1, ${resetAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimitBucket"."resetAt" < ${now} THEN 1 ELSE "RateLimitBucket"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimitBucket"."resetAt" < ${now} THEN ${resetAt} ELSE "RateLimitBucket"."resetAt" END
    RETURNING "count"`;
  // Opportunistic cleanup of expired buckets.
  if (Math.random() < 0.02) await prisma.rateLimitBucket.deleteMany({ where: { resetAt: { lt: now } } });
  return (rows[0]?.count ?? 0) <= limit;
}

/** Same-origin check for state-changing requests (CSRF defence for route handlers). */
export async function isSameOrigin(): Promise<boolean> {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
