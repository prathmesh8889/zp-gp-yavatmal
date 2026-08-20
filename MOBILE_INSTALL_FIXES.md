# Mobile view + Install prompt — what changed

## 1. Install prompt (`beforeinstallprompt`)

**Asked for:** popup should appear only after login, and if the user closes it
with ✕ it must never come back on future logins.

| File | Change |
|---|---|
| `src/app/layout.tsx` | `<InstallPrompt />` removed from the root layout (it was showing on the login and public pages). Added a tiny inline script that catches Chrome's `beforeinstallprompt` early and parks it on `window.__zpInstallEvent`, so the Install button still works even though the banner now mounts later. |
| `src/components/layout/AppShell.tsx` | `<InstallPrompt enabled={Boolean(user)} />` mounted here — AppShell only renders once a session exists, so the banner can never appear before login. |
| `src/components/layout/InstallPrompt.tsx` | Dismissal is now **permanent**: `localStorage["zp-install-decision"] = "dismissed" \| "installed"`, with no expiry. The old code stored a 14-day timestamp, which is why the banner kept returning. Also added `sessionStorage["zp-install-shown"]` so it appears at most once per login session, and raised the banner above the bottom nav so it no longer covers it. |

Choosing "Cancel" inside Chrome's own native install dialog also counts as
answered — the banner will not ask again.

## 2. Mobile layout

| File | Change |
|---|---|
| `src/components/ui/Tabs.tsx` | The main "sentences running together" problem. The tab strip was underline-only with no separators, so `Assets 71 · QR Asset Check · Repair Workflow · Plantation` read as one run-on line and the overflow was invisible. On mobile the tabs are now discrete rounded chips in a tinted rail, with a right-edge fade that appears only while there is more to scroll to, and the active chip auto-scrolls into view. Desktop keeps the original underline look. |
| `src/components/ui/primitives.tsx` | **PageHeader** — English title and Marathi title now share one wrapping flex row instead of `ml-2 block`, which was indenting the Marathi text under the English one. Subtitle is smaller with tighter leading on mobile. **Badge** — `whitespace-nowrap` so "Partially Functional" no longer breaks mid-phrase, and the status dot no longer gets squashed. **Select** — `pr-8` so long option labels are not painted under the native dropdown arrow. |
| `src/app/app/nigaa/page.tsx` | Asset cards: the name was `truncate`d mid-word ("Zilla Parishad School, Bor…") and the status pill was crushed against it. The code and pill now share the top row, the full name wraps over up to two lines below, and the meta lines and repeat-failure tag each get their own row. Filter dropdowns go full width on a phone. |
| `src/components/layout/AppShell.tsx` | Bottom nav labels were hard-truncated ("Complaint Rout…"). Items now carry a short label (`labelShort` / `labelShortMr`) and wrap over two lines with a `min-h-[58px]` bar. |
| `src/data/nav.ts` | Added optional `labelShort` / `labelShortMr` to `NavItem`, filled in for every item that can reach the bottom bar. Sidebar still uses the full names. |
| `src/app/globals.css` | Under 640px: `line-height: 1.45` on body text, `1.25` on headings, a `0.25rem` gap between stacked paragraphs, and `word-break` on `.font-mono` so long asset codes wrap instead of widening the card. This is what stops cards reading as one squashed block. |

## Verified

- `npx tsc --noEmit` — clean
- `npm run build` — all 30 routes build
