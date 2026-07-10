# DASHBOARD.md

This repo already contains the data plumbing for the authenticated experience.

## Current behavior

- `src/main.tsx` initializes Supabase auth and React Query.
- `src/hooks/useClient.ts` reads the current client row.
- `src/hooks/useRuns.ts` reads recent automation runs.
- `src/hooks/useAnalytics.ts` reads analytics snapshots.
- `src/hooks/useWorkflows.ts` reads workflows with nested runs.
- `src/components/dashboard/StatsRow.tsx` renders dashboard metrics from live data.
- `src/components/dashboard/RunsFeed.tsx` renders recent runs.
- `src/components/dashboard/WorkflowRow.tsx` renders workflow rows.

## Nav rules

- Public users see `Work`, `Services`, `Contact`, and `Client Login`.
- Authenticated users see `Work`, `Services`, `Contact`, `Dashboard`, `Workflows`, and `Sign Out`.
- `Nav.tsx` uses inline-styled auth actions and router navigation for internal movement.

## Data rules

- Keep Supabase reads behind the existing hooks.
- Preserve loading, empty, and error states.
- Do not move API keys into the client bundle.
- Keep `ingest-run` and `n8n-proxy` server-side only.

## Dashboard pages

- `src/pages/DashboardPage.tsx` should remain a composition of the existing dashboard components.
- `src/pages/WorkflowsPage.tsx` should remain a composition of the workflow row component.

## If editing

- Change data shape only if the underlying Supabase schema changes.
- Keep styling and layout aligned with the current studio design system.
