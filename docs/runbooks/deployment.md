# Runbook: deployment

## Required checks

```powershell
npm.cmd run lint
npm.cmd run test -- --run
npm.cmd run build
```

Do not deploy when these checks fail.

## Supabase deployment order

1. Confirm the target is staging or the approved production project.
2. Run `npm.cmd run db:check`.
3. Review `npm.cmd run db:dry-run` output.
4. Apply reviewed migrations.
5. Deploy `ingest-run`.
6. Deploy `invite-client`.
7. Confirm `WEBHOOK_SECRET`, `ADMIN_INVITE_SECRET`, `SITE_URL`, and `INVITE_REDIRECT_URL` are configured.

## Verification

- Open the application and complete login.
- Test invite acceptance with a fresh invite.
- Confirm the dashboard reads `workflow_runs`.
- Send one valid and one duplicate ingestion event.
- Confirm invalid webhook credentials return `401`.
- Confirm each test account sees only its own organization data.
- Review Edge Function logs for unexpected errors.

## n8n deployment

- Store the Supabase ingest URL and webhook secret in n8n credentials or variables.
- Do not export credentials, secrets, or client data in workflow JSON.
- Run one acceptance workflow after deployment.
- Verify success, failure, retry, and duplicate-event behavior.

## Rollback

Stop promotion if migrations, invitation, ingestion, or tenant-isolation checks fail. Preserve logs and revert through a reviewed migration or application deployment; do not manually delete production rows.

## Related

See `README.md`, `docs/adrs/deployment.md`, `docs/runbooks/database-migrations.md`, and `docs/architecture/canonical-workflow-runs.md`.
