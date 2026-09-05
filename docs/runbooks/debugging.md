# Runbook: debugging

## Establish the failure

Use a local or staging environment with synthetic data. Record the revision, route or endpoint, user/organization fixture, expected behavior from the relevant specification, and actual result. Do not record passwords, bearer tokens, or raw customer payloads.

Reproduce with the smallest route, hook, or request that still fails. Inspect browser console/network failures and the matching Supabase or Edge Function log/request ID when available.

## Trace the responsible boundary

| Symptom | Start with |
| --- | --- |
| Session loading or redirect | [bootstrap](../../src/main.tsx), [auth hook](../../src/hooks/useAuth.ts), [routes](../../src/App.tsx), [consent gate](../../src/components/legal/LegalGate.tsx) |
| Missing or wrong tenant data | Relevant hook query/filter, then the deployed migration and RLS test |
| Missing run or ingestion error | [ingestion spec](../specs/automation-run-ingestion.md), handler response, and RPC transaction |
| Stale metrics or misleading empty state | Query errors, cache keys, and [known dashboard gaps](../specs/authenticated-client-dashboard.md) |
| Asset or deep-link failure | Build output, network response, and hosting SPA fallback |

Auth bootstrap begins before render but completes asynchronously. Do not assume the session request has resolved simply because the React root exists.

## Verify the correction

Add or update an observable regression test, rerun the smallest relevant suite, then run the applicable checks in [testing](testing.md). Repeat the original reproduction after the fix. A quiet console alone is not acceptance evidence.

If an approved specification and implementation disagree, determine whether this is a bug or an authorized contract change under [AGENT.md](../../AGENT.md). Fix factual documentation drift directly and record it. Pause only work dependent on an unresolved contract decision.

Finish with reproduction steps, cause, changed behavior, revision, commands/results, skipped checks, and remaining environment blockers.
