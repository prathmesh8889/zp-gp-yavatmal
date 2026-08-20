# Role-Based UI Visibility — Implementation Notes

Implements **"Yavatmal Unified Panchayat Operations Platform — RBAC & UI
Visibility Specification v1.0"** (§2, §4, §6, §7, §9, §10).

## The rule that was implemented

> A role must NOT see every feature just because the route exists.

Each of the 26 roles now gets a **purpose-built front end** on the same backend.
A module that is not part of a role's job is:

1. **not in the sidebar**,
2. **not in the mobile bottom bar**,
3. **not in global search results**,
4. **not linked from any dashboard card or quick action**, and
5. **not reachable by typing the URL** — the route guard returns **403**.

## Where the policy lives

| File | Role |
|---|---|
| `src/permissions/menuPolicy.ts` | **NEW — single source of truth.** 26 role menu profiles (`MENU_POLICY`), access levels, path→module mapping, Presentation Mode keys. |
| `src/data/nav.ts` | Module catalogue only. `visibleNavForUser(user, opts)` = menu policy **AND** route guard. Items no longer carry their own `scopes`/`roles`. |
| `src/permissions/routeAccess.ts` | `canAccessRoute(role, path, opts)` now applies **two layers**: menu policy first, then the existing capability/allow-list rule. |
| `src/components/auth/RoleGuard.tsx` | Renders 403 for direct-URL attempts on hidden modules. |
| `src/components/auth/GuardedLink.tsx` | **NEW.** Dashboard/quick-action links disappear (or become non-clickable rows) when the target module is not the role's. |
| `src/components/layout/GlobalSearch.tsx` | Results filtered by module access as well as record scope. |
| `src/components/layout/AppShell.tsx` | Sidebar built from the policy; read-only modules carry a `read` / `summary` badge. |
| `src/components/layout/ViewAsRole.tsx` | Role switch redirects instantly if the current route becomes unauthorized + **Presentation Mode** toggle. |

## Access levels (spec §7 codes)

| Code | Meaning |
|:--:|---|
| **A** | Act — create / edit / submit inside the module |
| **R** | Review — review / verify / return / escalate |
| **V** | View — read-only |
| **S** | Strategic / aggregate summary only |
| **H** | Hidden — not in menu, direct URL → 403 |

Levels drive visibility. **Mutations remain gated by `ROLE_CAPABILITIES`**
(`capabilities.ts`) and record scope (`permissions/index.ts`), exactly as before —
this change adds a layer, it removes none.

## What each role now sees

