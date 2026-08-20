# "Install App / Add to Home Screen" prompt — how it works & how to edit it

Two files:

- `src/components/layout/InstallPrompt.tsx` — the banner itself
- `src/app/layout.tsx` — a small inline script that captures Chrome's
  `beforeinstallprompt` event early (it fires while the login page is still on
  screen, before the banner mounts)

The banner is mounted inside `src/components/layout/AppShell.tsx`, which only
renders once a session exists.

## When the visitor sees it

| Situation | Behaviour |
|---|---|
| Not logged in (`/login`, `/public`) | **Never shown** |
| First login, Android Chrome / Edge / Samsung | Banner ~2s after the dashboard loads, with a real **Install** button |
| First login, desktop Chrome / Edge | Same banner, bottom-right |
| First login, iPhone / iPad Safari | Banner with manual steps: **Share → Add to Home Screen** |
| iPhone Chrome / Firefox | Nothing (only Safari can install on iOS) |
| Already installed / opened from the home screen | Nothing |
| **Tapped ✕ once** | **Never shown again — on any future login, forever** |
| **Installed** | **Never shown again** |
| Same session, navigating between pages | Shown at most once |

## How "never again" is stored

`localStorage["zp-install-decision"]` is set to `"dismissed"` or `"installed"`.
It has **no expiry date** — unlike the old 14-day timer, logging in next week
or next month will not bring the banner back.

`sessionStorage["zp-install-shown"]` keeps it to once per login session, so a
mid-session page reload does not re-trigger it.

To test the banner again on your own phone: DevTools → Application → Local
Storage → delete `zp-install-decision`, and Session Storage → delete
`zp-install-shown`.

## The only knobs you need — top of `InstallPrompt.tsx`

```ts
const CONFIG = {
  title: "Install ZP Yavatmal",            // banner heading
  subtitle: "Works offline, opens full screen.",
  installLabel: "Install",                 // button text
  iosTitle: "Add to Home Screen",          // heading for iPhone users
  delayMs: 2000,                           // wait after login
  storageKey: "zp-install-decision",       // permanent decision
  sessionKey: "zp-install-shown",          // once per session
  showIosInstructions: true,               // false = hide on iPhone/iPad
};
```

Marathi example:
`title: "अ‍ॅप इंस्टॉल करा"`, `installLabel: "इंस्टॉल"`,
`iosTitle: "होम स्क्रीनवर जोडा"`.

## Why the browser agrees to show it

Chrome only offers installation when **all** of these are true — all are in place:

| Requirement | Where |
|---|---|
| Served over HTTPS | Netlify does this automatically |
| `manifest.webmanifest` linked from every page | `src/app/layout.tsx` → `metadata.manifest` |
| `name`, `short_name`, `start_url`, `display: "standalone"` | `public/manifest.webmanifest` |
| A 192×192 **and** a 512×512 PNG icon | `public/icon-192.png`, `public/icon-512.png` |
| A maskable icon (round Android icon) | `public/icon-maskable-512.png` |
| A service worker with a `fetch` handler | `public/sw.js`, registered by `ServiceWorkerRegister` |
| Apple touch icon for iOS | `metadata.icons.apple` → `/icon-192.png` |

Note: Chrome fires `beforeinstallprompt` **once per profile until the app is
uninstalled**. If nothing appears, reset with DevTools → **Application →
Storage → Clear site data**, then reload.

## Changing the installed app's name / icon / colours

`public/manifest.webmanifest`:

- `short_name` — label under the home-screen icon (keep ≤ 12 characters)
- `start_url` — page the installed app opens
- `theme_color` — status-bar colour
- `icons` — replace the PNGs with your own 192px and 512px files

After changing icons or the manifest, bump the cache key in `public/sw.js`
(`yvt-panchayat-demo-v6` → `v7`) so returning visitors pick up the new files.
