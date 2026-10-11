# Architecture

Status: **matches the code** as of 2026-10-10. Update these diagrams in the same change as the code.

---

## 1. Sitemap and navigation

Every public page lives under a locale prefix: `en fr ar it tr es es-MX es-CO pt-BR ru uk nb nl`.
`/` (or any path without a locale) redirects to the visitor's browser language when supported,
otherwise English. Admin routes have no locale and are never linked from public pages.

```mermaid
flowchart TD
  Root["/ → /{locale}"]
  Home["Home /{locale}"]
  About["About /{locale}/about"]
  Projects["Projects /{locale}/projects  (?type=website|app|software)"]
  ProjectDetail["Project /{locale}/projects/{slug}"]
  Services["Services & Pricing /{locale}/services-pricing  (?market=dz|other)"]
  Referral["Referral /{locale}/referral"]
  Contact["Contact /{locale}/contact"]
  Privacy["Privacy /{locale}/privacy"]

  Login["/admin/login"]
  Dash["/admin (dashboard + launch checklist)"]
  AProfile["/admin/profile"]
  AHero["/admin/hero"]
  AProjects["/admin/projects → /admin/projects/{id}"]
  AServices["/admin/services"]
  AOffers["/admin/referral"]
  ARefs["/admin/referrals → /admin/referrals/{id}"]
  AInq["/admin/inquiries → /admin/inquiries/{id}"]
  ATest["/admin/testimonials"]
  AContent["/admin/content"]
  ALang["/admin/languages"]
  AMedia["/admin/media"]
  ASettings["/admin/settings"]

  Root --> Home
  Home --> About & Projects & Services & Contact
  Home -. "only when an offer is published" .-> Referral
  About --> Projects & Contact
  Projects --> ProjectDetail
  ProjectDetail --> Projects
  ProjectDetail -- "next project" --> ProjectDetail
  ProjectDetail --> Contact
  Services --> Contact
  Referral --> Contact
  Contact --> Privacy

  Login --> Dash
  Dash --> AProfile & AHero & AProjects & AServices & AOffers & ARefs & AInq & ATest & AContent & ALang & AMedia & ASettings
```

The header (Home, About, Projects, Services & Pricing, Referral, Contact, language switcher) and the
footer (contact links, socials, language switcher, Privacy) are on every public page; those edges
are left out to keep the graph readable.

---

## 2. Application architecture and data flow

One Next.js app. Everything under `src/server/**` is server-only (`import "server-only"`), so it
can't be bundled into the browser.

```mermaid
flowchart LR
  Visitor["Public visitor"]
  Owner["Admin (owner)"]

  subgraph Browser["Browser"]
    Pages["Server-rendered HTML"]
    Islands["Client islands: nav menu, language switcher,\nhero renderers (three.js / canvas), forms, admin buttons"]
  end

  subgraph Next["Next.js 16 (Node runtime)"]
    Proxy["src/proxy.ts\nlocale redirect · /admin cookie gate"]
    RSC["Server Components\napp/[locale]/** · app/admin/(panel)/**"]
    Actions["Server Actions\nsrc/server/actions/* (admin mutations, login)"]
    API["Route handlers\n/api/contact · /api/referrals · /media/[...key] · sitemap · robots"]
  end

  subgraph Server["src/server/** (server-only)"]
    Auth["auth: argon2id, DB sessions,\nrequireAdmin / requireAdminPage"]
    Sec["security: Postgres rate limits,\nhoneypot + timer, same-origin check"]
    Val["validation: Zod schemas"]
    Content["services/content: public queries,\ntranslation fallback, drafts preview"]
    MediaSvc["services/media: decode, re-encode WebP,\nGLB check, delete"]
    Store["storage: Local (./uploads) | Cloudinary REST"]
    Audit["audit log"]
  end

  Msg["src/messages/*.json\n(UI text defaults)"]
  Prisma["Prisma Client + pg adapter"]
  DB[("PostgreSQL")]
  Files[("Uploads: disk or Cloudinary")]

  Visitor --> Pages
  Owner --> Pages
  Pages --> Proxy --> RSC
  Islands -- "fetch JSON" --> API
  Islands -- "form actions" --> Actions
  RSC --> Content
  RSC --> Auth
  RSC -- "next-intl request config" --> Msg
  Actions --> Auth --> Prisma
  Actions --> Val
  Actions --> MediaSvc --> Store --> Files
  Actions --> Audit --> Prisma
  API --> Sec --> Prisma
  API --> Val
  API --> Prisma
  Content --> Prisma --> DB
```

- **Rendering:** public pages are dynamic (`force-dynamic`) and read PostgreSQL per request, so
  admin edits show up immediately. Queries are memoised per request with React `cache()`.
- **Text:** UI strings come from `src/messages/{locale}.json` merged along the fallback chain
  (`es-MX → es → en`), then overridden by rows in `PageContent` edited in Admin → Page text.
  Database content (projects, services...) has one translation row per locale, with the same
  fallback chain.
- **Drafts:** public queries return `PUBLISHED` rows only, unless a signed-in admin turned on
  drafts preview (cookie checked together with the session).