| # | Role | Scope | Sidebar (level) |
|---|---|---|---|
| 01 | **Public Citizen** `citizen` | public | Home (V) · Public Portal (V) · Complaint Routing (A) · Gram Sabha (V) · Community Participation (A) · Public Transparency (V) · Notifications (V) |
| 02 | **Gram Sabha Member** `gram_sabha_member` | public | Home (V) · Public Portal (V) · Gram Sabha (V) · Community Participation (V) · Public Transparency (V) · Notifications (V) |
| 03 | **Volunteer / Shramdaan** `volunteer` | public | Home (V) · Public Portal (V) · Gram Sabha (V) · Community Participation (A) · Public Transparency (V) · Notifications (V) |
| 04 | **SHG / Community Group Rep** `shg_rep` | public | Home (V) · Public Portal (V) · Gram Sabha (V) · Village Institutions (A) · Community Participation (A) · Innovation Library (A) · Public Transparency (V) · Notifications (V) |
| 05 | **Village Committee / VWSC Member** `vwsc_member` | gp | Home (V) · NIGAA (A) · Complaint Routing (A) · Seasonal Readiness (A) · Gram Sabha (V) · Village Institutions (A) · Community Participation (A) · Public Transparency (V) · Notifications (V) |
| 06 | **Gram Panchayat Member** `gp_member` | gp | Home (V) · NIGAA (V) · Seasonal Readiness (V) · Gram Sabha (V) · Village Institutions (V) · Community Participation (V) · Public Transparency (V) · Notifications (V) |
| 07 | **Up-Sarpanch** `up_sarpanch` | gp | Home (V) · PATHPURAVA (R) · NIGAA (V) · Seasonal Readiness (V) · Gram Sabha (V) · Village Institutions (V) · Community Participation (V) · Public Transparency (V) · Notifications (V) |
| 08 | **Sarpanch** `sarpanch` | gp | Home (V) · PATHPURAVA (R) · NIGAA (V) · Seasonal Readiness (V) · Gram Sabha (V) · Village Institutions (V) · Community Participation (V) · Public Transparency (V) · Reports (V) · Notifications (V) |
| 09 | **Gram Panchayat Staff** `gp_staff` | gp | Home (V) · My Work (A) · NIGAA (A) · Complaint Routing (A) · Seasonal Readiness (A) · Seva Ghadyal (A) · Gram Sabha (V) · Community Participation (A) · Documents / Evidence (A) · Public Transparency (V) · Notifications (V) |
| 10 | **Gram Sevak / VDO** `gram_sevak` | gp | Home (V) · My Work (A) · PATHPURAVA (A) · NIGAA (A) · GP File Flow (A) · Complaint Routing (A) · Process Improvement (A) · Seasonal Readiness (A) · Seva Ghadyal (A) · Gram Sabha (A) · Village Institutions (A) · Community Participation (A) · Convergence (V) · Innovation Library (A) · Documents / Evidence (A) · Public Transparency (V) · Reports (V) · Notifications (V) |
| 11 | **Junior Engineer / Technical** `je` | block | Home (V) · My Work (A) · NIGAA (A) · Convergence (V) · Public Transparency (V) · Notifications (V) |
| 12 | **Extension Officer – GP** `extension_officer` | block | Home (V) · My Work (R) · PATHPURAVA (R) · NIGAA (R) · GP File Flow (R) · Complaint Routing (R) · Mahsul Sandhi (V) · Process Improvement (R) · Seasonal Readiness (R) · Seva Ghadyal (V) · Gram Sabha (R) · Village Institutions (R) · Community Participation (R) · Convergence (V) · Innovation Library (R) · Public Transparency (V) · Reports (V) · Notifications (V) · Audit Trail (V) |
| 13 | **Assistant BDO** `abdo` | block | Home (V) · My Work (R) · PATHPURAVA (R) · NIGAA (R) · GP File Flow (R) · Complaint Routing (R) · Mahsul Sandhi (V) · Process Improvement (R) · Seasonal Readiness (R) · Seva Ghadyal (V) · Gram Sabha (R) · Village Institutions (R) · Community Participation (R) · Convergence (V) · Innovation Library (R) · Public Transparency (V) · Reports (V) · Notifications (V) · Audit Trail (V) |
| 14 | **Panchayat Samiti Member** `ps_member` | block | Home (V) · NIGAA (V) · Seasonal Readiness (V) · Gram Sabha (V) · Village Institutions (V) · Community Participation (V) · Public Transparency (V) · Reports (V) · Notifications (V) |
| 15 | **Up-Sabhapati** `up_sabhapati` | block | Home (V) · NIGAA (V) · Seasonal Readiness (V) · Gram Sabha (V) · Village Institutions (V) · Community Participation (V) · Public Transparency (V) · Reports (V) · Notifications (V) |
| 16 | **Sabhapati** `sabhapati` | block | Home (V) · NIGAA (V) · Seasonal Readiness (V) · Gram Sabha (V) · Village Institutions (V) · Community Participation (V) · Public Transparency (V) · Reports (V) · Notifications (V) |
| 17 | **Block Development Officer** `bdo` | block | Home (V) · My Work (R) · PATHPURAVA (R) · NIGAA (R) · GP File Flow (R) · Complaint Routing (R) · Mahsul Sandhi (A) · Process Improvement (A) · Seasonal Readiness (R) · Seva Ghadyal (V) · Gram Sabha (R) · Village Institutions (R) · Community Participation (R) · Convergence (R) · Innovation Library (R) · Public Transparency (V) · Reports (V) · Notifications (V) · Audit Trail (V) |
| 18 | **Block Department Officer** `block_dept_officer` | block | Home (V) · My Work (R) · PATHPURAVA (R) · NIGAA (R) · GP File Flow (R) · Complaint Routing (R) · Mahsul Sandhi (V) · Process Improvement (R) · Seasonal Readiness (R) · Seva Ghadyal (V) · Gram Sabha (R) · Village Institutions (R) · Convergence (V) · Innovation Library (R) · Public Transparency (V) · Reports (V) · Notifications (V) · Audit Trail (V) |
| 19 | **Deputy CEO – Panchayat** `dyceo_panchayat` | district | Home (V) · PATHPURAVA (R) · NIGAA (S) · GP File Flow (R) · Complaint Routing (S) · Mahsul Sandhi (R) · Process Improvement (A) · Seasonal Readiness (S) · Seva Ghadyal (S) · Gram Sabha (S) · Village Institutions (S) · Community Participation (S) · Convergence (S) · Innovation Library (R) · Public Transparency (V) · Reports (S) · Notifications (V) · Research Map (V) · Role & Access Map (V) · Architecture (V) · Module Status (V) · Production Readiness (V) · Audit Trail (V) |
| 20 | **Deputy CEO / Dept Head** `dyceo_dept_head` | district | Home (V) · PATHPURAVA (R) · NIGAA (S) · GP File Flow (R) · Complaint Routing (S) · Mahsul Sandhi (V) · Process Improvement (A) · Seasonal Readiness (S) · Seva Ghadyal (S) · Gram Sabha (S) · Village Institutions (S) · Community Participation (S) · Convergence (S) · Innovation Library (R) · Public Transparency (V) · Reports (S) · Notifications (V) · Audit Trail (V) |
| 21 | **Additional CEO** `additional_ceo` | district | Home (V) · PATHPURAVA (R) · NIGAA (S) · GP File Flow (R) · Complaint Routing (S) · Mahsul Sandhi (R) · Process Improvement (A) · Seasonal Readiness (S) · Seva Ghadyal (S) · Gram Sabha (S) · Village Institutions (S) · Community Participation (S) · Convergence (S) · Innovation Library (R) · Public Transparency (V) · Reports (S) · Notifications (V) · Research Map (V) · Role & Access Map (V) · Architecture (V) · Module Status (V) · Production Readiness (V) · Audit Trail (V) |
| 22 | **Zilla Parishad Member** `zp_member` | district | Home (V) · NIGAA (S) · Seasonal Readiness (S) · Gram Sabha (S) · Community Participation (S) · Public Transparency (V) · Reports (S) · Notifications (V) |
| 23 | **ZP Vice-President** `zp_vice_president` | district | Home (V) · NIGAA (S) · Seasonal Readiness (S) · Gram Sabha (S) · Community Participation (S) · Public Transparency (V) · Reports (S) · Notifications (V) |
| 24 | **ZP President** `zp_president` | district | Home (V) · NIGAA (S) · Seasonal Readiness (S) · Gram Sabha (S) · Community Participation (S) · Public Transparency (V) · Reports (S) · Notifications (V) |
| 25 | **Chief Executive Officer – ZP** `ceo` | district | Home (V) · PATHPURAVA (S) · NIGAA (S) · GP File Flow (S) · Complaint Routing (S) · Mahsul Sandhi (V) · Seasonal Readiness (S) · Seva Ghadyal (S) · Gram Sabha (S) · Village Institutions (S) · Community Participation (S) · Convergence (S) · Innovation Library (S) · Public Transparency (V) · Reports (S) · Notifications (V) · Research Map (V) · Role & Access Map (V) · Architecture (V) · Module Status (V) · Production Readiness (V) · Audit Trail (V) |
| 26 | **System Administrator** `sysadmin` | system | Home (V) · Public Transparency (V) · Notifications (V) · Research Map (V) · Role & Access Map (V) · Architecture (V) · Module Status (V) · Production Readiness (V) · Audit Trail (V) · Users & Roles (A) · Settings (V) |

