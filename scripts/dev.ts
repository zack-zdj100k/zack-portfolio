/**
 * `npm run dev`: the whole site, public pages + admin + API, on one port (default 3000).
 *
 * This is one Next.js app, so the "frontend" (pages) and the "backend" (admin, /api routes, server
 * actions) already share a server and a port; the separate piece is the PostgreSQL database. Before
 * starting, this script:
 *   1. checks the database is reachable (DATABASE_URL in .env) and applies any pending migrations,
 *   2. refreshes the generated database client,
 *   3. makes sure the port is free (a second dev server would silently move to 3001),
 * then starts `next dev` and, once it answers, opens each main page once in the background so the
 * first visit from a browser or phone doesn't wait for it to compile.
 *
 *   npm run dev              port 3000
 *   PORT=4000 npm run dev    another port
 *   npm run dev:next         plain `next dev`, no checks
 */
import "dotenv/config";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { existsSync } from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT) || 3000;
const base = `http://localhost:${port}`;
const bin = (p: string) => path.join(root, "node_modules", p);

const say = (msg: string) => console.log(`\x1b[36m[dev]\x1b[0m ${msg}`);
const fail = (msg: string): never => {
  console.error(`\x1b[31m[dev]\x1b[0m ${msg}`);
  process.exit(1);
};

function run(args: string[]) {
  const r = spawnSync(process.execPath, args, { cwd: root, encoding: "utf8" });
  return { ok: r.status === 0, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

function portFree(p: number) {
  return new Promise<boolean>((resolve) => {
    const server = createServer()
      .once("error", () => resolve(false))
      .once("listening", () => server.close(() => resolve(true)));
    server.listen(p);
  });
}

async function waitUntilUp(timeoutMs: number) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    try {
      const r = await fetch(`${base}/en`, { redirect: "manual" });
      if (r.status < 500) return true;
    } catch {
      // not listening yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

/** Opens each main page once so Next compiles it now rather than on the first real visit. */
async function warmUp() {
  const pages = ["/en", "/en/about", "/en/projects", "/en/services-pricing", "/en/referral", "/en/contact", "/admin/login"];
  try {
    // One project page compiles them all.
    const html = await (await fetch(`${base}/en/projects`)).text();
    const project = html.match(/href="(\/en\/projects\/[a-z0-9-]+)"/)?.[1];
    if (project) pages.splice(3, 0, project);
  } catch {
    // ignore: the warm-up is only a convenience
  }
  for (const p of pages) {
    try {
      await fetch(`${base}${p}`, { redirect: "manual" });
    } catch {
      return;
    }
  }
  say(`All pages compiled. Site: ${base}  ·  Admin: ${base}/admin`);
}

async function main() {
  if (!existsSync(path.join(root, ".env"))) fail("No .env file. Copy .env.example to .env and set DATABASE_URL (see README).");
  if (!process.env.DATABASE_URL) fail("DATABASE_URL is not set in .env.");

  say("Checking the database and applying any new migrations…");
  const migrate = run([bin("prisma/build/index.js"), "migrate", "deploy"]);
  if (!migrate.ok) {
    if (/P1001|P1000|P1003|ECONNREFUSED|Can't reach database/i.test(migrate.out)) {
      fail(
        [
          "Can't reach the database in DATABASE_URL. Start PostgreSQL, then run npm run dev again:",
          "  macOS (Homebrew):   brew services start postgresql@16",
          "  macOS (Postgres.app): open the app and press Start",
          "  Linux:              sudo service postgresql start",
          "",
          migrate.out.trim().split("\n").slice(-4).join("\n"),
        ].join("\n"),
      );
    }
    fail(`Applying migrations failed:\n${migrate.out.trim()}`);
  }
  const applied = migrate.out.match(/(\d+) migrations? found/)?.[0];
  say(/No pending migrations/i.test(migrate.out) ? "Database is up to date." : `Database updated${applied ? ` (${applied})` : ""}.`);

  const generate = run([bin("prisma/build/index.js"), "generate"]);
  if (!generate.ok) fail(`Generating the database client failed:\n${generate.out.trim()}`);

  if (!(await portFree(port))) {
    fail(
      `Port ${port} is already in use: the site is probably already running at ${base} (in another terminal).\n` +
        "Stop that one with Ctrl+C first, or open it in the browser. To use another port: PORT=4000 npm run dev",
    );
  }

  say(`Starting the site on ${base} (pages, admin and API on the same port)…`);
  const next = spawn(process.execPath, [bin("next/dist/bin/next"), "dev", "--port", String(port)], { cwd: root, stdio: "inherit" });
  const stop = (signal: NodeJS.Signals) => next.kill(signal);
  process.on("SIGINT", () => stop("SIGINT"));
  process.on("SIGTERM", () => stop("SIGTERM"));
  next.on("exit", (code) => process.exit(code ?? 0));

  if (await waitUntilUp(180_000)) {
    say(`Ready. Site: ${base}  ·  Admin: ${base}/admin  ·  compiling the other pages in the background…`);
    void warmUp();
  }
}

void main();