- **Public forms** post JSON to route handlers: same-origin check → honeypot/timer → rate limit →
  Zod → insert. Responses are `{ ok }` or `{ ok:false, error, fields }` with error *codes* that the
  browser translates.
- **Admin mutations** are server actions wrapped in `adminAction()`: `requireAdmin()` → work →
  audit log → redirect with a flash message. Next.js checks the Origin header on server actions
  (CSRF).

---

## 3. Database relationships

Matches `prisma/schema.prisma` (migrations in `prisma/migrations/`). Translatable text lives in
`*Translation` tables keyed by `(parentId, locale)`; money is integer minor units (`BigInt`) plus an
ISO-4217 currency.

```mermaid
erDiagram
  AdminUser ||--o{ AdminSession : "signs in with"
  AdminUser ||--o{ AdminAuditLog : writes

  SiteSettings ||--o{ HeroFrame : "option B frames"
  HeroFrame }o--|| MediaAsset : shows
  SiteSettings }o--o| MediaAsset : "heroImage / heroDepth / heroModel / ogImage"

  Profile ||--o{ ProfileTranslation : "per locale"
  Profile }o--o| MediaAsset : portrait
  ExperienceItem ||--o{ ExperienceTranslation : "per locale"

  Project ||--o{ ProjectTranslation : "per locale"
  Project ||--o{ ProjectImage : gallery
  ProjectImage }o--|| MediaAsset : uses
  Project ||--o{ ProjectLink : links
  Project |o--o{ Testimonial : "feedback on"
  Testimonial ||--o{ TestimonialTranslation : "per locale"

  Service ||--o{ ServiceTranslation : "per locale"
  Service ||--o{ ServiceExample : examples
  ServiceExample ||--o{ ServiceExampleTranslation : "per locale"
  PricingPackage ||--o{ PricingPackageTranslation : "per locale"
  PricingPackage ||--o{ PackagePrice : "price per market"

  CountryOffer ||--o{ CountryOfferTranslation : "terms per locale"
  CountryOffer |o--o{ Referral : "applied to"

  AdminUser {
    uuid id PK
    string email UK
    string passwordHash "argon2id"
  }
  AdminSession {
    string tokenHash PK "sha256 of cookie token"
    datetime expiresAt
  }
  SiteSettings {
    int id PK "single row"
    enum heroMode "DEPTH | SEQUENCE | MODEL"
    string contactEmail
    string phone
    bool showPhone
    string whatsapp
    bool showWhatsapp
  }
  MediaAsset {
    uuid id PK
    enum driver "LOCAL | CLOUDINARY"
    string storageKey UK "public:/... = shipped file"
    enum kind "IMAGE | MODEL"
    json alt "per locale"
  }
  Profile {
    int id PK "single row"
    string publicName
    string fullName "hidden unless showFullName"
    string[] languages
    json skills
  }
  Project {
    uuid id PK
    string slug UK
    enum category "WEBSITE | APP | SOFTWARE"
    enum origin "CLIENT | PERSONAL | CONCEPT | null"
    enum stage "CONCEPT | IN_PROGRESS | LAUNCHED"
    enum status "DRAFT | PUBLISHED"
    bool featured
    int sortOrder
  }
  ProjectImage {
    enum kind "REAL | CONCEPT | DEMO"
    int sortOrder
  }
  PackagePrice {
    string market "DZ, FR... or *"
    string currency "ISO 4217"
    bigint minMinor
    bigint maxMinor "null = from"
  }
  CountryOffer {
    string market "DZ... or *"
    string currency
    bigint rewardMinor
    enum category "null = any"
    bigint minProjectValueMinor
    enum status
  }
  Referral {
    enum status "NEW | CONTACTED | QUALIFIED | WON | NOT_ELIGIBLE | REWARD_DUE | PAID"
    bigint rewardMinorSnapshot "reward promised at submission"
    string rewardCurrencySnapshot
    datetime paidAt
    datetime archivedAt
  }
  ContactInquiry {
    enum status "NEW | IN_PROGRESS | REPLIED | CLOSED"
    datetime archivedAt
    bool consent
  }
  Testimonial {
    bool clientApproved "required to publish"
    enum status
  }
```

Tables not drawn (no relations): `LocaleSetting` (enabled / reviewed per language), `PageContent`
(UI text overrides, key + locale), `SocialLink`, `RateLimitBucket` (hashed keys).

---

## 4. Hero 3D

See [hero-3d.md](hero-3d.md).

```mermaid
flowchart LR
  Src["assets/source/*\n(cutout, 360° video, raw GLB)"] --> Build["scripts/build-hero-assets.py\nscripts/build-hero-turntable.py\nscripts/clean-glb-texture.py"]
  Build --> Pub["public/hero/*\nface, depth, turn/ frames, model.glb"]
  Pub --> Seed["prisma/seed.ts registers them as MediaAsset rows"]
  Admin["Admin → Hero 3D uploads"] --> Media["MediaAsset rows"]
  Seed --> Home
  Media --> Home["Home page picks mode (settings or ?hero=)"]
  Home --> Still["Static next/image (SSR, LCP, fallback)"]
  Home --> Lazy["Lazy client renderer:\nA DepthHead · B SequenceHead · C ModelHead"]
  Scroll["Motion useScroll → spring"] --> Lazy
```
