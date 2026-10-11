# Round 6 requirements: plan, content model, admin schema, acceptance checklist

Status: **built (2026-10-11), owner approved implementation.** Owner facts that are still missing
(skill descriptions, confirmed architecture, referral countries, AI service descriptions) are left
empty or kept as drafts; nothing was invented. See "What still needs the owner" at the end.
All earlier requirements in [roadmap.md](roadmap.md), [PRODUCT.md](../PRODUCT.md) and
[architecture.md](architecture.md) still apply. Where this file changes an earlier decision, it says
so.

To update an existing installation: `npm install`, `npm run db:deploy` (or `db:migrate` locally),
then `npm run db:seed` (adds the new rows; never overwrites your edits).

Rules that apply to every item below: nothing is invented (skills, proficiency, project usage,
architecture facts, prices, rewards, AI service descriptions); every public text is editable per
language in the admin; new public text starts as a **draft** until the owner publishes it; reduced
motion is respected; layouts work from 390 px phones to 1440 px desktops, LTR and RTL.

---

## 1. Technical skills and how I use them

**Changes an earlier decision.** Today the skills are a JSON field on `Profile`
(`frontend / backend / databases / tools`), seeded from the stacks found in the owner's project
repositories (Next.js, React, TypeScript, Tailwind CSS, Node.js, NestJS, REST APIs, PostgreSQL,
Prisma, Drizzle ORM, Git, Playwright, Vitest, Cloudinary). That is what screenshot 2 shows. It is
replaced by owner-managed groups.

Groups (frameworks, databases and tools are never labelled as programming languages):

| Group | Items (owner-supplied) |
| --- | --- |
| Programming languages | Python, Java, C++, SQL, JavaScript, Dart |
| Web foundations | HTML, CSS |
| Mobile development | Flutter (framework, with Dart) |
| Database | SQLite |
| Data and reporting | Power BI |
| Database tools | Prisma ORM, Prisma Migrate |

Public: the periodic-table display (home + About) reads these groups; the filter chips become the
group names. A new **How I Use My Technologies** section lists each visible skill with the owner's
own explanation and links to the projects that demonstrate it. No proficiency bars or levels. The
section lists only skills that have a description or a linked project (the periodic table lists them
all), and hides itself until at least one has. The earlier stack list is kept in four **hidden**
"Previous list" groups so the owner can decide what to keep.

Schema (replaces `Profile.skills`):

```prisma
model SkillGroup {
  id           String                  @id @default(uuid())
  key          String                  @unique   // "languages", "web", "mobile", "database", "data", "db-tools"
  sortOrder    Int                     @default(0)
  visible      Boolean                 @default(true)
  translations SkillGroupTranslation[] // name per locale
  skills       Skill[]
}

model Skill {
  id           String             @id @default(uuid())
  groupId      String
  group        SkillGroup         @relation(fields: [groupId], references: [id], onDelete: Cascade)
  name         String             // brand names are not translated ("Power BI")
  symbol       String?            // periodic-table symbol override; default from src/lib/stack.ts
  sortOrder    Int                @default(0)
  visible      Boolean            @default(true)
  translations SkillTranslation[] // usage: "How I use it" (Text), reviewed flag
  projects     SkillProject[]     // projects that demonstrate it (owner-chosen)
}

model SkillProject {
  skillId   String
  projectId String
  @@id([skillId, projectId])
}
```

Admin, **Admin → Skills**: add, edit, reorder (up/down), hide/show and delete groups and skills;
write "How I use it" per language; tick the projects that demonstrate each skill.

## 2. Technical architecture for every project

Each project page gets a **How it's built** section in plain, client-friendly language:

- Frontend: how it is built and what the user interacts with.
- Backend / server: how requests and business logic are handled.
- Database: which one, and what kind of information it stores (never real records).
- Request flow: client/browser → website → server → database or external services.
- My role and the technologies actually used (the existing role text + technology list).

Plus a project-specific **architecture flow graph**, for example
`Client → Browser / Frontend → API → Backend / Server → Database`, with external services
(payments, image storage, email) branching off the server.

- Motion: the active step lights up as the visitor scrolls, and a subtle pulse travels along the
  connectors. With `prefers-reduced-motion`, everything is static and every step is shown at once.
