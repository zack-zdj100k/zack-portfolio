# Design system

Design read: a developer portfolio for business owners, in a dark cinematic language taken from the
owner's brief (#0C0C0C, Kanit, steel-to-ice gradient display type), leaning on Tailwind 4 + Motion +
a WebGL hero. Dials: variance 7, motion 7, density 3.

References inspected (2026-10-10): Awwwards portfolio gallery, img2threejs showcase, the owner's
own projects (king25, boulboule). Patterns taken: oversized single-word wordmark behind a 3D
subject, scroll-pinned hero with a narrative reveal, sticky stacked project cards, one contrasting
light panel. Nothing copied.

## Colour
| Token | Value | Use |
| --- | --- | --- |
| `ink` | #0C0C0C | Page background (single dark theme, per brief) |
| `ink-2` / `ink-3` | #131416 / #1B1D20 | Raised surfaces, inputs, image wells |
| `line` | #2A2D32 | Borders, dividers |
| `steel` | #646973 | Gradient top, muted numerals |
| `ice` | #BBCCD7 | Gradient bottom, focus ring, single accent |
| `mist` | #D7E2EA | Body text, primary button fill |
| `paper` | #F2F4F6 | The one light panel (Services); text `ink` |
| `danger` / `ok` | #FF8A7A / #9FE0B8 | Form errors / success only |

One accent family (steel → ice → mist). No purple, no glows except the soft ice shadow on the
primary hero button. Text contrast: mist on ink ≈ 15:1; mist/70 on ink ≈ 7:1; the faintest text used (mist/50, small labels) ≈ 4.6:1.

## Type
- **Kanit** 300–900 for everything Latin. Display: font-black, uppercase, tight tracking
  (-0.04em on the wordmark), `leading-[0.9]`, fluid `clamp()` sizes.
- **Montserrat** fills Cyrillic (ru, uk), **Alexandria** fills Arabic (and leads on `lang="ar"`).
- `.display-gradient` (180° #646973 → #BBCCD7) only on big display headings, as the brief asks.
- Body 16–20 px, `leading-relaxed`, max ~65ch.

## Shape and spacing
- Radius system: pills for every button and tag; 24–60 px radii for cards, image frames and
  section tops (rounded section tops stack like sheets); 14 px for inputs.
- Container: max 1400 px, 16 / 32 / 40 px gutters (phone / tablet / desktop).
- Section rhythm: 80–144 px vertical padding.

## Motion (all of it has a job)
| Where | What | Why |
| --- | --- | --- |
| Hero | Pinned stage: the owner's head (frames from his 360° video) makes one full turn with the scroll while three words reveal and slowly fade; letters spread | Storytelling: introduces what he builds |
| Project strip | Two rows drift opposite ways with scroll | Shows breadth of real work at a glance |
| About preview | Words brighten as they scroll in (word-level, so Arabic stays joined) | Pacing for the one paragraph that matters |
| Project cards | Sticky stack, previous card shrinks | Hierarchy: one project at a time |
| Sections | One fade-up on entry | Orientation |
| Hero button | Magnetic pull (mouse only) | Feedback |
| WhatsApp button (phones) | Rises in after the first screen | Keeps the main contact one tap away |
| Page wheel (phones, tablets) | Half-circle menu on the right edge (left in Arabic); turning it brings the next page to the pointer and opens it, with rim ticks turning along | Owner's navigation idea; the pages stay plain links for keyboard and screen readers |

Reduced motion: no pinning, no scroll-linked transforms, static hero image, fades only. Mouse
effects never run on touch. Renderers pause off screen.

## Owner-chosen components (round 3)
Pull-cord lamp (home About), hanging ID badge, periodic table of skills, glowing-edge buttons
(filters, pricing actions), 3D tilt service cards, pinned "How I work" notes (Caveat numerals),
"Good to know" bento, striped "What I build" cards, budget slider. All recoloured to this palette.

## Components
Header (single line ≥1024 px; below that, the page wheel `NavDial`), language switcher (13 languages, keeps the
current page), footer, `PrimaryLink` / `GhostLink` / `ExternalLink`, `PageHeader`, `Reveal`,
`ProjectCard` / `ProjectStack`, `PricingBlock` + `PackageCard` (market, then websites / apps / desktop groups, a price bar per package; home and pricing),
`DashboardTour` (annotated admin screenshots with a synced legend; project pages),
`ContactCard` (owner photo, WhatsApp/phone/email rows, profile links with brand marks, the form beside
it; home and contact), form fields with label above, hint,
error below, live status region.

## Imagery
Real screenshots of the owner's builds only, plus the owner's 3D artwork. Concept or demo images
must carry a visible text label below the image (never an overlay pill).
