# Production launch checklist

Use this checklist for the first production launch and every subsequent
release that changes the database, authentication, Edge Functions, or client
portal behavior.

Do not check a box without recording the evidence: command output, screenshot,
URL, commit SHA, migration version, or log/request ID.

## 0. Set the release variables

Run these commands from the repository root. Replace placeholders; never put
secrets in this file or commit them.

```powershell
$ProjectRef = "your-production-project-ref"
$ProductionUrl = "https://app.example.com"
$ReleaseSha = (git rev-parse HEAD).Trim()
$PreviousImageSha = "known-good-image-sha"

if ((git status --porcelain) -ne "") { throw "Stop: working tree is not clean" }
Write-Host "Launching $ReleaseSha to $ProductionUrl"
```

- [ ] Release SHA is reviewed and matches the CI artifact.
- [ ] Previous image SHA and previous Edge Function commit are recorded.
- [ ] Staging verification is complete.
- [ ] Rollback owner and release owner are identified.

## 1. Create and secure the production Supabase project

- [ ] Create the production Supabase project in the approved organization and region.
- [ ] Record the project ref and database region in the release record.
- [ ] Enable database backups and confirm the retention policy.
- [ ] Confirm the production project is separate from local and staging.
- [ ] Do not copy production service-role keys into `.env.local`, Docker build args, or GitHub repository files.

```powershell
npx supabase login
npx supabase link --project-ref $ProjectRef
npx supabase projects list
```

## 2. Configure Supabase Auth

In Supabase Dashboard → Authentication → URL Configuration:

- [ ] Set Site URL to `$ProductionUrl`.
- [ ] Add `$ProductionUrl/accept-invite` to Additional Redirect URLs.
- [ ] Add the staging URL only if it is a separate approved environment.
- [ ] Confirm the redirect URL uses HTTPS and the exact production hostname.

In Authentication → Providers → Email:

- [ ] Enable email/password authentication.
- [ ] Configure the approved production SMTP/email provider.
- [ ] Set the sender name and sender address.
- [ ] Send and receive a test email from the production domain.
- [ ] Confirm invite links land on `/accept-invite`.
- [ ] Confirm expired or invalid invite links show a safe error state.

## 3. Configure production secrets

Load these values from the approved secret manager into environment variables
for the current shell or deployment system. Do not paste them into source
files or command history.

```powershell
if (-not $env:PROD_WEBHOOK_SECRET) { throw "PROD_WEBHOOK_SECRET is missing" }
if (-not $env:PROD_ADMIN_INVITE_SECRET) { throw "PROD_ADMIN_INVITE_SECRET is missing" }

npx supabase secrets set --project-ref $ProjectRef `
  WEBHOOK_SECRET=$env:PROD_WEBHOOK_SECRET `
  ADMIN_INVITE_SECRET=$env:PROD_ADMIN_INVITE_SECRET `
  SITE_URL=$ProductionUrl `
  INVITE_REDIRECT_URL="$ProductionUrl/accept-invite"

npx supabase secrets list --project-ref $ProjectRef
```

- [ ] `WEBHOOK_SECRET` is unique to production and shared only with n8n.
- [ ] `ADMIN_INVITE_SECRET` is unique to production and shared only with operator tooling.
- [ ] `SITE_URL` and `INVITE_REDIRECT_URL` match production exactly.
- [ ] Service-role credentials are not present in browser environment variables.

## 4. Apply and verify database migrations

Review the migration plan before applying it. This includes the authenticated
table grants required for PostgREST to evaluate RLS policies.

```powershell
npx supabase db push --dry-run --linked
npx supabase db push --linked
```

- [ ] Dry-run output was reviewed by a second person.
- [ ] Migration `20260720000001_api_table_grants.sql` is included.
- [ ] No unexpected destructive operation appears in the output.
- [ ] Migration output is saved to the release record.

## 5. Verify RLS and tenant isolation

Run the executable local Postgres suite against a clean local database before
the production migration. It creates two users and two organizations and
checks cross-tenant reads and writes.

```powershell
npx supabase start
npx supabase db reset --local --no-seed --yes
npm.cmd run db:test
```

- [ ] RLS suite reports `11/11` tests successful.
- [ ] Staging has two separate test accounts in two separate organizations.
- [ ] Staging user A can see only organization A data.
- [ ] Staging user B can see only organization B data.
- [ ] Anonymous users cannot read organization or workflow data.
- [ ] Evidence includes the two test account IDs and the verification timestamp.

## 6. Deploy Edge Functions

Deploy only from the reviewed release commit.

```powershell
npx supabase functions deploy ingest-run --project-ref $ProjectRef
npx supabase functions deploy invite-client --project-ref $ProjectRef
npx supabase functions list --project-ref $ProjectRef
```

- [ ] `ingest-run` is deployed with JWT verification disabled as configured.
- [ ] `invite-client` is deployed with JWT verification disabled as configured.
- [ ] Both functions show the expected production version/deploy time.
- [ ] Function logs are visible to the on-call owner.

## 7. Configure PostHog and error reporting

In PostHog:

- [ ] Create or select the production project.
- [ ] Configure the production hostname and privacy settings.
- [ ] Record the browser project token and host in the hosting provider’s frontend environment configuration.
- [ ] Confirm analytics remains disabled until the user grants analytics consent.