- Accessibility: the graph is an ordered list (`<ol>`) with a text description per step, so screen
  readers and no-JS visitors get a static version. On phones it runs top to bottom.
- Honesty: a per-project **architecture status**. `CONFIRMED` shows no label. `PROPOSED` shows a
  "Concept / proposed architecture" badge. `HIDDEN` hides the section. Every new project, and every
  graph drafted from repository inspection, starts as `PROPOSED` until the owner confirms it.

Content model additions:

```prisma
enum ArchitectureStatus { HIDDEN PROPOSED CONFIRMED }
enum ArchitectureNodeKind { CLIENT FRONTEND API BACKEND DATABASE EXTERNAL }

// on Project
architectureStatus ArchitectureStatus @default(HIDDEN)
architectureNodes  ArchitectureNode[]

// on ProjectTranslation (all Text, optional)
frontendText  String?
backendText   String?
databaseText  String?
flowText      String?

model ArchitectureNode {
  id           String                       @id @default(uuid())
  projectId    String
  kind         ArchitectureNodeKind
  technology   String?                      // e.g. "Next.js", "PostgreSQL"
  parentId     String?                      // null = main chain; set = branches off that node
  sortOrder    Int                          @default(0)
  translations ArchitectureNodeTranslation[] // label + one-line description per locale
}
```

Admin, **Admin → Projects → (project) → Architecture**: status, the four texts per language, and
the nodes (add, edit, reorder, branch, delete), with a live preview of the graph.

## 3. Editable "How I Work" process

**Changes an earlier decision.** The steps were hard-coded (`STEPS` + `about.howIWork.*` in
`src/messages/*.json`, used on Home and About). They now live in the database, seeded once from those
texts in all 13 languages. The desktop "pinned notes" layout now handles any number of steps.

```prisma
model ProcessStep {
  id           String                   @id @default(uuid())
  icon         String?                  // lucide icon name from an allow-list
  mediaId      String?                  // optional image (MediaAsset)
  sortOrder    Int                      @default(0)
  visible      Boolean                  @default(true)
  translations ProcessStepTranslation[] // title, description, reviewed
}
```

Admin, **Admin → How I work**: add, edit, reorder, hide and delete steps; icon picker; optional
image upload; title and description per language.

## 4. Country-specific referral offers

**Changes an earlier decision.** Today `CountryOffer.market` is one country code or `"*"` (every
other country). The seeded draft "outside Algeria: 100 EUR" uses `"*"`, so every country would
qualify. The wildcard is removed: **a country is eligible only if the owner selects it.** Sharing
the euro does not make a country eligible.

```prisma
model ReferralOffer {                        // a programme, e.g. "Europe 2026"
  id           String                     @id @default(uuid())
  name         String                     // internal (admin only)
  status       PublishStatus              @default(DRAFT)
  sortOrder    Int                        @default(0)
  countries    ReferralOfferCountry[]
}

model ReferralOfferCountry {
  id                   String            @id @default(uuid())
  offerId              String
  country              String            // ISO 3166-1 alpha-2, chosen explicitly
  available            Boolean           @default(true)
  currency             String            // ISO 4217, per country (EUR, DZD, USD, GBP, ...)
  rewardMinor          BigInt
  categories           ProjectCategory[] // project categories covered
  minProjectValueMinor BigInt?
  status               PublishStatus     @default(DRAFT)
  translations         ReferralOfferCountryTranslation[] // eligibility, payoutConditions, terms, reviewed
  @@unique([country, offerId])
}
```

A country may appear in at most one **published** offer (checked on publish). Existing `Referral`
rows keep their saved reward snapshot. Migration: existing offers are copied over. The `"*"` offer
becomes a draft with **no countries** until the owner picks them.

Admin, **Admin → Referral offers**: a multi-select country picker with search and region shortcuts
(shortcuts only pre-tick, and the owner reviews every country). Each selected country can then be
edited on its own: availability, currency, reward, categories, conditions, translations and status.
"Change several countries at once" updates currency, reward, status, availability or categories for
the ticked countries. Offer texts (eligibility, payout conditions, terms) are the defaults; a country
can override any of them per language.

Public, **/referral**: the visitor picks their country first. Only that country's published,
available offer is shown, in its own currency, and the form only offers the project categories it
covers. With no offer, the page says "no referral offer in your country yet" and still shows the
contact link. The submit endpoint re-checks country and category on the server.

