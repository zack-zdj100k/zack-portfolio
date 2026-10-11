# Round 6 requirements: plan, content model, admin schema, acceptance checklist

Status: **planned, not built.** Implementation starts only after the owner sends the information in
[owner-information.md](owner-information.md) (section "Round 6") and explicitly approves it. All
earlier requirements in [roadmap.md](roadmap.md), [PRODUCT.md](../PRODUCT.md) and
[architecture.md](architecture.md) still apply. Where this file changes an earlier decision, it says
so.

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
own explanation and links to the projects that demonstrate it. No proficiency bars or levels. A
skill with no usage text shows only its name, and a skill with no linked project shows no project
line.

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

**Changes an earlier decision.** The steps are hard-coded today (`STEPS` + `about.howIWork.*` in
`src/messages/*.json`, used on Home and About). They move to the database, seeded once from the
current texts in all 13 languages so nothing visible changes on day one.

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
A "copy settings to selected countries" helper covers several EUR countries at once.

Public, **/referral**: the visitor picks their country first. Only that country's published,
available offer is shown, in its own currency. With no offer, the page says "no referral offer in
your country yet" and still shows the contact link. The submit endpoint re-checks eligibility on the
server.

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

## Implementation order (after approval)

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
- [ ] Groups exactly as listed; no framework, database or tool appears under "Programming languages"
- [ ] Admin can add, edit, reorder, hide and delete groups, skills and "How I use it" texts per language
- [ ] No proficiency levels anywhere; project links only where the owner ticked them

Project architecture
- [ ] Every published project shows frontend, backend, database, request flow, role and technologies, or hides the section
- [ ] The flow graph matches that project's real nodes; unconfirmed graphs carry the "Concept / proposed architecture" badge
- [ ] Graph is an ordered list for screen readers, static with reduced motion, vertical on phones

How I Work
- [ ] No step text is hard-coded in page components; Home and About read `ProcessStep`
- [ ] Admin can add, edit, reorder, hide and delete steps, with icon/image and translations

Referral
- [ ] No wildcard: an unlisted country sees "no offer in your country yet"
- [ ] Two EUR countries can have different offers; a non-EUR country shows its own currency
- [ ] Availability, currency, reward, categories, conditions, translations and status are editable per country
- [ ] Server rejects referrals for countries without a published, available offer

Audience
- [ ] Home, About, Services and Contact address companies, small businesses, entrepreneurs/startups and individuals with a legitimate idea, in all 13 languages

AI services
- [ ] AI agents and AI automations are marked available only once their descriptions are confirmed and published
- [ ] The three Coming Soon items are visibly separate, with no price or "start" button
- [ ] No text promises returns, profits or financial outcomes
- [ ] Waitlist form appears only when the admin enables it; sign-ups arrive in Inquiries

Screenshots and frames
- [ ] Framed screenshots stay legible at 390 px (frame chrome reduced on phones)
- [ ] Every non-real image carries a Concept / Demo / Visual Exploration badge

Admin Dashboard Preview
- [ ] Synthetic data only, checked by searching the demo data for real names, emails and phone numbers
- [ ] Every admin nav entry is in the showcase registry or explicitly excluded (build check)
- [ ] Desktop scroll sync works; phones and reduced motion get the static step list
- [ ] `/admin/*` still redirects to the login page when signed out

Errors
- [ ] Screenshots 1, 3, 4 and 5 no longer reproduce (done in this round, see log above)
