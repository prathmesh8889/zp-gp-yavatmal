# QA Report — Role Access, Debug Pass & Mobile Responsiveness

Date: 19 August 2026 · Baseline: RBAC & UI Visibility release

## 1. Automated checks — all green

| Check | Command | Result |
|---|---|---|
| Type safety | `npx tsc --noEmit` | **0 errors** |
| Lint | `npx next lint` | **0 warnings, 0 errors** |
| Access-control suite | `npm run test:access` | **231 / 231 passed** |
| Production build | `npm run build` | **34 / 34 routes prerendered** |
| Runtime smoke test | `npm start` + request every route | **all 200 OK**, no server errors |

Access-suite groups: route (24), menu visibility (58), capability (30), scope (16),
export scope (4), auth (6), admin state (15), handover (16), UC (9), offline (6),
role switch (7), department (5), edge cases (20), workflow (15).

## 2. Bugs found and fixed

| # | Issue | Impact | Fix |
|---|---|---|---|
| 1 | `next/font/google` fetched Inter at build time | **Build failed** on any machine/CI without access to `fonts.googleapis.com`; a Netlify build could fail on a Google Fonts outage | Font self-hosted via `@fontsource-variable/inter`, imported in `app/layout.tsx`; `--font-inter` set in `globals.css`. Build now needs **no network** |
| 2 | `useAuth().menuOptions` returned a new object every render | New identity in `useMemo`/`useEffect` dependency arrays → needless recomputation and a re-render risk in `GlobalSearch` | Memoised with `useMemo` on `presentationMode` |
| 3 | Data tables used `w-full` inside `overflow-x-auto` | Columns squeezed to unreadable width on phones instead of scrolling | `min-w-[640px]` added to all 8 tables so they scroll horizontally inside their card |
| 4 | Notification dropdown fixed at `w-80` | Overflowed the viewport on ≤360px screens | `w-[min(20rem,calc(100vw-1.5rem))]` |
| 5 | Process Improvement modal used `grid-cols-3` for three inputs | Fields ~90px wide on a phone | `grid-cols-1 sm:grid-cols-3` |
| 6 | Bottom nav / modals ignored notch safe areas | Controls sat under the iOS home indicator | `pb-safe` / `mb-safe` helpers + `viewportFit: "cover"` |
| 7 | Inputs at 14px | iOS Safari auto-zoomed on focus and did not zoom back | `font-size: 16px` for `input/select/textarea` under 640px |
| 8 | Mobile drawer fixed at `w-64` | Left almost no backdrop on 320px screens | `w-[min(16rem,85vw)]` |
| 9 | Scope label hidden below `sm` | Users could not tell which GP/Block they were viewing on a phone | Now shown, truncated to `38vw` |
| 10 | Service worker cache key stale | Old shell could persist after a redeploy | Bumped to `yvt-panchayat-demo-v5` |

## 3. Mobile responsiveness — what was verified

- **Layout**: single sidebar drawer ≤`lg`, role-filtered bottom bar (Home + up to 3
  modules + Notifications, never more than 5), `pb-28` main padding so no content
  hides behind the bar.
- **Overflow**: `overflow-x: hidden` on `body` prevents sideways page pan; wide
  tables scroll inside their own card with momentum scrolling.
- **Grids**: every `grid-cols-{3,4,6}` carries a `sm:`/`lg:` breakpoint; stat groups
  stack on narrow screens.
- **Modals**: full-width bottom sheets ≤`sm`, centred dialogs above; `max-h-[90vh]`
  with a `dvh` upgrade where supported, `overscroll-contain` so scrolling a modal
  does not scroll the page behind it.
- **Touch targets**: bottom-nav items ≥44px tall; `touch-action: manipulation` on
  coarse pointers removes the 300ms tap delay.
- **Typography**: no fixed pixel widths anywhere in `src`; only two `min-w-[…]`
  values, both intentional badges.
- **PWA**: `viewport-fit=cover`, theme colour, manifest, maskable icon and offline
  fallback all present and served correctly in the production build.

