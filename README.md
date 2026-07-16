# Prime State Systems

React and TypeScript client portal for a real-estate automation studio. Public visitors can view the studio site; authenticated clients can view workflow activity and automation metrics.

## Run locally

1. Create `.env.local` with:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Install and start the app:

   ```powershell
   npm.cmd install
   npm.cmd run dev
   ```

The local dev server runs on `http://localhost:52124`.

## Validate

```powershell
npm.cmd run lint
npm.cmd run test -- --run
npm.cmd run build
```

## Automation ingestion

The `ingest-run` Supabase Edge Function records n8n workflow outcomes. Each payload must include a stable `event_id`, `client_id`, `feature_type`, `workflow_name`, and `status`. Reusing an `event_id` updates the existing run instead of creating a duplicate.

Set `WEBHOOK_SECRET` as an Edge Function secret and send it in the `X-Webhook-Secret` header from n8n. Do not expose n8n API keys in browser environment variables.

## Client provisioning

The `invite-client` Edge Function creates the Supabase Auth invite and the matching `clients` row. It is an operator-only endpoint protected by `ADMIN_INVITE_SECRET`, not a browser flow.

Required request:

```http
POST /functions/v1/invite-client
X-Admin-Invite-Secret: <ADMIN_INVITE_SECRET>
Content-Type: application/json
```

```json
{
  "company_name": "Client Company",
  "email": "client@example.com",
  "plan": "starter",
  "services": [
    { "feature_type": "workflow_automation", "status": "onboarding" },
    { "feature_type": "system_integrations", "status": "active" }
  ]
}
```

`services` is optional. It controls the client-facing service visibility and accepts `onboarding`, `active`, `paused`, or `cancelled`. The response includes the created `client_id` and `user_id`. Store those IDs when configuring a workflow for that client.

## Production setup

1. Run the Supabase CLI through `npx`, then authenticate and link the project:

   ```powershell
   npx supabase login
   npx supabase link --project-ref iutycpnqlzxovffctjyz
   ```

2. Review the migration plan before applying it:

   ```powershell
   npx supabase db push --dry-run
   ```

   The repository includes the baseline client tables plus the canonical organization-scoped `workflow_runs` model. Review the backfill and compatibility migrations before applying them to a linked remote project.

3. Generate long random values for `WEBHOOK_SECRET` and `ADMIN_INVITE_SECRET`, then deploy the database, function config, and functions:

   ```powershell
   npx supabase secrets set WEBHOOK_SECRET="replace-with-a-long-random-secret"
   npx supabase secrets set ADMIN_INVITE_SECRET="replace-with-a-long-random-secret"
   npx supabase secrets set SITE_URL="https://react-production.pages.dev/"
   npx supabase secrets set INVITE_REDIRECT_URL="https://react-production.pages.dev/accept-invite"
   npx supabase config push
   npx supabase db push
   npx supabase functions deploy ingest-run
   npx supabase functions deploy invite-client
   ```

   `ingest-run` is configured to bypass Supabase JWT verification because n8n is an external service. It rejects every request unless the shared secret is present and correct.
   `invite-client` also bypasses Supabase JWT verification and rejects every request unless the admin invite secret is present and correct.

4. In Supabase Auth settings, set the production Site URL to `https://react-production.pages.dev/`, allow `https://react-production.pages.dev/accept-invite` as an auth redirect URL, configure the sender email/SMTP, and test a new client invite. Invited users land on `/accept-invite`, consent to portal access, set their password, and then continue to the dashboard.

5. Verify tenant isolation with two test accounts: each account must see its own client row, runs, workflows, and analytics, but never the other account's data. The `20260711000001_client_data_rls.sql` migration enables this policy enforcement.

6. GitHub Actions runs lint, tests, and production builds for pushes and pull requests. Configure your deployment provider to deploy only after this workflow is green.

## n8n infrastructure

Use `infra/n8n/` only if you are delivering the private-infrastructure offer. It contains a Docker Compose stack for n8n, Postgres, and Caddy, plus backup and restore scripts. Copy `infra/n8n/.env.example` to `.env` on the host and keep the real values out of Git.

Use `n8n/workflows/` for exported workflow JSON after a workflow passes acceptance testing. Do not export credentials, webhook secrets, API keys, or client data.
