# Phase 2 local verification — 2026-09-10

## Tested state and environment

- Owner: Codex. Evidence recorded on 2026-09-10 at 06:15 UTC after the final compiler checks.
- Starting revision: `9ff58b60e559a14a892635aa8d414a91b40e6492`, with a clean working tree.
- Tested result: uncommitted Phase 2 changes on that revision; no commit, deployment, or remote operation was performed.
- Environment: Windows PowerShell, Node.js 24.16.0, installed repository dependencies, Vitest 4.1.11, TypeScript 6.0.2, Vite 8.2.2.
- HTTP handler harness: Vitest Node environment, real Request/Response, Zod 3.23.8 via the existing Deno-import alias, and the installed Supabase SDK with a controlled fetch transport. UI tests use Testing Library, real React Query hooks/cache, and controlled Supabase responses.

## Commands and observed results

| Command | Exit | Result |
| --- | --- | --- |
| `npm.cmd run test -- --run src/test/useDashboardMetrics.test.tsx` before implementation | 1 | Both new query-failure cases failed as expected: the old hook reported success instead of error. Three existing/successful-empty cases passed. |
| `npm.cmd run test -- --run src/test/useDashboardMetrics.test.tsx src/test/dashboardReliability.test.tsx` after implementation | 0 | 19 tests passed across 2 files. |
| `npm.cmd run test -- --run` | 0 | 181 tests passed across 29 files, including 40 browser-endpoint cases and the existing ingestion handler tests. |
| `npm.cmd run lint` | 0 | No diagnostics. |
| `npm.cmd run build` | 0 | All referenced compiler projects passed; production assets built successfully, 1,034 modules transformed. |
| `npm.cmd run agents:typecheck` | 0 | No diagnostics. |
| `tsc.cmd -p tsconfig.app.json --strict --noEmit --incremental false --pretty false` | 0 | No diagnostics using the local compiler. |
| `tsc.cmd -p tsconfig.node.json --strict --noEmit --incremental false --pretty false` | 0 | No diagnostics using the local compiler. |
| `tsc.cmd -p tsconfig.agents.json --strict --noEmit --incremental false --pretty false` | 0 | No diagnostics using the local compiler. |
| `npm.cmd run refresh-ai` | 0 | Ingested/indexed 419 files. Reviewed the generated diff: 8 knowledge pages and 8 JSON indexes reflect the new handlers, query component, tests, and authored documentation. |
| Local Markdown target validation / generated JSON parsing | 0 | 291 local link targets resolved across 20 changed Markdown files; all 8 changed JSON indexes parsed successfully. |
| `git -c core.safecrlf=false diff --check` | 0 | No whitespace errors. |

The full-suite output and individual command results are retained in this task's tool outputs. The compiler initially identified a missing local type-import mapping and the demo handler's overly broad status/narrow error-message types; those were corrected before the passing checks above.

## Behavior evidence

- Canonical metrics aggregate runs without a snapshot request. Canonical failure propagates without fallback; successful empty canonical data uses snapshots. Snapshot failure propagates, and two successful empty queries yield genuine zero metrics.
- Statistics, the demo summary, and the activity chart each execute loading → initial error → retry recovery, successful empty, and cached-data → failed refresh → recovery scenarios. Failures show generic messages without database details. Cached values remain visible, and successful recovery removes the notice.
- Changing 30d → 7d pending → 90d failed does not display 30d statistics or chart values as current; returning to 30d can reuse its own cached values.
- Demo controls disable while a request is pending and restore after success, returned handler errors, thrown requests, and real failed query invalidations. A confirmed event followed by a failed refresh gets a distinct message.
- Both production browser handlers execute in the harness. OPTIONS returns 204 before configuration/client/auth dependencies; GET/PUT/DELETE return 405. All response categories include the specified CORS headers and omit credentialed-cookie permission.
- Missing/malformed/invalid authentication, malformed JSON, invalid payloads, another tenant, foreign primary/fallback integrations, missing configuration, thrown dependencies, and database failures are rejected. Tenant query filters and scoped write payloads are asserted; permissive origins do not authorize writes.
- All four demo event flows pass; failures in lead/appointment creation, listing reads/updates, workflow lookup, and ingestion have browser-readable errors.
- Dashboard composition tests no longer claim that hard-coded child text proves metrics correctness; the reliability tests exercise real consumers and hooks.

## Scope and documentation decisions

Implemented the already-approved Phase 2 contract without changing metric formulas, data sources, polling intervals, time windows, database schema, or the operator/webhook endpoints. Typed handler extraction preserves the existing demo/organization checks and adds a generic catch response so unexpected failures retain CORS. The demo requires an explicit Bearer scheme and a provisioned organization.

The ingestion argument type now permits `p_error_message: string | null`, matching successful demo calls and migration `20260907000001`; this corrects a type mismatch rather than changing the SQL contract. The demo run status is explicitly typed as success/error. No compiler suppressions were introduced.

Authored updates cover the dashboard specification; API, authentication, state, and TypeScript ADRs; demo, staging, testing, and type-checking runbooks; and the Phase 2 tracker/handoff. Authentication and state ADR reviews found no further session, route, or cache-architecture changes necessary. Generated knowledge and repository indexes are refreshed through `npm.cmd run refresh-ai` and reviewed separately from authored sources.

Changed implementation/configuration files: `src/hooks/useDashboardMetrics.ts`; dashboard `StatsRow.tsx`, `Sparkline.tsx`, and new `QueryState.tsx`; `src/pages/DemoPage.tsx`; `src/types/supabase.ts`; both browser endpoint `index.ts` files and new `handler.ts` files; new shared `cors.ts` and `browser-handler.ts`; all three `tsconfig.*.json` projects. Test files: metrics and dashboard composition tests, new `dashboardReliability.test.tsx`, new `browserEndpointHandlers.test.ts`, and new `e2e/staging-demo.spec.ts`.

## Explicit exceptions and follow-up

- Live browser/staging checks: **Not run**. No `STAGING_*` environment variables were configured. The new Playwright demo test requires a seeded, consented dedicated demo account and a deployed handler. No local authenticated browser session was configured; no visual browser observations are claimed.
- Deno entrypoint/gateway execution: **Not run**. Node executes the production handler factories and TypeScript checks their imports; those checks do not prove hosted gateway behavior or Deno dependency resolution.
- Database/RLS and n8n acceptance: not rerun because no database migrations, RLS policies, or n8n code changed. Endpoint tests prove the handler's authorization decisions and tenant filters against controlled responses, not live database isolation. Phase 1's database evidence remains separate.
- Live GitHub, publishing, staging provisioning, and production deployment: not performed; outside this local phase.
- Follow-up owner: next Phase 3 implementer for release safeguards, and staging operator for hosted browser/endpoint acceptance using the documented prerequisites.