In Sentry or the approved error-reporting provider:

- [ ] Create or select the production project.
- [ ] Configure the production DSN in the hosting provider’s frontend environment configuration.
- [ ] Set `VITE_SENTRY_ENVIRONMENT=production`.
- [ ] Set an intentional `VITE_SENTRY_TRACES_SAMPLE_RATE`.
- [ ] Confirm the error boundary reports a test exception without exposing secrets or email addresses.

The browser build variables are public by design. Never configure these with a
service-role key, webhook secret, admin invite secret, or n8n credential.

## 8. Build and deploy the application

Run the release gates locally or in CI for the exact `$ReleaseSha`:

```powershell
npm.cmd ci
npm.cmd run lint
npm.cmd run test -- --run
npm.cmd run build
```

- [ ] CI is green for `$ReleaseSha`.
- [ ] The hosting provider is configured with production `VITE_*` values.
- [ ] The deployed image uses `$ReleaseSha`, not an unpinned `latest` tag.
- [ ] The application loads over HTTPS.
- [ ] Route-level lazy-loaded chunks load successfully in the production browser.

## 9. Run the production smoke test

Use a fresh production test account. Do not use the first pilot customer for
the initial smoke test.

- [ ] Public landing page loads.
- [ ] Unauthenticated navigation to `/dashboard` redirects to `/login`.
- [ ] Test account login succeeds.
- [ ] A fresh operator invite reaches `/accept-invite`.
- [ ] Invite acceptance sets a password and reaches `/dashboard`.
- [ ] Dashboard renders service, metrics, workflow, and audit sections.
- [ ] A missing/empty organization shows a safe provisioning message.
- [ ] A Supabase/query failure shows a recoverable UI message.

## 10. Test webhook ingestion and metrics

Use a production test organization and a test workflow ID. Send the request
from the approved n8n or operator environment, not from browser code.

```powershell
$payload = @{
  event_id = "launch-smoke-$ReleaseSha"
  client_id = "test-client-uuid"
  feature_type = "custom_workflow"
  workflow_name = "Launch smoke test"
  status = "success"
  records_processed = 3
  records_failed = 0
  workflow_steps = @(
    @{ step_key = "smoke_test"; step_name = "Smoke test"; status = "success" }
  )
} | ConvertTo-Json -Depth 6

Invoke-RestMethod `
  -Method Post `
  -Uri "$ProductionUrl/functions/v1/ingest-run" `
  -Headers @{ "X-Webhook-Secret" = $env:PROD_WEBHOOK_SECRET } `
  -ContentType "application/json" `
  -Body $payload
```

- [ ] Valid event returns success and a `run_id`.
- [ ] Repeating the exact event does not create a second run.
- [ ] Invalid webhook secret returns `401`.
- [ ] Missing organization is rejected safely.
- [ ] A delayed/failing backend returns a bounded error rather than hanging.
- [ ] Dashboard metrics reflect the successful run.
- [ ] Recent activity and audit views show the expected event.

## 11. Test rollback before inviting customers

- [ ] Identify the previous known-good application image SHA.
- [ ] Identify the previous known-good Edge Function commit.
- [ ] Confirm the hosting provider can redeploy the previous image.
- [ ] Confirm the Edge Functions can be redeployed from the previous commit.
- [ ] Confirm the database rollback plan is a reviewed corrective migration; do not reset or manually delete production data.
- [ ] Perform the rollback rehearsal in staging.
- [ ] Verify login, dashboard, ingestion, and RLS after the rehearsal.
- [ ] Record the rollback duration and owner.

Example application rollback command, adapted to the hosting provider:

```powershell
# Replace this with the provider-specific deployment command.
$PreviousImage = "ghcr.io/vee8899/automation-platform:$PreviousImageSha"
Write-Host "Redeploy $PreviousImage and verify the smoke-test URLs"
```

## 12. Invite the first pilot customer

- [ ] Production smoke test is complete.
- [ ] RLS staging verification is complete.
- [ ] Rollback rehearsal is complete.
- [ ] Support contact and escalation path are ready.
- [ ] Pilot company, email, and approved services are confirmed.
- [ ] Invite is sent through the operator workflow, never by exposing `ADMIN_INVITE_SECRET` to the browser.
- [ ] Customer accepts the invite successfully.
- [ ] Customer sees only their organization’s data.
- [ ] First workflow event is observed and dashboard metrics update.
- [ ] Release owner records the first-customer timestamp and any issues.

## Go / no-go decision

Go only when every item in sections 1–12 is complete or explicitly waived by
the release owner with a written risk decision.

Stop the launch immediately if:

- any RLS or cross-tenant check fails;
- an invite can be accepted by the wrong account;
- a webhook can be replayed into duplicate runs;
- production points at the wrong Supabase project;
- secrets appear in browser bundles, logs, or workflow exports;
- the deployed commit cannot be identified or rolled back;
- errors are occurring without visible logs or an owner.

## Release record

- Release SHA:
- Previous known-good SHA/image:
- Production Supabase project ref:
- Migration versions applied:
- Edge Function deploy times:
- Frontend deploy URL:
- RLS test result:
- Smoke-test result:
- Rollback rehearsal result:
- First pilot customer invited at:
- Release owner:
- Reviewer:
- Open risks/follow-ups:
