# Runbook: rollback rehearsal

Use staging to rehearse rollback before inviting production customers.

## Inputs

- Release SHA being tested.
- Previous known-good application image SHA.
- Previous known-good Edge Function commit or deploy version.
- Corrective-migration plan for any database issue.
- Rollback owner and release owner.

## Procedure

1. Deploy the release candidate to staging.
2. Run staging browser, invite, and ingestion acceptance checks.
3. Redeploy the previous known-good application image in staging.
4. Redeploy previous known-good Edge Functions if functions changed.
5. Apply only a reviewed corrective migration if database state must be
   repaired. Do not reset or manually delete staging data as the rehearsal.
6. Re-run login, dashboard, ingestion, invite, and RLS checks.
7. Record rollback duration, owner, restored versions, and remaining risks.

## Evidence

Record the starting release SHA, restored image SHA, restored Edge Function
versions, migration decision, smoke-test result, RLS result, logs/request IDs,
rollback duration, owner, and timestamp.
