# Runbook: deployment

This runbook describes the current controlled deployment process. It is intentionally provider-neutral: the repository can build a container, but the hosting provider and production deployment credentials are not defined here.

Do not treat a green GitHub Actions run as proof that production is healthy. CI proves that the repository builds and tests; the release checklist proves that the deployed system works.

## Before deployment

1. Confirm the target environment in [`docs/environments.md`](../environments.md).
2. Confirm the release commit and review the changes since the previous release.
3. Confirm the required secrets are configured without copying their values into the repository.
4. Confirm CI is green for the exact commit being released.
5. Complete [`release-checklist.md`](release-checklist.md).

Never deploy directly from an uncommitted working tree.

## Application checks

Run these from the repository root:

```powershell
npm.cmd run lint
npm.cmd run test -- --run
npm.cmd run build
```

Do not promote the release if any check fails.

## Supabase deployment order

1. Confirm the target is local, staging, or the approved production project.
2. Run `npm.cmd run db:check` against the intended non-production or approved target.
3. Review `npm.cmd run db:dry-run` output.
4. Check whether the migration changes RLS, tenant ownership, canonical `workflow_runs`, or compatibility data.
5. Apply the reviewed migration through the approved Supabase process.
6. Deploy `ingest-run`.
7. Deploy `invite-client`.
8. Confirm `WEBHOOK_SECRET`, `ADMIN_INVITE_SECRET`, `SITE_URL`, and `INVITE_REDIRECT_URL` are configured.

Production migrations must be forward-compatible with the currently running application. Use a separate cleanup migration for destructive changes after all consumers have moved to the new behavior.

## Application and container deployment

The Docker workflow publishes these image tags for a commit on `main`:

- `ghcr.io/vee8899/automation-platform:latest`
- `ghcr.io/vee8899/automation-platform:<commit-sha>`

Prefer the SHA tag when selecting or rolling back a release. Configure the hosting provider to deploy only an image that passed CI and to inject runtime secrets through its secret store.

## Verification after deployment

- Open the application and confirm the expected environment is displayed or otherwise identifiable.
- Complete login with a test account.
- Confirm a protected route redirects unauthenticated users to `/login`.
- Test invite acceptance with a fresh test invite in staging or with an approved production test account.
- Confirm the dashboard reads canonical `workflow_runs` data.
- Send one valid ingestion event and one duplicate event.
- Confirm invalid webhook credentials return `401`.
- Confirm two test accounts can see their own organization data and not each other’s data.
- Review application, Supabase, Edge Function, and n8n logs.
- Record the release commit, migration version, verification result, and any follow-up issue.

## Stop conditions

Stop the release if any of these occur:

- A migration has unexpected destructive or cross-tenant effects.
- Login, invitation, ingestion, or RLS checks fail.
- Edge Function logs show repeated errors.
- The deployed image does not match the reviewed commit.
- The release cannot be rolled back to a known image or migration state.

## Rollback

1. Stop further promotion and record the failure.
2. Route the application back to the previous known-good image SHA.
3. If an Edge Function is involved, redeploy its previous known-good version.
4. Do not manually delete production rows to undo a migration.
5. Use a reviewed corrective migration when database state must be repaired.
6. Preserve logs, request IDs, event IDs, and migration output.
7. Create a follow-up issue describing the failure and the prevention work.

## Related

See [`README.md`](../../README.md), [`environments.md`](../environments.md), [`release-checklist.md`](release-checklist.md), [`database-migrations.md`](database-migrations.md), [`docs/adrs/deployment.md`](../adrs/deployment.md), and [`docs/architecture/canonical-workflow-runs.md`](../architecture/canonical-workflow-runs.md).
