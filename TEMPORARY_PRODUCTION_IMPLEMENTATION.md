# Temporary Production Implementation Plan

This is a working execution plan, not a permanent source of truth. Delete it when the acceptance criteria below are complete; move any enduring operating instructions into `README.md` or `AGENT.md`.

## Goal

Turn the current React dashboard, Supabase contract, and future n8n workflows into a small, supportable client-automation service. The first release should deliver one real workflow end to end before additional integrations are advertised.

## Phase 0: Preserve the Current Baseline

- Commit the currently staged application, Supabase, CI, and documentation changes.
- Tag the first deployed version after it passes validation.
- Do not add a new feature while the database migration history is unresolved.

Acceptance criteria:

- `npm.cmd run lint`
- `npm.cmd run test -- --run`
- `npm.cmd run build`
- The committed revision can be restored from Git.

## Phase 1: Reconcile the Supabase Schema

The tracked migrations alter existing tables but do not create `clients`, `workflows`, `automation_runs`, and `analytics_snapshots`. A fresh project cannot currently be created from this repository alone.

1. Authenticate and link the local project:

   ```powershell
   npx supabase login
   npx supabase link --project-ref iutycpnqlzxovffctjyz
   ```

2. Inspect the remote migration history and pull the actual schema before writing a baseline migration.
3. Reconcile the remote schema, the generated TypeScript types, and the migration files. Do not blindly add a new `create table` migration to the linked production project; it may collide with existing tables.
4. Add a reproducible baseline/schema path that creates all tables, foreign keys, indexes, enums, and RLS policies in a fresh project.
5. Add harmless seed data or an explicit test setup for local verification.

Acceptance criteria:

- A fresh Supabase project or local Supabase stack can apply the full migration history without errors.
- Generated database types match the final schema.
- All four client-facing tables have RLS enabled and only the intended select policies.

## Phase 2: Deploy and Verify Supabase

1. Generate a long random `WEBHOOK_SECRET` and store it only in Supabase Edge Function secrets and the future n8n credential/configuration.
2. Review migrations before applying them:

   ```powershell
   npx supabase db push --dry-run
   npx supabase config push
   npx supabase db push
   npx supabase functions deploy ingest-run
   ```

3. In Supabase Auth, configure the production Site URL, redirect allowlist, sender email/SMTP, password-reset flow, and email verification policy.
4. Create two non-admin test accounts and client records.
5. Prove that each account can only read its own client, workflow, run, and analytics rows.

Acceptance criteria:

- `ingest-run` returns `401` for an invalid secret and `405` for a non-POST request.
- A valid event is inserted once; a repeated `event_id` updates the same run.
- Cross-client reads return no data.
- Login and password reset work using the production domain.

## Phase 3: Establish n8n Infrastructure

Choose one deployment model before creating workflows:

- n8n Cloud for the fastest pilot. Do not claim private infrastructure in this model.
- Self-hosted n8n for the private-infrastructure promise. Start with one hardened VM, Docker Compose, persistent Postgres, HTTPS reverse proxy, automated backups, a fixed encryption key, and no public client access to the n8n admin UI.

For self-hosting, add source-controlled files under `infra/n8n/`:

- `compose.yml`
- `.env.example` without values
- reverse-proxy configuration
- backup and restore instructions
- upgrade procedure

For either model:

- Keep credentials in n8n/Supabase secrets, never workflow JSON or Git.
- Export each real workflow to `n8n/workflows/` after it passes acceptance testing.
- Run `n8n audit` before production launch and after significant changes.

Acceptance criteria:

- n8n is reachable only through HTTPS.
- Credentials survive restart and are recoverable from documented secrets/backups.
- A workflow can call the Supabase `ingest-run` endpoint with the shared secret.

## Phase 4: Build the First Vertical Slice

Pick one client outcome, not a generic integration catalog. Recommended first package: lead capture, CRM sync, immediate email follow-up, and dashboard telemetry.

Workflow shape:

```text
Lead source -> validate and deduplicate -> CRM update -> follow-up action
                                                    -> ingest-run success event
Failure path -> alert operator -> ingest-run error event
```

Each workflow event must include the canonical fields:

- `event_id`
- `client_id`
- `feature_type`
- `workflow_name`
- `status`
- `records_processed`
- `records_failed`
- `duration_ms`
- `error_message` when applicable
- `metadata` when useful

Acceptance criteria:

- A test lead completes the intended client action exactly once.
- A forced failure appears as an error in the dashboard and alerts the operator.
- The exported workflow and its required credentials are documented without secrets.

## Phase 5: Make the Product UI Truthful and Usable

1. Remove or replace unverified landing-page figures: `10,000+`, `98%`, `40hrs`, and `< 1s`.
2. Change "monitored in real time" to ordinary monitoring until Supabase Realtime or a short refetch interval is implemented.
3. Keep integration names as capabilities, not guarantees, until each has a supported workflow template.
4. Remove the dashboard's non-functional Quick Actions or implement one real action first.
5. Add a client-provisioning process: document a manual pilot procedure first, then build a protected server-side invite flow that creates both the Auth user and client row.
6. Define whether analytics snapshots are daily totals or cumulative values before using them for customer-facing metrics.

Acceptance criteria:

- Every visible button performs a real action or is absent.
- Every public performance/security claim is supported by a deployed capability or measured production data.
- A new client can be provisioned without manually editing database rows.

## Phase 6: Operate and Expand

1. Configure the frontend host to deploy only after GitHub Actions passes.
2. Add error monitoring for the frontend, Edge Function, and n8n workflows.
3. Alert on failed workflow runs and ingestion failures.
4. Add the second workflow only after the first has a documented failure/retry process.
5. Promote changes through staging before production.

Acceptance criteria:

- A failed workflow creates an operator alert and a dashboard record.
- A restore drill proves that database and n8n data can be recovered.
- Changes are reviewed and validated before they reach the production instance.
