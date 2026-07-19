# Working in this repository

This is a React and TypeScript Vite application for a real-estate automation studio. It has a public marketing site and a protected client portal backed by Supabase.

This file is for people and coding agents working on the codebase. It describes the boundaries that matter when making a change; it is not a substitute for reading the implementation.

## Before changing code

1. Read the relevant source, test, migration, and authored documentation.
2. Check `git status` and leave unrelated user changes alone.
3. Identify whether the change affects the public site, authenticated portal, tenancy, database schema, Edge Functions, n8n, or deployment.
4. Prefer the smallest change that fits the existing patterns.

The code and SQL migrations are the source of truth. If generated knowledge or an older document disagrees with the implementation, trust the implementation, then repair the document.

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
- `knowledge/` — generated repository knowledge; do not edit manually

## Security and tenancy

The browser may use only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Webhook secrets, admin invite secrets, service-role credentials, and n8n credentials must remain in server-side or host configuration.

Supabase Row Level Security protects organization-scoped data. Do not rely on route guards or hidden UI to enforce tenant isolation. When changing queries, mutations, migrations, or Edge Functions, verify that a client cannot read or write another organization’s data.

The two trusted HTTP boundaries are:

- `supabase/functions/ingest-run/` for authenticated n8n event ingestion via `X-Webhook-Secret`.
- `supabase/functions/invite-client/` for operator-controlled client provisioning via `X-Admin-Invite-Secret`.

Neither function should be treated as a browser API.

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

## Documentation workflow

Use `docs/README.md` to find the right document. Specs describe expected behavior, architecture notes describe system boundaries, ADRs record decisions, and runbooks describe repeatable operational tasks.

`knowledge/` is produced by `npm.cmd run ingest` and `npm.cmd run index`. Run `npm.cmd run refresh-ai` after implementation changes, review the generated diff, and keep authored docs separate from generated output. The ingestion script must not overwrite hand-written specs, ADRs, or runbooks.

## Style of collaboration

Explain the reason for a change, mention assumptions, and report verification results. Keep comments focused on decisions or non-obvious constraints. Avoid speculative abstractions, broad rewrites, and changes that are unrelated to the requested outcome.
