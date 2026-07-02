# Robustness Review — `react_production_alpha`

A review of the codebase covering security, correctness, error handling, and
maintainability. Items are ordered by severity. Each section explains the issue,
why it matters, and a concrete fix.

---

## 🔴 Critical

### 1. Supabase service role key stored in `.env.local` with no separation

`SUPABASE_SERVICE_ROLE_KEY` (a full admin JWT) sits in `.env.local` alongside the
frontend `VITE_*` variables. `.gitignore` correctly excludes `*.local`, so it is
**not committed** — but it is in the same directory and same mental model as values
that *are* meant to be public. The service role key bypasses Row-Level Security
completely; any accidental leak (a stray `git add -f`, a build script that reads
the file, a screenshot) gives an attacker full DB write access.

**Verify it stayed out of git** (confirmed during this review):
```
git ls-files .env.local        # → empty (good)
git show HEAD:keys.env         # → no service key (good)
```
The only committed references are the literal string `<SUPABASE_SERVICE_ROLE_KEY>`
in `AGENT.md` and the `Deno.env.get("...")` call in the edge function — not the value.

**Fix:**
- Move the service role key into Supabase Edge Function **secrets**, never a local
  file: `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...` (it already reads from
  `Deno.env.get`, so only the deployment source changes).
- Delete it from `.env.local` entirely.
- Add `.env*` (not just `*.local`) to `.gitignore` so any future `keys.env` /
  `.env.production` is caught automatically.
- In the Supabase dashboard, **rotate the service role key** if it has ever been on
  a shared machine or pasted anywhere.

### 2. The ingest edge function has zero input validation

`supabase/functions/ingest-run/index.ts` trusts the request body unconditionally:

```ts
const payload = await req.json();           // untrusted, unvalidated
const { error } = await supabase
  .from("automation_runs")
  .insert(payload);                          // shape unknown
```

Any unauthenticated POST can insert arbitrary rows (or fail noisily). Combined with
the service role client (which ignores RLS), this is the most dangerous endpoint in
the system.

**Fix:**
- Require a shared secret header (e.g. `X-Webhook-Secret`) checked against a Deno
  secret, since n8n is the only legitimate caller.
- Validate `payload` with Zod before insert (the project already depends on Zod) so
  malformed runs from n8n are rejected with a 400, not a 500.
- Insert an explicit column list, not the raw body, so unknown fields can't pollute
  the table.

---

## 🟠 High

### 3. Live build bug — `npx tsc -b` currently fails

`src/components/dashboard/StatsRow.tsx:8` calls `useRuns` but never uses the result:

```ts
const { data: runs } = useRuns(client?.id);   // 'runs' unused → TS6133
```

With `noUnusedLocals: true` in `tsconfig.app.json`, `npm run build` fails today.

**Fix:** either drop the call or actually use `runs`:
```ts
const {} = useRuns(client?.id);   // if truly unneeded, remove the hook call entirely
```
Confirmed error output:
```
src/components/dashboard/StatsRow.tsx(8,9): error TS6133: 'runs' is declared but its value is never read.
```

### 4. Hard `window.location.href` redirects instead of router navigation

Several places do full page reloads where a client-side route change would do:

- `useAuth.ts:12` — `window.location.href = '/'` on sign-out
- `LoginPage.tsx:36` — `window.location.href = '/dashboard'` after login
- `Nav.tsx:29` — `window.location.href = '/#${hash}'` for in-page anchors

Each reload re-downloads, re-bootstraps auth (`main.tsx:14`), and discards React
state. The login redirect also has a race: the auth state listener in `main.tsx`
fires asynchronously, so a hard redirect to `/dashboard` *can* arrive before the
session is in the store, bouncing the user back to `/login` via `ProtectedRoute`.

**Fix:** use `useNavigate()` (or `navigate` from a returned function) and let the
`onAuthStateChange` listener drive navigation. For login, either await the session
or navigate and trust the listener.

### 5. `formatRelativeTime` is duplicated and returns "1 day ago" for plurals

The exact same function is copy-pasted in `RunsFeed.tsx:4` and `WorkflowRow.tsx:1`,
and both say `"${days} day ago"` regardless of count (`2 day ago`). It's also a
client-side relative time computed once at render, so it silently goes stale on a
long-open tab.

**Fix:**
- Move it to `src/utils/time.ts`, import in both files.
- Pluralize: `${days} day${days === 1 ? "" : "s"} ago` (same for hour/min).
- Optionally add a low-frequency timer or recompute on window focus.

### 6. Missing `prefers-reduced-motion` on the homepage animations

`FAQ.tsx`, `ROICalculator.tsx`, and `IntegrationsOrbit.tsx` all read
`prefers-reduced-motion` correctly. But the **home page** (`HomePage.tsx`) — the
first thing every visitor sees — animates the hero, scroll indicator, and every
`FadeUp`/`ProjectCard` with no reduced-motion guard and no `once`-only consideration
for vestibular sensitivity. `src/utils/motion.ts` even defines a `respectReducedMotion`
helper that is **never imported anywhere**.

**Fix:** wrap homepage motion in the same `useReducedMotion` pattern, or add a
global framer-motion `MotionConfig reduced="user"`.

---

## 🟡 Medium

### 7. Query-cache invalidation is never configured

`main.tsx:9` creates the QueryClient with defaults:

```ts
const queryClient = new QueryClient();
```

Dashboard/workflow data has no `staleTime`, `refetchOnWindowFocus`, or explicit
`retry`. Default `staleTime: 0` means every component mount refetches, and default
`refetchOnWindowFocus: true` hits Supabase on every tab switch. For a dashboard
that updates via n8n webhooks, this is both wasteful and confusing.

