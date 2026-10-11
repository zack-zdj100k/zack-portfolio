# ZACK: portfolio and lead-generation site

A trilingual-plus (13 languages) portfolio for a software engineer who builds websites, apps and
desktop software for businesses. Public site with a scroll-driven 3D hero, projects, services and
pricing, a referral programme and a contact form, plus a private admin dashboard to edit all of it.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · PostgreSQL ·
Prisma 7 · next-intl 4 · Motion · three.js · Zod · sharp · argon2id

| Doc | What's in it |
| --- | --- |
| [docs/architecture.md](docs/architecture.md) | Sitemap, data flow and database diagrams (match the code) |
| [docs/roadmap.md](docs/roadmap.md) | Phases, status, what still needs the owner |
| [docs/hero-3d.md](docs/hero-3d.md) | How hero options A, B and C work, and how to replace their assets |
| [docs/owner-information.md](docs/owner-information.md) | Personal facts and decisions still needed |
| [DESIGN.md](DESIGN.md) · [PRODUCT.md](PRODUCT.md) | Design system and product brief |

---

## 1. Run it locally

Requirements: Node 20.19+ (24 LTS recommended), PostgreSQL 15+, Python 3 with Pillow/numpy/scipy
(only to regenerate hero assets).

```bash
npm install                      # also generates the Prisma client
cp .env.example .env             # then edit DATABASE_URL and SESSION_SECRET
createdb zack_portfolio_dev
npm run db:migrate               # applies prisma/migrations
npm run db:seed                  # initial content (safe to re-run; never overwrites your edits)
npm run admin:code                # prompts for your admin access code (min 12 characters)
npm run dev                      # http://localhost:3000  →  redirects to /en (or the browser's language)
```

Admin: <http://localhost:3000/admin> (on the live site: `https://your-domain/admin`). The login asks
only for your **access code**. There is no public sign-up: the code is set with `npm run admin:code`
(run it again to replace it, which signs out every session) or changed in Admin → Settings.

Other scripts: `npm run lint`, `npm run typecheck`, `npm run build`, `npm run db:deploy` (production
migrations), `npm run hero:assets` (rebuild hero images, see docs/hero-3d.md).

## 2. Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `SESSION_SECRET` | yes | 32+ random characters (`openssl rand -base64 32`). Used to hash rate-limit keys. |
| `NEXT_PUBLIC_SITE_URL` | production | Public origin, no trailing slash. Used for canonical URLs, hreflang, sitemap, Open Graph. |
| `STORAGE_DRIVER` | no | `local` (default, writes `./uploads`) or `cloudinary` |
| `CLOUDINARY_URL` | with cloudinary | `cloudinary://API_KEY:API_SECRET@CLOUD_NAME` (Cloudinary dashboard → API Keys) |
| `CLOUDINARY_FOLDER` | no | Folder for uploads, default `zack-portfolio` |

Never commit `.env`. `.env.example` holds placeholders only.

## 3. Deploying

The site needs three things: somewhere to run Next.js, a PostgreSQL database, and somewhere to keep
uploaded images. Two setups that work:

**A. Managed (simplest):** Vercel (app) + Neon or Supabase (PostgreSQL) + Cloudinary (images).
1. Create the database; copy its connection string.
2. Create a Cloudinary account; copy the API environment variable.
3. Import the repository in Vercel. Set `DATABASE_URL`, `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL`,
   `STORAGE_DRIVER=cloudinary`, `CLOUDINARY_URL`.
4. Build command `npm run build`. Run `npm run db:deploy` and `npm run db:seed` once against the
   production database (from your machine with `DATABASE_URL` pointing at it), then
   `npm run admin:code`.
5. Optional: Vercel sets the `x-vercel-ip-country` header, which pre-selects the visitor's country
   on the pricing, referral and contact pages.

Serverless hosts have no persistent disk, so `STORAGE_DRIVER=local` must **not** be used there:
uploads would disappear.

**B. One server (VPS):** Node 24 + PostgreSQL + nginx (or Caddy) on the same machine.
`npm ci && npm run build && npm run db:deploy && npm start` behind the proxy, with
`STORAGE_DRIVER=local` and `./uploads` on a persistent disk. Configure the proxy to set
`X-Forwarded-For`/`X-Real-IP` (used for rate limiting).