## 5. Intended audience

The site is for companies, small businesses, entrepreneurs and startups, and individuals with a
legitimate business, project or software idea, not only large companies. Copy is reviewed on Home,
About, Services and Contact in all 13 languages (messages + seeded page text), and `PRODUCT.md`
"Who it's for" is updated (done in this round, docs only). Services are offered for legitimate
projects and businesses. The contact form's project-type list gains "Idea / early stage".

## 6. AI services and availability

| Service | Status |
| --- | --- |
| AI agents | Available now, once the owner confirms the description |
| AI automations | Available now, once the owner confirms the description |
| AI-powered apps or web applications | Coming Soon |
| Finance AI | Coming Soon |
| Stock-market or trading bots / AI | Coming Soon |

- Available and Coming Soon items look clearly different: separate groups, a "Coming Soon" badge, a
  muted visual, and no price or "start now" button on Coming Soon items.
- No promises of investment returns, trading profits or financial outcomes, anywhere. Finance and
  trading cards carry a fixed note: "Software only. No financial advice and no promised returns."
- "Available now" items stay drafts until the owner writes or approves their description.

```prisma
enum AiServiceStatus { AVAILABLE COMING_SOON HIDDEN }
enum AiServiceCta    { CONTACT WAITLIST NONE }

model AiService {
  id              String                 @id @default(uuid())
  key             String                 @unique
  status          AiServiceStatus        @default(HIDDEN)
  cta             AiServiceCta           @default(CONTACT)
  waitlistEnabled Boolean                @default(false)
  mediaId         String?
  sortOrder       Int                    @default(0)
  publishStatus   PublishStatus          @default(DRAFT)
  translations    AiServiceTranslation[] // title, description, ctaLabel, reviewed
}
// ContactInquiry gains: aiServiceId String?, kind ("INQUIRY" | "WAITLIST")
```

Admin, **Admin → AI services**: status, description, visual, CTA, and a waitlist on/off switch per
service. Waitlist sign-ups land in **Inquiries** with a "Waitlist" filter, protected by the same
honeypot, timer and rate limits as the contact form.

## 7. Project screenshots in a Mac-style frame

- A new `DeviceFrame` component offers a browser window (traffic lights + address bar) or a laptop
  (thin bezel + base). The frame chrome stays thin (at most about 4% of the image height), so the
  screenshot keeps its size. It is used for wide gallery images, the dashboard tour and the admin
  showcase (item 8).
- On phones the laptop base and address bar are dropped, leaving only a 1-line top bar, so the
  screenshot uses the full width. Tall phone captures keep their own phone layout.
- Labels: `ImageKind` gains `VISUAL_EXPLORATION` next to `REAL`, `CONCEPT` and `DEMO`. Anything that
  is not `REAL` carries a visible badge on the frame. Another company's website is never shown as
  the owner's work. Real screenshots replace concept images as the owner sends them.

## 8. Public Admin Dashboard Preview

A marketing section (home + Services) that demonstrates what the owner's admin dashboards can do. It
is **not** the real admin.

- Features: project management, image uploads, pricing, referral offers, inquiries, translations,
  profile editing, How I Work editing (+ skills, AI services once built).
- Desktop: a sticky Mac-style frame next to the feature list. As each feature scrolls into view, the
  frame cross-fades to that feature's demo screen, and a short text explains what it manages.
- Demo screens are React mock-ups filled with **synthetic data only** (fictional names such as
  "Sample Café", no real inquiries, emails, phone numbers, credentials or session). They are not
  screenshots of the live admin.
- Phones and reduced motion: a static step-by-step list, each feature with its own framed screen,
  and no scroll-linked animation.
- Kept in sync: one registry, `src/lib/admin-showcase.ts`, maps every admin navigation entry to a
  showcase item or an explicit "not showcased" flag. A check fails the build if an admin route is
  added without an entry.
- `/admin` stays protected (session + proxy, unchanged). The showcase never imports admin code or
  data.

## 9. Screenshot-based error fixes (standing process)

For every error screenshot: identify the visible error and where it is before editing; fix that
issue and its direct cause only; keep unrelated features and design decisions; ask when the
screenshot doesn't show enough; verify at the relevant screen size; report fixed vs needs-info.

Log for this round (owner screenshots of 2026-10-11):

