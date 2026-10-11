// Demo admin screens for the public "Admin Dashboard Preview". Pure markup with MADE-UP data only:
// no real inquiries, customers, credentials or sessions, and nothing is imported from the real
// admin. Labels are in English, like the real dashboard. Layout adapts to its frame width
// (container queries), so it stays readable on phones.
import {
  ArrowDown,
  ArrowUp,
  Bot,
  Check,
  Eye,
  FolderKanban,
  Globe,
  HandCoins,
  Hourglass,
  Image as ImageIcon,
  Inbox,
  Languages,
  ListOrdered,
  Plus,
  Tag,
  Upload,
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ShowcaseFeature } from "@/lib/admin-showcase";

const NAV: { key: ShowcaseFeature; label: string; icon: LucideIcon }[] = [
  { key: "inquiries", label: "Inquiries", icon: Inbox },
  { key: "profile", label: "Profile", icon: User },
  { key: "skills", label: "Skills", icon: Wrench },
  { key: "process", label: "How I work", icon: ListOrdered },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "pricing", label: "Pricing", icon: Tag },
  { key: "ai", label: "AI services", icon: Bot },
  { key: "referral", label: "Referral offers", icon: HandCoins },
  { key: "uploads", label: "Media", icon: ImageIcon },
  { key: "translations", label: "Languages", icon: Languages },
];

const TITLES: Record<ShowcaseFeature, string> = {
  projects: "Projects",
  uploads: "Media",
  pricing: "Services & pricing",
  referral: "Referral offers",
  inquiries: "Inquiries",
  translations: "Languages",
  profile: "Profile",
  process: "How I work",
  skills: "Skills",
  ai: "AI services",
};

function Chip({ tone = "neutral", children }: { tone?: "ok" | "warn" | "info" | "neutral"; children: React.ReactNode }) {
  const tones = { ok: "border-ok/40 text-ok", warn: "border-amber-300/40 text-amber-200", info: "border-ice/40 text-ice", neutral: "border-line text-mist/70" };
  return <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}>{children}</span>;
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-3 rounded-lg border border-line bg-ink-2 px-3 py-2.5 text-[13px] text-mist/85">{children}</div>;
}

function Field({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`flex flex-col gap-1 ${wide ? "@lg:col-span-2" : ""}`}>
      <span className="text-[11px] text-mist/60">{label}</span>
      <span className="truncate rounded-md border border-line bg-ink px-2.5 py-1.5 text-[13px] text-mist/85">{value}</span>
    </div>
  );
}