## 4. Second mobile pass — component-level fixes

| Area | Before | After |
|---|---|---|
| List rows (PATHPURAVA, NIGAA repairs, complaints, dashboard obligations) | title + 2–3 badges on one line crushed the text on a 360px screen | rows stack: title on top, badges wrap underneath, single row again from `sm:` |
| Seasonal task rows | "Mark Done" button squeezed the task title | button + status badge move to their own line on phones |
| `CardHeader` | a long bilingual title could push the action link off-screen | header wraps, title gets `min-w-0` + `break-words`, action never shrinks |
| `StatCard` | long labels collided with the tone icon | label wraps, icon is `flex-shrink-0`, tighter padding under `sm` |
| `PageHeader` | 20px title with the Marathi name inline overflowed | 18px on mobile, Marathi name drops to its own line |
| `Modal` | long titles pushed the ✕ out of the sheet | title wraps, ✕ is a fixed 36px target, body padding tightened |
| Modal footers | Cancel/Save side by side at ~40% width each | full-width stacked buttons on phones (primary on top), row from `sm:` |
| `Tabs` | tab strip clipped at the card edge | edge-to-edge snap-scrolling strip, scrollbar hidden, 44px tall tabs |
| `Button` | 36px tall md buttons | `min-h` 32/40/44px by size — all meet the 44px guidance where it matters |
| Landing hero | `text-4xl` headline on a 320px screen | `text-3xl sm:text-4xl lg:text-5xl`, shorter vertical padding |
| Public portal | village dropdowns overflowed the row | full-width selects stacked on phones |
| `RagRow` | GP name + reasons could overflow | `min-w-0` + `break-words`, metric strip never shrinks below 3.5rem |

## 5. Third pass — horizontal page scroll eliminated

Root causes of the sideways scroll, all fixed:

| # | Cause | Why it scrolled | Fix |
|---|---|---|---|
| 1 | `-mx-px` on every table scroller | the wrapper was 2px wider than its card, and 2px is enough to make the page pan | wrapper is now `w-full max-w-full overflow-x-auto` |
| 2 | `-mx-4` full-bleed tab strip | negative margins reached past the page padding | plain `w-full max-w-full` scroll strip |
| 3 | Grid/flex children default to `min-width: auto` | a 640px table or a chart stretched its track and dragged the page with it | `@layer base { .grid > *, .flex > * { min-width: 0 } }` — tracks respect the viewport, the table scrolls inside its own card |
| 4 | `body { overflow-x: hidden }` | it hid the symptom **and broke the sticky top bar**, because the body became a scroll container | `overflow-x: clip` on `html` + `body` — no panning, sticky header keeps working |
| 5 | Top bar controls on a 320px screen | menu + scope + search + EN/मराठी + bell added up to more than the viewport | scope text truncates, language toggle shows `EN / मर` on phones, every control is `flex-shrink-0` |
| 6 | Long IDs, emails, URLs | unbreakable strings widened cards | `overflow-wrap: break-word` on `body` |
| 7 | Charts and images | recharts could exceed its box | `max-width: 100%` on `img/svg/canvas/iframe` and the recharts containers |
| 8 | Public / landing / demo-story headers | logo text blocks had no `min-w-0` | titles truncate, action buttons never shrink |

Also added: **body scroll-lock** while a modal or the mobile drawer is open, and
`overflow-x-clip` on the app's `<main>` so no future page can leak sideways.

### New regression guard

`npm run test:responsive` (`scripts/responsive-audit.mjs`) statically flags
negative horizontal margins, fixed widths wider than a phone outside a scroll
container, un-breakpointed 4+ column grids, `flex-nowrap` without a scroller and
tables missing an `overflow-x-auto` wrapper. It currently reports **PASS**, and
`npm test` runs typecheck + lint + access suite + this audit together.

## 6. Deployment (Netlify)

`DEPLOY_NETLIFY.md` + `netlify.toml` — one-click import, no environment variables, no file changes.
Verified locally with `npm run build` + `npm start` against the production output.