| # | Screenshot | Finding | Result |
| --- | --- | --- | --- |
| 1 | `/en/projects/boulboul-art-wall`, below the gallery | The phone capture ended in a half-cut line of the next heading ("Une décoration"), so the card looked broken | **Fixed**: the cut line is removed from `public/projects/boulboul-art-wall/0-m.webp` (same size, so no database change). The lone phone card sitting at the left of a 3-column grid is handled by the item 7 gallery redesign |
| 2 | `/en`, stack table | Not a runtime error. It shows the seeded stack (Node.js, NestJS, Drizzle, Playwright, Vitest...) instead of the owner's list | **Planned**: item 1. Needs owner input (see owner-information.md) |
| 3, 4 | `/admin/projects/(id)`, Dashboard tour | Console error "Cannot specify a name prop for a button that specifies a function as a formAction", plus a hydration mismatch. React dropped `name="op" value="remove"`, so **Remove did not remove the screen**: it fell through to "save" and wiped the image's English alt text | **Fixed**: new `removeProjectImage` server action sets the op itself; the button no longer passes `name`/`value`. Verified: no console errors, and the screen is removed |
| 5 | `/admin` pages showing the owner's photo | `Invalid src prop (/profile/portrait.webp) ... images.localPatterns` | **Fixed**: `/profile/**` added to `images.localPatterns` in `next.config.ts`. Verified on /admin, /admin/profile, /admin/media |

---

## Built (2026-10-11)

| Item | Where |
| --- | --- |
| Schema + data migration | `prisma/migrations/20261011120000_round6` (old skills → hidden groups; CountryOffer → ReferralOffer/ReferralOfferCountry, ids kept so referrals stay linked; the "*" offer gets no countries) |
| Seed content | `prisma/data/round6.ts` (skill groups, AI services, PROPOSED architecture drafts), steps from the message files |
| Skills | Admin → Skills; `SkillsTable`, `SkillUsage` (About) |
| Architecture | Admin → Projects → How it's built; `ArchitectureFlow` on project pages |
| How I Work | Admin → How I work; `HowItWorks` (Home, About) |
| Referral | Admin → Referral offers; `ReferralExperience`; `/api/referrals` |
| Audience | `WhoIWorkWith` (Home, About, Services, Contact) + reworded texts in 13 languages; profile title default |
| AI services | Admin → AI services; `AiServices` (Home, Services); `/api/waitlist`; contact `?service=` |
| Device frames | `DeviceFrame` (project gallery, dashboard tour, preview) |
| Admin Dashboard Preview | `AdminPreview` / `AdminShowcase` / `MockScreens` (Home, Services); registry `src/lib/admin-showcase.ts` typed against `src/components/admin/nav-items.ts` |
| Project dashboard run | `DashboardRun` (laptop / tablet / phone frames). Each feature can have its own screenshot (Admin → Projects → Dashboard, per marker; migration `20261011180000_hotspot_screenshot`); the seed fills them from `public/projects/<slug>/features/` (`FEATURE_SHOTS` in `prisma/data/dashboard-tours.ts`). No numbered markers |
| Skill families | A skill can be in several families (add it to each in Admin → Skills); the periodic table shows it once and lights it for each. Migration `20261011200000_skill_families` adds the owner's lists: Web foundations + React, Tailwind CSS, TypeScript, Next.js; Backend + TypeScript, Next.js; Database + MySQL, Prisma ORM, Prisma Migrate; Data and reporting + Python, SQL, R |
| Price country picker | `MarketTabs`: every market's prices are on the page, so switching is instant; `?market=` follows in the address bar |
| Roadmap diagrams | `src/lib/roadmaps.ts` (layout + text per language), `FlowGraph` and `SequenceDiagram`, under "How it's built". ZODIC CAR: use cases + request sequence. KING 253: sitemap + cash-on-delivery order flow. Boulboul Art Wall: waiting for its diagram. Laptop: animated diagram; narrower screens: the same content as a list |

Scrolling: the sticky header and the floating menu button no longer blur what is behind them
(that repaint ran on every scroll frame), the hero's scroll spring is stiffer and its words no
longer animate a blur, and the scroll-synced runs are shorter. Production build: steady 60 fps
frames while wheel-scrolling the home page and the longest project pages (desktop and phone).