function Screen({ feature }: { feature: ShowcaseFeature }) {
  switch (feature) {
    case "projects":
      return (
        <div className="flex flex-col gap-2">
          {[
            { name: "Sample Café website", type: "Website", status: "Published", tone: "ok" as const, color: "from-[#c9b79c] to-[#7d6a52]" },
            { name: "Demo Shop", type: "Website", status: "Draft", tone: "warn" as const, color: "from-[#9fb3c8] to-[#3d4f63]" },
            { name: "Example Clinic booking", type: "App", status: "In progress", tone: "info" as const, color: "from-[#a8c9b8] to-[#3f6352]" },
          ].map((p) => (
            <Row key={p.name}>
              <span className={`h-8 w-12 shrink-0 rounded bg-gradient-to-br ${p.color}`} />
              <span className="min-w-0 flex-1 truncate font-medium text-mist">{p.name}</span>
              <span className="hidden text-mist/55 @md:inline">{p.type}</span>
              <Chip tone={p.tone}>{p.status}</Chip>
            </Row>
          ))}
          <div className="mt-1 grid gap-2 @lg:grid-cols-2">
            <Field label="Title (English)" value="Sample Café website" />
            <Field label="Status" value="Published" />
            <Field label="Summary" value="A menu and online ordering site for a neighbourhood café." wide />
          </div>
        </div>
      );
    case "uploads":
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-ice/40 bg-ice/5 py-5 text-[13px] text-mist/75">
            <Upload className="size-4 text-ice" /> Drop images here · JPEG, PNG, WebP
          </div>
          <div className="grid grid-cols-3 gap-2 @lg:grid-cols-4">
            {[
              ["storefront.webp", "Real", "from-[#d2c2a8] to-[#8a7458]"],
              ["menu-page.webp", "Real", "from-[#b7c6d4] to-[#56687a]"],
              ["checkout.webp", "Demo", "from-[#c4d3c0] to-[#5d7259]"],
              ["concept-hero.webp", "Concept", "from-[#cdbfd6] to-[#6b5a78]"],
              ["logo.png", "Real", "from-[#e2dccf] to-[#a19883]"],
              ["team.webp", "Real", "from-[#aab7c2] to-[#4b5560]"],
              ["admin.webp", "Demo", "from-[#c8c3b4] to-[#6e6a5d]"],
              ["mobile.webp", "Real", "from-[#b3c4bf] to-[#52645f]"],
            ].map(([name, kind, color], i) => (
              <div key={name} className={`flex flex-col gap-1 ${i > 5 ? "hidden @lg:flex" : ""}`}>
                <span className={`aspect-[4/3] rounded-md bg-gradient-to-br ${color}`} />
                <span className="flex items-center justify-between gap-1 text-[10px] text-mist/60">
                  <span className="truncate">{name}</span>
                  {kind !== "Real" && <span className="text-ice">{kind}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    case "pricing":
      return (
        <div className="grid gap-2 @lg:grid-cols-2">
          {[
            { name: "Starter website", min: "40,000 DZD", max: "60,000 DZD", fill: "w-1/3", weeks: "2–3 weeks", tone: "ok" as const, status: "Published" },
            { name: "Online shop", min: "900 EUR", max: "1,500 EUR", fill: "w-2/3", weeks: "6–8 weeks", tone: "warn" as const, status: "Draft" },
          ].map((p) => (
            <div key={p.name} className="flex flex-col gap-2.5 rounded-lg border border-line bg-ink-2 p-3 text-[13px]">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-mist">{p.name}</span>
                <Chip tone={p.tone}>{p.status}</Chip>
              </div>
              <div className="h-1.5 rounded-full bg-ink-3">
                <div className={`h-full rounded-full bg-ice ${p.fill}`} />
              </div>
              <div className="flex justify-between text-[11px] text-mist/60">
                <span>{p.min}</span>
                <span>{p.max}</span>
              </div>
              <Field label="Delivery" value={p.weeks} />
            </div>
          ))}
        </div>
      );
    case "referral":
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-medium text-mist">Demo offer</span>
            <Chip tone="ok">Published</Chip>
          </div>
          {[
            ["FR", "France", "50 EUR", "Published", "ok"],
            ["BE", "Belgium", "50 EUR", "Published", "ok"],
            ["CA", "Canada", "75 CAD", "Draft", "warn"],
            ["DZ", "Algeria", "5,000 DZD", "Paused", "neutral"],
          ].map(([code, name, reward, status, tone]) => (
            <Row key={code}>
              <span className="w-6 font-bold text-mist">{code}</span>
              <span className="min-w-0 flex-1 truncate text-mist/70">{name}</span>
              <span className="text-mist">{reward}</span>
              <Chip tone={tone as "ok" | "warn" | "neutral"}>{status}</Chip>
            </Row>
          ))}
          <p className="flex items-center gap-1.5 text-[11px] text-mist/55">
            <Globe className="size-3.5" /> Only the countries listed here can see this offer.
          </p>
        </div>
      );
    case "inquiries":
      return (
        <div className="flex flex-col gap-2">
          {[
            ["Sample Café", "alex@example.com", "Website", "New", "info"],
            ["Demo Bakery", "sam@example.com", "Waitlist", "New", "info"],
            ["Example Studio", "jo@example.com", "App", "Replied", "ok"],
            ["Placeholder Ltd", "team@example.com", "Software", "Closed", "neutral"],
          ].map(([name, email, type, status, tone]) => (
            <Row key={name}>
              <span className="min-w-0 flex-1 truncate font-medium text-mist">{name}</span>
              <span className="hidden truncate text-mist/55 @lg:inline">{email}</span>
              <span className="hidden text-mist/55 @md:inline">{type}</span>
              <Chip tone={tone as "info" | "ok" | "neutral"}>{status}</Chip>
            </Row>
          ))}
        </div>
      );
    case "translations":
      return (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            {[
              ["en", "bg-ok"],
              ["fr", "bg-ok"],
              ["ar", "bg-amber-300"],
              ["it", "bg-amber-300"],
              ["es", "bg-ok"],
              ["tr", "bg-amber-300"],
              ["nl", "bg-danger"],
            ].map(([code, dot], i) => (
              <span key={code} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${i === 1 ? "border-mist bg-mist text-ink" : "border-line text-mist/75"}`}>
                {code}
                <span className={`size-1.5 rounded-full ${dot}`} />
              </span>
            ))}
          </div>
          <div className="grid gap-2 @lg:grid-cols-2">
            <Field label="Title (Français)" value="Bienvenue chez Sample Café" />
            <Field label="Button (Français)" value="Voir le menu" />
            <Field label="Introduction (Français)" value="Commandez en ligne, retirez sur place." wide />
          </div>
          <span className="flex items-center gap-2 text-[12px] text-mist/75">
            <span className="flex size-4 items-center justify-center rounded bg-ice text-ink">
              <Check className="size-3" />
            </span>
            Translation reviewed
          </span>
        </div>
      );
    case "profile":
      return (
        <div className="flex flex-col gap-3 @lg:flex-row">
          <span className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#aab7c2] to-[#4b5560] text-xl font-bold text-ink">YN</span>
          <div className="grid flex-1 gap-2 @lg:grid-cols-2">
            <Field label="Public name" value="Your Name" />
            <Field label="Languages" value="English, French" />
            <Field label="Title" value="Designer and developer" wide />
            <Field label="Short introduction" value="I help small businesses get online." wide />
          </div>
        </div>
      );
    case "process":
      return (
        <div className="flex flex-col gap-2">
          {["Understand", "Plan", "Build", "Review"].map((step, i) => (
            <Row key={step}>
              <span className="font-bold tabular-nums text-ice">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1 truncate font-medium text-mist">{step}</span>
              {i === 3 && <Chip tone="warn">Hidden</Chip>}
              <Eye className="size-4 text-mist/50" />
              <span className="flex gap-1">
                <ArrowUp className="size-4 text-mist/50" />
                <ArrowDown className="size-4 text-mist/50" />
              </span>
            </Row>
          ))}
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-line px-3 py-2.5 text-[13px] text-mist/60">
            <Plus className="size-4" /> New step
          </div>
        </div>
      );
    case "skills":
      return (
        <div className="flex flex-col gap-3">
          {[
            ["Programming languages", ["Python", "JavaScript", "SQL"]],
            ["Mobile development", ["Flutter"]],
            ["Database tools", ["Prisma ORM", "Prisma Migrate"]],
          ].map(([group, skills]) => (
            <div key={group as string} className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-wider text-mist/55">{group}</span>
              <div className="flex flex-wrap gap-1.5">
                {(skills as string[]).map((s) => (
                  <span key={s} className="rounded-md bg-ice px-2 py-1 text-[12px] font-medium text-ink">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <Field label="How I use it (Python)" value="Scripts that clean and import a client's data." />
        </div>
      );
    case "ai":
      return (
        <div className="flex flex-col gap-2">
          {[
            ["AI agents", "Available now", "ok", "Published"],
            ["AI automations", "Available now", "ok", "Draft"],
            ["AI-powered apps", "Coming soon", "info", "Waitlist on"],
            ["Finance AI", "Coming soon", "info", "Waitlist off"],
          ].map(([name, availability, tone, extra]) => (
            <Row key={name}>
              {availability === "Coming soon" ? <Hourglass className="size-4 text-mist/50" /> : <Bot className="size-4 text-ice" />}
              <span className="min-w-0 flex-1 truncate font-medium text-mist">{name}</span>
              <Chip tone={tone as "ok" | "info"}>{availability}</Chip>
              <span className="hidden text-[11px] text-mist/55 @md:inline">{extra}</span>
            </Row>
          ))}
        </div>
      );
  }
}

/** One demo admin page: sidebar (from wide frames up), title bar and the feature's screen. */
export function MockScreen({ feature }: { feature: ShowcaseFeature }) {
  return (
    <div className="@container" aria-hidden>
      <div dir="ltr" className="flex min-h-[300px] bg-ink text-left @xl:h-[420px]">
        <nav className="hidden w-44 shrink-0 flex-col gap-0.5 border-r border-line bg-ink-2 p-3 @xl:flex">
          <span className="mb-3 px-2 text-lg font-black uppercase tracking-tight display-gradient">Admin</span>
          {NAV.map((n) => (
            <span
              key={n.key}
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] ${n.key === feature ? "bg-mist text-ink" : "text-mist/65"}`}
            >
              <n.icon className="size-3.5" />
              {n.label}
            </span>
          ))}
        </nav>
        <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-hidden p-4 @xl:p-5">
          <span className="truncate text-lg font-black uppercase tracking-tight text-mist">{TITLES[feature]}</span>
          <Screen feature={feature} />
        </div>
      </div>
    </div>
  );
}
