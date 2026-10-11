import { hash, verify } from "@node-rs/argon2";
import { randomBytes } from "node:crypto";

// argon2id with OWASP's recommended minimum (19 MiB, 2 passes). No "server-only" import:
// scripts/create-admin.ts uses this module too.
const OPTIONS = { memoryCost: 19_456, timeCost: 2, parallelism: 1 } as const;

export function hashPassword(password: string) {
  return hash(password.normalize("NFKC"), OPTIONS);
}

export async function verifyPassword(password: string, stored: string) {
  try {
    return await verify(stored, password.normalize("NFKC"));
  } catch {
    return false;
  }
}

// Compared against when the email doesn't exist, so login timing doesn't reveal accounts.
let dummy: Promise<string> | null = null;
export function dummyHash() {
  dummy ??= hashPassword(randomBytes(12).toString("hex"));
  return dummy;
}

export const MIN_PASSWORD_LENGTH = 12;
