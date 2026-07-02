# Robustness Review — Round 2 (post-fix verification)

Re-review after the 11-step remediation. Build is green, 10 tests pass. Most of
Round 1 is resolved. This doc covers what's fixed, what newly surfaced, and what
remains open.

---

## ✅ Confirmed fixed (from Round 1)

| # | Item | Status |
|---|------|--------|
| 1 | Service role key out of `.env.local` | ✅ removed; `.gitignore` now has `.env*`, `keys.env`, `my-app/` |
| 2 | Edge function unvalidated/unauthenticated | ✅ shared-secret header + Zod schema + explicit column insert |
| 3 | Build broken (unused `runs` in StatsRow) | ✅ `npm run build` green |
| 4 | Auth bootstrap no `.catch` | ✅ `.catch().finally()` added |
| 5 | No error boundary | ✅ `ErrorBoundary` wraps `<Routes>` |
| 6 | `window.location` hard redirects | ✅ router navigation in `useAuth` + `LoginPage` |
| 7 | QueryClient defaults | ✅ `staleTime: 60s`, no focus refetch, `retry: 1` |
| 8 | Duplicated `formatRelativeTime` + plurals | ✅ moved to `src/utils/time.ts`, pluralized |
| 9 | `my-app/` + missing `react-icons` | ✅ `my-app/` deleted, `react-icons` declared |
| 10 | Homepage reduced-motion | ✅ global `<MotionConfig reducedMotion="user">` |
| 11 | No tests | ✅ vitest config + `time` and `ProtectedRoute` tests (10 passing) |

Service role key was **not** leaked into git history at any point (verified).

---

## 🟠 Newly surfaced — `npm run lint` is failing (5 errors)

The Round 1 changes got `build` green but `lint` now reports errors that block a
clean CI gate:

### N1. `src/types/supabase.ts` is UTF-16 with a BOM — ESLint can't parse it

```
src/types/supabase.ts  1:0  error  Parsing error: File appears to be binary
```
First bytes are `ff fe` (UTF-16 LE BOM); `git ls-files --eol` reports `i/-text`
(git treats it as binary). This was latent before but now surfaces because lint is
being run. It also means some editors/tools read the file oddly.

**Fix:** re-save the file as UTF-8 (no BOM):
```bash
# one-liner to convert UTF-16 → UTF-8
iconv -f UTF-16LE -t UTF-8 src/types/supabase.ts > /tmp/sb.ts && \
  mv /tmp/sb.ts src/types/supabase.ts
# strip the BOM if iconv left one
sed -i '1s/^\xEF\xBB\xBF//' src/types/supabase.ts
```
Re-generating types via `supabase gen types` would also produce a clean UTF-8 file.

### N2. `react-hooks/set-state-in-effect` in `Nav.tsx:42`

```ts
useEffect(() => {
  setMenuOpen(false);
}, [location.pathname]);
```
The new `eslint-plugin-react-hooks` v7 rule flags calling `setState` directly in an
effect. This is a common pattern (close the mobile menu on route change), but the
rule wants it expressed as a derived/reset state rather than a side effect.

**Fix options (pick one):**
- Reset via the `key` of the menu state tied to pathname, or
- Close the menu in the same handler that triggers navigation (the existing
  `onClick={() => setMenuOpen(false)}` already does this for mobile links), then
  remove this effect entirely — it may be redundant.
- If kept, disable the single line with a scoped `// eslint-disable-next-line
  react-hooks/set-state-in-effect` and a comment explaining why.

This one is likely **safe in practice** (it's idempotent), so an eslint-disable
with justification is acceptable — but the red lint must be resolved either way.

---

## 🟡 Remainders — committed file still tracked + dead code kept

### R1. `keys.env` is in `.gitignore` but **still tracked in git**
Adding a file to `.gitignore` does **not** untrack it once committed. `git ls-files
keys.env` still returns it. It's now a stale duplicate of `.env.local` (it even
contains an empty `VITE_N8N_WEBHOOK=` that nothing reads).

**Fix:**
```bash
git rm --cached keys.env
git commit -m "Remove stale tracked keys.env"
```
Then delete the file from disk.

### R2. Five unused exports intentionally kept (Step 9 default)
`useSupabaseQuery`, `getClientByUserId`, `listWorkflows`, `activateWorkflow`, and
`N8nWebhookPayload` have **zero** usages. Step 9 defaulted to keeping them pending
your call. Decide and either wire them in or delete them — dead exports rot and
confuse future readers.

⚠️ If you do keep `listWorkflows`/`activateWorkflow`, note they rely on
`n8nFetch`, which sends `X-N8N-API-KEY` from `VITE_N8N_API_KEY`. That key is
currently **empty** and, more importantly, any `VITE_` value ships in the client
bundle and would expose your n8n API key to every visitor. Those calls must go
through a backend/edge function, not the browser.

### R3. Test re-implements `ProtectedRoute` instead of testing the real one
`src/test/ProtectedRoute.test.tsx` defines its **own** copy of `ProtectedRoute`
inline (the comment acknowledges this). So the assertions cover a stand-in, not the
component in `App.tsx`. The real one reads `useAuth()`, which the test doesn't
exercise through the real wiring.

**Fix:** export `ProtectedRoute` from `App.tsx` (or move it to its own file) and
import the real component in the test, mocking `@/hooks/useAuth` instead of the
store directly.

---

## 🟢 Carried over from Round 1 (still open, lower priority)

- **N3 / Round-1 #14:** Build emits a single 708 kB chunk (gzip 209 kB) — framer-motion,
  supabase, react-query all in one. Vite warns about >500 kB. Add manual chunks or
  route-level `React.lazy` to improve caching and first paint.
- **Round-1 #9:** `automation_runs.status` and `clients.plan` are still untyped
  `string`. A Postgres enum + type regen would give the UI a discriminated union.
- **Round-1 #10:** Network layer still throws plain `Error` with no status code —
  no distinction between 401/429/5xx for the UI.
- **Round-1 #16 (a11y):** mobile menu toggle missing `aria-expanded`; ROI range
  inputs lack `aria-valuetext`; workflow status dot conveys meaning by color alone;
  `<title>` is still the template default "Studio — React".

### Minor / cosmetic
- `ErrorBoundary.tsx:42` sets `hasError: false` then immediately calls
  `window.location.reload()` — the `setState` is dead code since the reload
  remounts everything. Harmless, but drop it.
- Zod version drift: frontend is zod `^4.4.3`, the edge function imports
  `zod@v3.23.8` from Deno. They run in separate environments so it's not a bug,
  but pinning both to v4 keeps the schemas consistent if you ever share them.

---

## Suggested next actions (in order)

1. **Make `npm run lint` pass** — fix N1 (re-encode `supabase.ts` to UTF-8) and N2
   (remove the redundant `setMenuOpen` effect or scope-disable it). This is the only
   thing currently red and it blocks CI.
2. **`git rm --cached keys.env`** (R1) — one command, kills the stale tracked file.
3. **Decide on the dead exports** (R2) — delete or wire in; if kept, move the n8n
   calls behind a backend.
4. **Strengthen the ProtectedRoute test** (R3) to cover the real component.
5. Code-split the bundle (N3) and address the a11y gaps whenever you next touch
   those components.

Everything else is in good shape — the critical and high-severity items from Round 1
are genuinely resolved, not just papered over.
