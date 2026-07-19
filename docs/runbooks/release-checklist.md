# Runbook: release checklist

Use this checklist for every staging or production release. Copy it into the release record or issue and keep the completed version with the release notes.

## Release information

- Release date:
- Environment: local / staging / production
- Commit SHA:
- Previous known-good commit or image SHA:
- Release owner:
- Reviewer:
- Migration versions included:

## Before release

- [ ] The working tree is clean.
- [ ] The changes are reviewed and the release scope is understood.
- [ ] CI is green for the exact commit being released.
- [ ] `npm.cmd run lint` passes.
- [ ] `npm.cmd run test -- --run` passes.
- [ ] `npm.cmd run build` passes.
- [ ] The target environment is confirmed in [`docs/environments.md`](../environments.md).
- [ ] Required secrets and Auth URLs are configured for that environment.
- [ ] Database migration output has been reviewed.
- [ ] A rollback image and corrective-migration plan are known.

## Database and functions

- [ ] `npm.cmd run db:check` was run against the intended target.
- [ ] `npm.cmd run db:dry-run` was reviewed.
- [ ] Migrations were applied in order.
- [ ] RLS and tenant ownership changes were reviewed.
- [ ] `ingest-run` was deployed from the release commit.
- [ ] `invite-client` was deployed from the release commit.

## Post-deployment verification

- [ ] The application loads from the expected environment.
- [ ] Login succeeds.
- [ ] Unauthenticated users are redirected from protected routes.
- [ ] A fresh invite reaches `/accept-invite` in the test environment.
- [ ] The dashboard loads client services and workflow activity.
- [ ] A valid workflow event is ingested.
- [ ] Repeating the event does not create a duplicate run.
- [ ] An invalid webhook secret returns `401`.
- [ ] Two test accounts cannot see each other’s organization data.
- [ ] Supabase, Edge Function, n8n, and application logs show no unexpected errors.

## Release decision

- [ ] Release accepted.
- [ ] Release stopped and rolled back.
- [ ] Follow-up issue created for every unresolved problem.

Notes:

## Rollback record

- Rollback required: yes / no
- Restored image or commit:
- Edge Function versions restored:
- Corrective migration applied:
- Incident or follow-up link:
