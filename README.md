# Prime State Systems

Prime State Systems is a React and TypeScript client portal for a real-estate automation studio.

The repository contains two connected experiences:

- A public marketing site for the studio.
- An authenticated client portal for workflow activity, automation metrics, integrations, onboarding, and legal consent.

Supabase provides authentication, PostgreSQL data, row-level security, and Edge Functions. n8n is the external automation system that reports workflow outcomes to the portal.

## Start here

| Need | Read |
| --- | --- |
| Run the app locally | [`docs/runbooks/local-development.md`](docs/runbooks/local-development.md) |
| Understand the repository | [`AGENT.md`](AGENT.md), [`docs/README.md`](docs/README.md) |
| Understand the system | [`docs/architecture/`](docs/architecture/) |
| Change a user-facing behavior | [`docs/specs/`](docs/specs/) |
| Work with the database | [`docs/runbooks/database-migrations.md`](docs/runbooks/database-migrations.md) |
| Deploy the application | [`docs/runbooks/deployment.md`](docs/runbooks/deployment.md) |
| Prepare or perform a release | [`docs/runbooks/release-checklist.md`](docs/runbooks/release-checklist.md) |
| Launch production | [`docs/runbooks/production-launch-checklist.md`](docs/runbooks/production-launch-checklist.md) |
| Understand environments and secrets | [`docs/environments.md`](docs/environments.md) |
| Troubleshoot a problem | [`docs/reference/DEBUG.md`](docs/reference/DEBUG.md), [`docs/runbooks/debugging.md`](docs/runbooks/debugging.md) |

## Technology

- React 19 and React Router
- TypeScript and Vite
- Supabase Auth, PostgreSQL, Row Level Security, and Edge Functions
- React Query for server state and caching
- Zustand for authentication state
- Tailwind CSS, project CSS, and Framer Motion for the interface
- Vitest and Testing Library for tests
- n8n for external workflow automation

## Requirements

- Node.js 24 is used by the GitHub Actions workflow. Use the same major version locally when possible.
- npm
- A local or staging Supabase project for data-backed flows

## Local setup

Create `.env.local` in the repository root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_POSTHOG_PROJECT_TOKEN=phc_your-project-token
VITE_POSTHOG_HOST=https://us.i.posthog.com
VITE_SENTRY_DSN=https://public-key@o000000.ingest.sentry.io/000000
VITE_SENTRY_ENVIRONMENT=local
VITE_SENTRY_TRACES_SAMPLE_RATE=0
```

These are browser-side values. The Supabase anonymous key is protected by Supabase policies, and the PostHog project token and Sentry DSN are public by design. None of them is a replacement for server-side secrets. Never put webhook, admin, service-role, or n8n credentials in a `VITE_` variable.

Install dependencies and start the development server:

```powershell
npm.cmd install
npm.cmd run dev
```

The Vite server normally runs at `http://localhost:52124`. Vite may choose another port if that port is already in use.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm.cmd ci` | Install exact locked dependencies for CI/release verification |
| `npm.cmd install` | Install or update dependencies during development |
| `npm.cmd run dev` | Start the Vite development server |
| `npm.cmd run lint` | Run ESLint |
| `npm.cmd run test -- --run` | Run the test suite once |
| `npm.cmd run build` | Type-check and create a production build |
| `npm.cmd run preview` | Serve the production build locally |
| `npm.cmd audit --omit=dev` | Check production dependencies for known vulnerabilities |
| `npm.cmd audit` | Check all dependencies for known vulnerabilities |
| `npx playwright install chromium` | Install the browser runtime for Playwright checks |
| `npm.cmd run test:e2e:staging` | Run staging browser E2E checks |
| `npm.cmd run acceptance:invite:staging` | Exercise the staging invite Edge Function |
| `npm.cmd run acceptance:ingest:staging` | Exercise staging workflow ingestion and idempotency |
| `npm.cmd run db:check` | Check the configured Supabase environment |
| `npm.cmd run db:dry-run` | Preview migrations through the Supabase CLI |
| `npm.cmd run db:test` | Run executable local Postgres RLS isolation tests |
| `npm.cmd run ingest` | Refresh generated repository knowledge |
| `npm.cmd run index` | Rebuild repository indexes |
| `npm.cmd run refresh-ai` | Run both knowledge and index refreshes |

## Acceptance abstractions

Staging launch evidence is captured by three executable checks:

- Browser E2E lives in `e2e/` and is run with `npm.cmd run test:e2e:staging`.
- Invite acceptance lives in `scripts/staging-invite-acceptance.ts` and is run
  with `npm.cmd run acceptance:invite:staging`.
- Ingestion acceptance lives in `scripts/staging-ingest-acceptance.ts` and is
  run with `npm.cmd run acceptance:ingest:staging`.

Set the required `STAGING_*` variables from the staging secret store before
running these commands. See
[`docs/runbooks/staging-acceptance.md`](docs/runbooks/staging-acceptance.md)
for the exact variables and evidence to record.

Before opening a pull request, run lint, tests, and build. If a change affects the database or an Edge Function, also run the relevant local or staging verification described in `docs/runbooks/`.

## Application structure

`src/main.tsx` bootstraps the application and Supabase session. `src/App.tsx` defines routes and protected-route behavior. The main boundaries are:

- `src/pages/` — route-level screens
- `src/components/` — reusable interface pieces
- `src/hooks/` — data access and feature hooks
- `src/store/` — client-side state, including the auth store
- `src/lib/` — domain logic and contracts
- `src/api/` — browser-facing API clients
- `src/types/` — shared TypeScript types
- `src/test/` — unit and component tests
- `supabase/migrations/` — database schema, policies, functions, and RPC changes
- `supabase/functions/` — trusted server-side HTTP functions
- `infra/n8n/` — optional private n8n, Postgres, and Caddy infrastructure
- `n8n/workflows/` — sanitized, reviewed workflow exports
- `docs/` — authored architecture notes, specifications, ADRs, and runbooks
- `docs/knowledge-base/` — generated implementation maps for navigation and coding-agent context

The implementation is the source of truth. If a note disagrees with the code or migrations, verify the implementation and update the note.

## Authentication and tenancy

Authentication is handled by Supabase. The session is stored in Zustand and exposed through `useAuth`. Unauthenticated users are redirected to `/login`; invited users complete consent and password setup at `/accept-invite` before entering the portal.

Client data is organization-scoped. Row Level Security is part of the security boundary, not just a UI concern. Any change to client, organization, workflow, run, or service access must be checked against the relevant migration and tested with two separate client accounts.

## Workflow ingestion

The `ingest-run` Edge Function is the trusted boundary for n8n workflow results. n8n sends a `POST` request with `X-Webhook-Secret` and a payload containing at least:

```json
{
  "event_id": "stable-event-id",
  "client_id": "client-uuid",
  "feature_type": "workflow_automation",
  "workflow_name": "Lead follow-up",
  "status": "success"
}
```

`event_id` makes ingestion idempotent: sending the same event again updates the existing run rather than creating a duplicate. The canonical product table is `workflow_runs`; `automation_runs` is a compatibility projection while older consumers are being migrated. See [`docs/specs/automation-run-ingestion.md`](docs/specs/automation-run-ingestion.md) and [`docs/architecture/canonical-workflow-runs.md`](docs/architecture/canonical-workflow-runs.md).

## Client invitations

The `invite-client` Edge Function is an operator-only endpoint. It creates the Supabase Auth invite and provisions the matching organization, client record, onboarding data, subscriptions, and visible services in the database transaction.

It requires `X-Admin-Invite-Secret` and is not called from browser code. The endpoint contract and failure behavior are documented in [`docs/specs/client-invitation.md`](docs/specs/client-invitation.md).

## Database and production deployment

Use local or staging environments for checks and migration rehearsals. Review the migration plan before applying it to a linked project:

```powershell
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push --dry-run
```

Production deployment requires the approved Supabase project, configured secrets, Auth redirect URLs, and a tenant-isolation check. The full sequence and rollback guidance are in [`docs/runbooks/deployment.md`](docs/runbooks/deployment.md).

Required Edge Function secrets include:

- `WEBHOOK_SECRET`
- `ADMIN_INVITE_SECRET`
- `SITE_URL`
- `INVITE_REDIRECT_URL`

Do not commit real environment files or secrets. Use `.env.mcp.example` as the safe starting point for local/staging MCP operations.

## CI and container publishing

`.github/workflows/ci.yml` runs lint, tests, and a production build for pull requests and pushes to `main`. `.github/workflows/docker.yml` builds and publishes the container image to GitHub Container Registry when `main` changes. The image is tagged both `latest` and with the commit SHA so a known release can be selected during rollback.

The container build receives the public Supabase URL and anonymous key as build arguments. Treat all other credentials as runtime secrets and keep them outside the image.

## Documentation rules

Documentation is divided by purpose:

- `README.md` is the short project entry point.
- `AGENT.md` explains how to work safely in the repository.
- `docs/` contains authored guidance and is reviewed like code.
- `docs/knowledge-base/` is generated and should not be edited by hand.

When implementation behavior changes, update the closest authored document, add or update tests, then run `npm.cmd run refresh-ai`. The refresh command updates generated knowledge and indexes; it must not replace authored specifications, ADRs, or runbooks.

## n8n infrastructure

Use `infra/n8n/` only for the private-infrastructure offering. Copy its environment example to `.env` on the host. Keep credentials, webhook secrets, API keys, and client data out of exported workflow JSON. Export a workflow only after it passes acceptance testing and sanitize the export before committing it.
