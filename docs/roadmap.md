# Roadmap

Legend: ✅ done and reviewed · 🟡 done, waiting for owner input · ⏳ not started

Last updated: 2026-10-11

| Phase | Status | Delivered | Owner input still needed |
| --- | --- | --- | --- |
| 0. Repository audit | ✅ | Audit below; source art in `assets/source/` | none |
| 1. Product + content model | ✅ | 13 locales (en default; es-MX/es-CO fall back to es), verified vs unknown facts split, draft/publish states | none |
| 2. Architecture + database | ✅ | Prisma schema (20 models) + 2 migrations, `docs/architecture.md` | none |
| 3. Design system + hero | ✅ | `DESIGN.md`, tokens in `globals.css`, Kanit + Montserrat (Cyrillic) + Alexandria (Arabic), hero options A/B/C | none (owner chose C) |
| 4. Public website | ✅ | Home, About, Projects + details, Services & Pricing, Referral, Contact, Privacy, 404; RTL; reduced motion | Bio, location, languages, photo |
| 5. Backend + admin | ✅ | Auth, dashboard + launch checklist, profile, hero, projects, services/pricing, referral offers + workflow, inquiries, testimonials, page text, languages, media, settings | Owner sets the admin access code (`npm run admin:code`) |
| 6. Integration + content | 🟡 | Real screenshots of KING 253, Boulboul Art Wall, ZODIC CAR; machine-drafted translations for all languages; prices and referral offers seeded as **drafts** | Confirm prices and referral terms, then publish; review translations; contact details; project types/status |
| 7. Review + handoff | ✅ | Playwright/Chromium at 390, 768, 1024, 1440 px (LTR + RTL), 29 end-to-end checks, typecheck + lint clean, `README.md`, `/impeccable critique` (23/32) + fixes | Choose hosting |
| 8. Round 6 requirements | ⏳ | Plan, content model, admin schema and acceptance checklist in [round-6-requirements.md](round-6-requirements.md): grouped skills + "How I Use My Technologies", per-project architecture + flow graph, editable How I Work, per-country referral offers (no wildcard), inclusive audience copy, AI services (available / Coming Soon), Mac-style screenshot frames, public Admin Dashboard Preview. Screenshot fixes 1, 3, 4, 5 done | Personal information (owner-information.md, "Round 6") and explicit approval to implement |

## Phase 0 audit (2026-10-10)

The folder was empty: no framework, package files or git repository, so the requested stack was
used as specified. The supplied "Jack, 3D Creator" design prompt was adapted: kept the dark #0C0C0C
base, Kanit, the #646973 → #BBCCD7 gradient display type, the light Services panel, stacked project
cards, scroll-revealed text and the magnetic button; dropped Vite, hotlinked third-party images/GIFs,
the "3D creator" and "five years of experience" copy, and the purple-orange button.

## Decisions made during the build

- **Next.js 16 caching:** `cacheComponents` turned off; public pages render per request from the
  database so admin edits are live instantly. Fine for a portfolio's traffic; revisit with
  `"use cache"` + tags if traffic grows.
- **Locales:** 13 URL prefixes. Colombian and Mexican Spanish are regional variants of `es` that
  override only a few words (cotización, celular, computador/a). Brazilian = `pt-BR`. Norwegian =
  Bokmål (`nb`).
- **Fonts:** Kanit has no Cyrillic or Arabic, so Montserrat (Cyrillic) and Alexandria (Arabic) fill
  in automatically.
- **Project images:** real screenshots captured from the owner's local builds of the three projects
  (labelled REAL). Stage is "In progress" for all three (none confirmed launched). KING 253 and
  Boulboul Art Wall are labelled "Client" because client quotes exist in their repositories; ZODIC CAR
  has no type label until the owner confirms.
- **Hero C model:** generated with TRELLIS from the cutout (owner approved sending it to a
  third-party service), then cleaned (floaters + red specks).
- **After the critique (owner answers, 2026-10-10):** WhatsApp-first on phones (floating button once a
  number is set), hero default = C with artwork-to-model handover, Projects heading turned into a
  message ("Real projects. Real screenshots."), About/Services keep their labels.
- **Round 3 (owner, 2026-10-10 evening):** hero back to A (original picture, gentler turn); the three
  hero words fade out slowly; home About = pull-cord lamp revealing intro, quick facts and a hanging
  ID badge; skills as a "periodic table of my stack" (home + About); glowing-edge buttons (project
  filters, pricing); 3D tilt service cards; How I work as pinned notes; Good to know as a bento;
  What I build as dark striped cards; budget slider per package (admin sets minimum, maximum and
  step; contact form is prefilled with the chosen budget). Owner-supplied component designs were
  rebuilt natively in the project's palette (no shadcn setup needed).
- **Hero 360° (owner, 2026-10-10 night):** the owner sent a video of his head turning 360°. It is
  now hero option B and the default: 60 background-removed frames scrubbed by scroll across one
  full turn (see [hero-3d.md](hero-3d.md)). Also fixed: the lamp's light cone made every phone page
  20 px too wide (in Arabic this clipped the hero words at the right edge).
- **Admin language:** the dashboard is in English; every public text can be edited per language.

- **Round 4 (owner, 2026-10-10 night):** the home page is now a full landing page (adds How I work,
  pricing with the budget slider and "Good to know", and the full contact section with photo and
  form); phones and tablets navigate with a half-circle page wheel on the right edge; the contact
  page shows the owner's photo, WhatsApp, phone, email and profile links (brand icons); the admin
  login asks only for an access code (`npm run admin:code`, or Admin → Settings). Waiting on the
  owner: phone and WhatsApp numbers, social links, approval of the GitHub link found in his git
  config, and whether the four DZD packages can be published (the slider only shows published
  prices).

- **Round 5 (owner, 2026-10-11):** one message across the site, "Let's scale your business, or
  build one." (home, contact, About, project pages, footer). Pricing is grouped into Websites, Mobile
  apps and Desktop software (plus custom platforms); each package has its own price bar, delivery
  time, what's included and optional additions, and a quote button that carries the chosen budget.
  App and desktop prices are "on request" until the owner sets them (none are invented). The owner
  confirmed and published the four DZD packages. Each project page now has a dashboard tour: real
  admin screens of KING 253, Boulboul Art Wall and ZODIC CAR (captured from the owner's local builds
  with his name and email hidden, and no customer data) with numbered markers explaining every
  icon, in 11 languages; edited in Admin → Projects → Dashboard tour. Source data:
  `prisma/data/dashboard-tours.ts`, `prisma/data/package-add-ons.ts`.

- **Round 6 (owner, 2026-10-11):** requirements added (see the Phase 8 row and
  [round-6-requirements.md](round-6-requirements.md)); implementation waits for owner approval.
  Fixed from the owner's error screenshots: the dashboard-tour "Remove" button (React dropped its
  `name`/`value`, so it saved instead of removing and blanked the English alt text), the profile
  photo blocked by `images.localPatterns`, and the half-cut heading at the bottom of the Boulboul Art
  Wall phone capture.

## Not built (by choice, can be added)

- Email notifications for new inquiries/referrals (needs an email provider such as Resend; the
  dashboard shows counts and a "new" badge meanwhile).
- Cloudflare Turnstile (honeypot + timer + rate limits are in place without a third party).