Either way: serve over HTTPS (the admin cookie is `Secure` and `__Host-` prefixed in production).

## 4. Backups

| What | Where it lives | How to back it up |
| --- | --- | --- |
| Everything you type in the admin, inquiries, referrals | PostgreSQL | Daily `pg_dump -Fc "$DATABASE_URL" > zack-$(date +%F).dump`, keep 30 days, copy off the server. Managed providers (Neon, Supabase) have point-in-time restore: turn it on. |
| Uploaded images and 3D models | Cloudinary, or `./uploads` | Cloudinary keeps originals; export from its Media Library if you leave. For `local`, back up `./uploads` with the database dump (same night). |
| Built-in hero art, screenshots | `public/` in the repository | Versioned with the code. |

Restore: `pg_restore --clean -d "$DATABASE_URL" zack-2026-10-10.dump`, then copy `uploads/` back.
Test a restore once before launch.

## 5. Editing content (admin guide)

| I want to... | Go to |
| --- | --- |
| Change my name, title, introduction, bio, photo | Admin → Profile (texts per language, tab per language) |
| Group my technologies, say how I use each one, link the projects that show it | Admin → Skills |
| Add, reorder, hide or rewrite the How I Work steps (icon, image, text per language) | Admin → How I work |
| Choose hero option A, B or C, or replace the artwork / frames / 3D model | Admin → Hero 3D (each option has a preview link) |
| Add, edit, reorder, publish or delete a project, its images and links | Admin → Projects |
| Explain how a project is built (frontend, server, database, request flow) and edit its flow graph | Admin → Projects → (project) → How it's built (status Proposed shows a “Concept / proposed architecture” label) |
| Mark AI services Available now / Coming soon, edit text and visual, switch the waitlist on or off | Admin → AI services (waitlist sign-ups arrive in Inquiries → Waitlist) |
| Edit services, examples, packages and prices per country (minimum, maximum and slider step for the budget slider) | Admin → Services & pricing |
| Choose the eligible countries of each referral offer, and per country the currency, reward, project categories, conditions and status | Admin → Referral offers (a country that isn't listed sees “no offer in your country yet”) |
| Follow up inquiries and referrals (status, notes, archive, delete) | Admin → Inquiries / Referrals |
| Change any heading, button or message on the site | Admin → Page text |
| Hide a language, or remove the "translated automatically" note | Admin → Languages |
| Contact email, phone, WhatsApp, GitHub/LinkedIn/Indeed links | Admin → Settings (adding a WhatsApp number and ticking "show" also turns on the floating WhatsApp button on phones) |

Drafts: prices, referral offers (and each of their countries), AI services, experience entries, testimonials and projects can be **Draft**
(hidden). In the admin sidebar, **Drafts preview: ON** shows them on the live site to you only,
with a banner.

Translations: English is the reference. Every other language starts as a machine draft and shows a
short "translated automatically" note until you tick it as reviewed in Admin → Languages.

## 6. Security notes

- Admin access codes: argon2id (minimum 12 characters; a short phrase works well). Sessions: random token in an HTTP-only, `SameSite=Strict`, `Secure`
  cookie; only its SHA-256 is stored. 12-hour sessions.
- Every admin page and server action checks the session on the server (`requireAdmin`); the
  proxy redirect is only a convenience.
- Login: 5 attempts per 15 minutes per IP, and 60 per hour in total. Public forms: same-origin check, honeypot,
  minimum fill time, 5 per 10 minutes and 20 per day per IP. Limits are stored in PostgreSQL (hashed
  keys, no raw IPs).
- All input is validated with Zod on the server. Uploads are decoded and re-encoded (images) or
  checked by header (GLB); file type is never trusted from the browser. EXIF/GPS data is stripped.
- Errors shown to users never include internals; logs never include submitted personal data.
- Security headers: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
  `Permissions-Policy`.

No system is "100% secure". Keep dependencies updated (`npm audit`, `npm outdated`), use a strong
admin access code, and keep backups.
