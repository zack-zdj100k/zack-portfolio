"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/server/db";
import { dummyHash, hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from "@/server/auth/password";
import { createSession, destroySession, getAdmin, requireAdmin } from "@/server/auth/session";
import { clientIp, rateLimit } from "@/server/security/rate-limit";
import { audit } from "@/server/audit";

const schema = z.object({ code: z.string().min(1).max(500) });

export type LoginState = { error: string | null };

/** The admin signs in with an access code only (no email). The code is stored as an argon2id hash. */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({ code: formData.get("code") });
  if (!parsed.success) return { error: "Enter your access code." };
  const { code } = parsed.data;

  // 5 attempts per 15 minutes per IP, and 60 per hour from everywhere together (slows guessing
  // spread over many addresses).
  const ip = await clientIp();
  const allowed = (await rateLimit("login:ip", ip, 5, 900)) && (await rateLimit("login:all", "*", 60, 3600));
  if (!allowed) return { error: "Too many attempts. Wait 15 minutes and try again." };

  // Usually a single owner account; each account has its own code.
  const admins = await prisma.adminUser.findMany({ select: { id: true, passwordHash: true }, orderBy: { createdAt: "asc" } });
  let admin: { id: string } | null = null;
  for (const a of admins) {
    if (await verifyPassword(code, a.passwordHash)) {
      admin = a;
      break;
    }
  }
  // Same work when there is no account yet, so timing doesn't reveal it.
  if (admins.length === 0) await verifyPassword(code, await dummyHash());
  if (!admin) return { error: "That code is not correct." };

  await createSession(admin.id);
  await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
  await audit(admin.id, "login", "AdminUser", admin.id);
  redirect("/admin");
}

const codeSchema = z
  .object({
    current: z.string().min(1).max(500),
    next: z.string().min(MIN_PASSWORD_LENGTH, `The new code needs at least ${MIN_PASSWORD_LENGTH} characters.`).max(500),
    repeat: z.string().max(500),
  })
  .refine((v) => v.next === v.repeat, { message: "The two new codes don't match." });

export type CodeState = { error: string | null; ok?: boolean };

/** Admin → Settings: change the access code. Every other session is signed out. */
export async function changeAccessCode(_prev: CodeState, formData: FormData): Promise<CodeState> {
  const me = await requireAdmin();
  const parsed = codeSchema.safeParse({ current: formData.get("current"), next: formData.get("next"), repeat: formData.get("repeat") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the fields." };
  if (!(await rateLimit("code-change", me.id, 5, 900))) return { error: "Too many attempts. Wait 15 minutes and try again." };

  const admin = await prisma.adminUser.findUniqueOrThrow({ where: { id: me.id } });
  if (!(await verifyPassword(parsed.data.current, admin.passwordHash))) return { error: "The current code is not correct." };
  const others = await prisma.adminUser.findMany({ where: { id: { not: me.id } }, select: { passwordHash: true } });
  for (const o of others) {
    if (await verifyPassword(parsed.data.next, o.passwordHash)) return { error: "Choose a different code." };
  }

  await prisma.adminUser.update({ where: { id: me.id }, data: { passwordHash: await hashPassword(parsed.data.next) } });
  await prisma.adminSession.deleteMany({ where: { adminId: me.id } });
  await createSession(me.id);
  await audit(me.id, "access-code", "AdminUser", me.id);
  return { error: null, ok: true };
}

export async function logout() {
  const admin = await getAdmin();
  if (admin) await audit(admin.id, "logout", "AdminUser", admin.id);
  await destroySession();
  redirect("/admin/login");
}