## Deliberate decisions (documented deviations)

- **Presentation pages** (Research Map, Access Map, Architecture, Module Status,
  Production Readiness) are hidden from every field/elected user. They stay
  available to System Administrator, Dy CEO – Panchayat, Additional CEO and CEO
  (spec §7 "Research/Arch" column), and can be exposed to **any** role for a demo
  via the **Presentation Mode** toggle inside "View as Role" (spec §9-A). The
  toggle never unlocks an operational module.
- **Settings** is hidden from every sidebar except System Administrator (spec §7).
  Because the page only shows the signed-in user's own profile, language and
  offline queue — never another role's data — the route itself stays reachable
  for a signed-in user instead of 403-ing on their own profile.
- **System Administrator sees no operational module at all** (spec §4 role 26).
  Mahsul Sandhi is marked `V` for sysadmin in the §7 table but is not listed in
  the §4 sidebar for that role; the stricter §4 reading was applied, so the
  admin is not an operational superuser.
- **CEO Process Improvement** stays hidden: §7 marks it `S`, but the module route
  requires `MANAGE_PROCESS_IMPROVEMENT`, which CEO does not hold (§6: "CEO no
  experiment mutation"). The two layers agree on hiding rather than showing a
  card that 403s. CEO still sees improvement *outcomes* on the CEO dashboard.
- **Innovation for SHG representatives** — §4 role 04 allows innovation
  submission, so `/app/innovation` was opened to `shg_rep` (previously
  non-public roles only).
- **Home and Notifications** stay in every role's menu; both render role-specific
  content only.
- **New nav entries**: *Public Portal* (public roles) and *Documents / Evidence*
  (GP Staff, Gram Sevak) — both were listed in §4 but had no menu item.

## Verifying

```bash
npm run test:access        # 231 assertions — 58 of them cover menu visibility
node scripts/gen-access-matrix.mjs   # regenerates ACCESS_MATRIX.md incl. menu matrix
npm run typecheck
```

The suite asserts, among others: the sidebar can never show a module that would
403; only System Administrator sees Users & Roles; public roles see no internal
module; JE sees exactly six items; Sysadmin sees no operational module; and
Presentation Mode exposes only the explainer pages.

## Adding or changing a role's access

Edit **`MENU_POLICY` in `src/permissions/menuPolicy.ts`** — that is the only
place. Sidebar, mobile nav, route guard, search and dashboard links all follow
automatically. Then re-run `npm run test:access` and
`node scripts/gen-access-matrix.mjs`.
