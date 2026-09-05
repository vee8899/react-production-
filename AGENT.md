# Working in this repository

This is a React and TypeScript Vite application for a real-estate automation studio. It has a public marketing site and a protected client portal backed by Supabase.

This file is for people and coding agents working on the codebase. It describes the boundaries that matter when making a change; it is not a substitute for reading the implementation.

## Before changing code

1. Read the relevant source, test, migration, and authored documentation.
2. Check `git status` and leave unrelated user changes alone.
3. Identify whether the change affects the public site, authenticated portal, tenancy, database schema, Edge Functions, n8n, or deployment.
4. Prefer the smallest change that fits the existing patterns.

## Repository-wide alignment

`AGENT.md` is the cross-cutting change contract for people and coding agents.
Apply it to every change, not only test work.

1. State the intended behavior and scope before implementation, then keep the diff limited to that purpose.
2. Record the verification performed and every skipped relevant check, including why it was skipped.
3. Correct factual documentation drift (such as stale paths, commands, or descriptions) against the implementation and record the correction. When a behavior change is already authorized, update its specification and implementation together and cite that decision; do not request the same approval again. Pause only the dependent work when an unresolved product, security, compatibility, or operational decision would change the intended contract. Continue unrelated authorized work while that decision is pending.
4. Update authored documentation whenever an approved behavior, operational procedure, or interface changes its claims. Do not edit generated knowledge by hand.
5. Report assumptions, known limitations, and follow-up ownership as explicit exceptions; do not hide them in general review notes.

Use each source for its own purpose: code and migrations describe implemented behavior; specifications define required behavior; ADRs record accepted decisions and their reasons; runbooks describe operations and verification; plans describe remaining work; dated evidence records what was actually tested. A mismatch between code and an accepted specification may be a bug, not a reason to redefine the specification to match it. Generated knowledge is an approximate navigation aid and cannot establish correctness or release readiness.

## Repository boundaries

- `src/main.tsx` — application bootstrap and Supabase session setup
- `src/App.tsx` — route definitions and `ProtectedRoute`
- `src/pages/` — route-level screens
- `src/components/` — shared UI and feature components
- `src/hooks/` — Supabase queries, mutations, and feature behavior
- `src/store/authStore.ts` — authenticated session state
- `src/lib/` — domain contracts and calculations
- `src/api/` — browser-facing API clients
- `src/types/` — TypeScript types
- `src/test/` — Vitest and Testing Library tests
- `supabase/migrations/` — schema, RLS policies, RPCs, and database behavior
- `supabase/functions/` — server-side functions with trusted secrets
- `docs/` — authored documentation
- `docs/knowledge-base/` — generated repository knowledge; do not edit manually

## Security and tenancy

The browser's Supabase client may use `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Other deliberately public browser settings, including telemetry project tokens and DSNs, are documented in `docs/environments.md`. Webhook secrets, admin invite secrets, service-role credentials, and n8n credentials must remain in server-side or host configuration.

Supabase Row Level Security protects organization-scoped data. Do not rely on route guards or hidden UI to enforce tenant isolation. When changing queries, mutations, migrations, or Edge Functions, verify that a client cannot read or write another organization’s data.

The two operator/integration-only HTTP boundaries are:

- `supabase/functions/ingest-run/` for authenticated n8n event ingestion via `X-Webhook-Secret`.
- `supabase/functions/invite-client/` for operator-controlled client provisioning via `X-Admin-Invite-Secret`.

Neither function should be treated as a browser API.

`demo-event` and `configure-alert-route` are separate authenticated endpoints. Verify their bearer-token and organization checks when changing them; a browser route guard does not authorize their server-side writes.

## Data and workflow rules

`workflow_runs` is the canonical execution history used by the product. `automation_runs` exists for compatibility with older consumers. New frontend or integration code should use the canonical ingestion contract and table described in `docs/architecture/canonical-workflow-runs.md`.

Workflow events must have a stable `event_id`. Duplicate events are expected and must remain idempotent. Client, workflow, and organization relationships must be validated at the database boundary.

## Change and verification rules

For a normal UI or logic change:

```powershell
npm.cmd run lint
npm.cmd run test -- --run
npm.cmd run build
```

For database changes, review the migration, run `npm.cmd run db:check`, preview with `npm.cmd run db:dry-run`, and test against local or staging only. For auth, ingestion, onboarding, or tenant changes, include the relevant acceptance flow and two-client isolation check.

For documentation-only changes, still check links, commands, file paths, and claims against the current repository. Do not invent behavior that is only planned.

Pull requests must include the intended change, proof from relevant verification,
and every exception or documentation-drift decision. Use the repository PR template
to record that evidence.

## Documentation workflow

Use `docs/README.md` to find the right document. Specs describe expected behavior, architecture notes describe system boundaries, ADRs record decisions, and runbooks describe repeatable operational tasks.

`npm.cmd run ingest` produces `docs/knowledge-base/` and maintains redirect notices for legacy files in `docs/generated/`; `npm.cmd run index` produces `outputs/repo-index/`. Run `npm.cmd run refresh-ai` after implementation changes and review the generated diff. Change the generator to correct generated output; do not edit that output by hand. Authored specifications, ADRs, runbooks, plans, and evidence must not be overwritten by generation. See `docs/README.md` for document authority and status conventions.

## Style of collaboration

Explain the reason for a change, mention assumptions, and report verification results. Keep comments focused on decisions or non-obvious constraints. Avoid speculative abstractions, broad rewrites, and changes that are unrelated to the requested outcome.