Found while testing and fixed: an optional field missing from a public form request (not sent at
all, rather than empty) was rejected as "required" (zod 4 treats a key as optional only through
`.optional()`); the existing forms always sent every field, so only the new waitlist form hit it.

## Implementation order (as built)

1. Schema migration for items 1–4 and 6, plus data migration (skills JSON → tables, steps from
   messages → `ProcessStep`, `CountryOffer` → `ReferralOffer`/`ReferralOfferCountry`).
2. Admin screens: Skills, How I work, Referral offers (country picker), AI services, project
   Architecture tab.
3. Public: skills groups + How I Use My Technologies, project How it's built + flow graph, dynamic
   How I work, referral country picker, AI services, DeviceFrame gallery, Admin Dashboard Preview.
4. Audience copy pass in 13 languages (machine-drafted translations marked unreviewed).
5. Playwright pass at 390 / 768 / 1024 / 1440 px, LTR + RTL, reduced motion; typecheck + lint.

## Acceptance checklist

Skills
- [x] Groups exactly as listed; no framework, database or tool appears under "Programming languages"
- [x] Admin can add, edit, reorder, hide and delete groups, skills and "How I use it" texts per language
- [x] No proficiency levels anywhere; project links only where the owner ticked them

Project architecture
- [x] Every published project shows frontend, backend, database, request flow, role and technologies, or hides the section
- [x] The flow graph matches that project's real nodes; unconfirmed graphs carry the "Concept / proposed architecture" badge
- [x] Graph is an ordered list for screen readers, static with reduced motion, vertical on phones

How I Work
- [x] No step text is hard-coded in page components; Home and About read `ProcessStep`
- [x] Admin can add, edit, reorder, hide and delete steps, with icon/image and translations

Referral
- [x] No wildcard: an unlisted country sees "no offer in your country yet"
- [x] Two EUR countries can have different offers; a non-EUR country shows its own currency
- [x] Availability, currency, reward, categories, conditions, translations and status are editable per country
- [x] Server rejects referrals for countries without a published, available offer

Audience
- [x] Home, About, Services and Contact address companies, small businesses, entrepreneurs/startups and individuals with a legitimate idea, in all 13 languages

AI services
- [x] AI agents and AI automations are marked available only once their descriptions are confirmed and published
- [x] The three Coming Soon items are visibly separate, with no price or "start" button
- [x] No text promises returns, profits or financial outcomes
- [x] Waitlist form appears only when the admin enables it; sign-ups arrive in Inquiries

Screenshots and frames
- [x] Framed screenshots stay legible at 390 px (frame chrome reduced on phones)
- [x] Every non-real image carries a Concept / Demo / Visual Exploration badge

Admin Dashboard Preview
- [x] Synthetic data only, checked by searching the demo data for real names, emails and phone numbers
- [x] Every admin nav entry is in the showcase registry or explicitly excluded (build check)
- [x] Desktop scroll sync works; phones and reduced motion get the static step list
- [x] `/admin/*` still redirects to the login page when signed out

Errors
- [x] Screenshots 1, 3, 4 and 5 no longer reproduce (see log above)

Verified with Playwright against a local PostgreSQL: every new admin flow through the real UI
(skills, steps, referral countries incl. the clash check, AI services incl. the promise-wording
check, waitlist, architecture branch), the public results, and every public page at 390 / 768 /
1024 / 1440 px in English and Arabic (RTL) plus reduced motion: no horizontal scroll, no console
errors. Typecheck and lint clean.

## What still needs the owner

- How you use each technology, and which projects show it (Admin → Skills). Until then the "How I
  use my technologies" section stays hidden.
- Confirm or correct the three architecture drafts, then set them to Confirmed (they show
  "Concept / proposed architecture" until then).
- Referral: pick the eligible countries for the second offer (it has none), confirm amounts and
  conditions, publish. Both offers are drafts.
- AI agents / AI automations: confirm or rewrite the drafted descriptions, then publish them. Decide
  whether the Coming Soon waitlists are on (off by default).
- Review the machine-drafted translations of the new texts.
- Boulboul Art Wall's roadmap diagram (to be redrawn like the ZODIC CAR and KING 253 ones).
- The feature screenshots come from local demo builds of each project with synthetic data. Replace
  any of them in Admin → Projects → Dashboard if the live product looks different.
