# Deploying to Netlify

`netlify.toml` is already in the repository, so the project deploys **as-is**:
no environment variables, no build-setting changes, no code edits.

## Option A — Git import (recommended)

1. Push this folder to GitHub / GitLab / Bitbucket.
2. Netlify → **Add new site → Import an existing project** → pick the repository.
3. Leave every field untouched — Netlify reads them from `netlify.toml`:

   | Setting | Value (from `netlify.toml`) |
   |---|---|
   | Build command | `npm run build` |
   | Publish directory | `.next` |
   | Runtime plugin | `@netlify/plugin-nextjs` (installed automatically) |
   | Node version | 20 |
   | Environment variables | *(none)* |

4. **Deploy site.** First build takes about 2 minutes.

## Option B — Netlify CLI

```bash
npm i -g netlify-cli
netlify login
netlify init      # links the repo, picks up netlify.toml automatically
netlify deploy --build --prod
```

## Option C — Drag-and-drop (no Git, fully static)

Every route in this app is prerendered and all state lives in the browser, so it
can also be published as plain files:

```bash
npm install
npm run build:static     # writes ./out
```

Then drag the **`out`** folder onto <https://app.netlify.com/drop>. Nothing else
is required — no plugin, no functions, no configuration.

## Why the build cannot fail on Netlify

- **No network dependency at build time.** Inter is self-hosted through
  `@fontsource-variable/inter`; nothing is fetched from Google Fonts.
- **No environment variables, database, API routes or server actions.** The demo
  is entirely client-side and keeps state in `localStorage`.
- **devDependencies are installed** (`NPM_FLAGS = "--include=dev"`), so
  TypeScript, Tailwind and PostCSS are available during the build.
- **Node 20** is pinned, matching the version the project is verified against.

## What `netlify.toml` also configures

- `sw.js` and `manifest.webmanifest` are served with `must-revalidate`, so a new
  deploy never leaves a visitor stuck on the previous PWA shell.
- `/_next/static/*` is served `immutable` for a year (files are content-hashed).
- Baseline security headers: `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`.

## After deploying

- Demo login: any account listed on `/login`, password `demo123`.
- On a phone use **Add to Home Screen** for the installable PWA with offline shell.
- Every visitor gets an independent demo; there is no shared backend and no
  Government data.

## Local checks before deploying

```bash
npm install
npm run typecheck     # tsc --noEmit
npm run lint          # eslint
npm run test:access   # 231 role/route/scope/menu assertions
npm run build         # production build (same command Netlify runs)
npm start             # serve the production build locally
```
