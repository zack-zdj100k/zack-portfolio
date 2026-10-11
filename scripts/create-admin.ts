/**
 * Sets the admin access code (the only thing the login page asks for). There is no public sign-up.
 *
 *   npm run admin:code                       the owner account (created on first run)
 *   npm run admin:code -- other@example.com  a second account, each with its own code
 *
 * The code is typed at a hidden prompt, so it never appears in shell history. Once signed in, it can
 * also be changed in Admin → Settings.
 */
import "dotenv/config";
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/server/generated/prisma/client";
import { hashPassword, MIN_PASSWORD_LENGTH } from "../src/server/auth/password";

function askHidden(question: string): Promise<string> {
  let muted = false;
  const output = new Writable({
    write(chunk, _enc, cb) {
      if (!muted) process.stdout.write(chunk);
      cb();
    },
  });
  const rl = createInterface({ input: process.stdin, output, terminal: true });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    muted = true;
  });
}

async function main() {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  // The account name is internal (audit log only); without one, use the oldest account or "owner".
  const arg = process.argv[2]?.trim().toLowerCase();
  if (arg && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(arg)) {
    console.error("Usage: npm run admin:code [-- name@example.com]");
    process.exit(1);
  }
  const existing = arg ? null : await prisma.adminUser.findFirst({ orderBy: { createdAt: "asc" } });
  const email = arg ?? existing?.email ?? "owner@admin.local";

  // Non-interactive use (CI, hosting consoles): ADMIN_CODE env var (ADMIN_PASSWORD still accepted).
  const fromEnv = process.env.ADMIN_CODE ?? process.env.ADMIN_PASSWORD;
  const password = fromEnv ?? (await askHidden(`New access code (min ${MIN_PASSWORD_LENGTH} characters): `));
  if (password.length < MIN_PASSWORD_LENGTH) {
    console.error(`The code must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    process.exit(1);
  }
  if (!fromEnv) {
    const again = await askHidden("Repeat the code: ");
    if (again !== password) {
      console.error("The codes don't match.");
      process.exit(1);
    }
  }

  const passwordHash = await hashPassword(password);
  const admin = await prisma.adminUser.upsert({ where: { email }, update: { passwordHash }, create: { email, passwordHash } });
  // A new code signs out every existing session.
  await prisma.adminSession.deleteMany({ where: { adminId: admin.id } });
  await prisma.$disconnect();
  console.log("Access code saved. Open /admin and enter it.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