**Fix:**
```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

### 8. `ErrorBoundary` is missing — uncaught render errors blank the app

There is no React error boundary. Any throw during render (a malformed `ran_at`
date, an unexpected null in a workflow row, a Supabase shape change) will
unmount the entire app to a blank screen with no recovery path.

**Fix:** add a top-level `ErrorBoundary` around `<Routes>` (or per page) that
shows a styled fallback with a "reload" action. This pairs naturally with
React Query's existing error states.

### 9. `status` and `plan` are untyped strings

`automation_runs.status` and `clients.plan` are `string` in the generated types
(`src/types/supabase.ts`). Code like `run.status` is rendered raw and compared
nowhere — a typo in n8n (`"sucess"` vs `"success"`) silently breaks the UI, and
the StatsRow "success rate" math depends on the snapshot counters, not status, so
the two can drift.

**Fix:** define a Postgres enum (`run_status`, `plan_tier`) and regenerate types so
the UI gets a discriminated union. Short of a schema change, add a Zod parser at
the data boundary.

### 10. Network layer throws raw `Error` — errors are not actionable

`api/n8n/client.ts:17`, `api/n8n/webhooks.ts:19`, and the Supabase hooks all throw
plain `Error("... failed: 401")`. There's no status code, no retry semantics, no
distinction between auth (401 → sign out), rate-limit (429 → backoff), and network
failure (→ retry). The UI can only show a generic "Failed to load data."

**Fix:** introduce a small `ApiError` class carrying `{ status, code, retryable }`
and centralize handling (auto-sign-out on 401, toast + retry on 5xx).

### 11. Orphaned / broken components committed

- `src/components/features/IntegrationsOrbit.tsx` imports `react-icons/si` and
  `react-icons/fa`, but **`react-icons` is not in `package.json`** (it only
  resolves because some transitive dependency or stale `node_modules` provides it).
  A clean install breaks this file.
- `IntegrationsOrbit.tsx`, `FAQ.tsx`, `ROICalculator.tsx` are **not imported
  anywhere** — they're dead code that still type-checks against missing deps.
- `useSupabaseQuery.ts`, `getClientByUserId`, `listWorkflows`,
  `activateWorkflow`, and `N8nWebhookPayload` are exported but unused.
- A whole second scaffolded app lives in `my-app/` (with its own
  `node_modules` and a renamed `.git_disabled` repo folder) — it should not be
  in this repository at all.

**Fix:** either wire these components in or delete them; add `react-icons` to
`package.json` if kept; remove `my-app/` and add it to `.gitignore`.

---

## 🟢 Low / hygiene

### 12. No tests despite the toolchain being installed
`vitest`, `jsdom`, and `@testing-library/*` are all in `devDependencies`, but there
is **no `vitest.config`**, no test script, and zero test files. Add at minimum a
`test` script and tests for `formatRelativeTime`, the ROI math, and the
`ProtectedRoute`/auth redirect logic — the exact spots where bugs #4 and #5 live.

### 13. ESLint is non-type-aware
`eslint.config.js` uses `tseslint.configs.recommended`, not the type-checked
variants. The config also lacks a `lint` CI step. Enabling
`recommendedTypeChecked` (the README even documents how) would catch unused
exports and several of the issues above at edit time.

### 14. `vite.config.ts` has no production hardening
No `build.target`, no `sourcemap` decision (defaults to none in prod, which is fine,
but should be explicit), no chunking strategy. For a production build, set an
explicit `build.target` and consider manual chunks for `react`/`framer-motion`/
`supabase` to improve caching.

### 15. The `LoadingScreen` shows nothing during the initial auth bootstrap
`App.tsx` returns `null`-ish (just a centered "Loading...") while `isLoading` is
true. If `supabase.auth.getSession()` ever rejects (network error on cold load),
`setLoading(false)` is in the `.then` but there's no `.catch` — so `isLoading`
stays true forever and the app never renders.

**Fix:**
```ts
supabase.auth.getSession()
  .then(({ data: { session } }) => setSession(session))
  .catch(() => { /* no session, continue anonymous */ })
  .finally(() => setLoading(false));
```

### 16. Accessibility gaps
- The mobile menu toggle (`Nav.tsx:135`) has `aria-label` but no `aria-expanded`.
- Range inputs in `ROICalculator.tsx` hide the native control (`opacity:0`) without
  an `aria-valuetext`/visible `aria-label` per slider.
- Status dots in `WorkflowRow.tsx` convey meaning by color alone (green/grey) with
  no text alternative.
- `<title>Studio — React</title>` is a template default.

---

## ✅ What's already solid

- Typed Supabase client via generated `Database` types — queries are type-checked.
- React Query + Supabase hooks consistently separate loading / error / empty /
  data states (a pattern the rest of the app could follow).
- Login form uses Zod + react-hook-form with real validation.
- `.gitignore` correctly keeps `.env.local` and `dist` out of source control; the
  service role key value was **not** found in git history.
- `prefers-reduced-motion` is handled in three of the interactive components.
- Route protection via `ProtectedRoute` waits for auth resolution before deciding.

---

## Suggested priority order

1. Fix the build break (#3) — `npm run build` is red right now.
2. Lock down the edge function (#2) and move the service key out of `.env.local` (#1).
3. Add the `.catch` on auth bootstrap (#15) and an error boundary (#8).
4. Replace `window.location` redirects with router navigation (#4).
5. Configure the QueryClient defaults (#7).
6. Delete dead code / `my-app` and declare `react-icons` (#11).
7. Add a `test` script + first tests (#12) and dedupe `formatRelativeTime` (#5).
