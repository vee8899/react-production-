# Runbook: feature development

## Before editing

Read [AGENT.md](../../AGENT.md), the relevant source/tests, and the closest authored specification or ADR. Capture the starting revision and working tree; preserve unrelated changes.

State the intended behavior and acceptance scenarios. A specification defines what should happen independently of current tests. Record an already-authorized change and update its spec with implementation; escalate only unresolved product, security, compatibility, or operational decisions.

## Implement and verify

1. Change the smallest responsible boundary; keep privileged operations on the server.
2. Add or update tests for observable behavior, including relevant loading, empty, error, and tenant cases.
3. Run the commands appropriate to the change in [testing](testing.md). SQL changes also require the [migration and database checks](database-migrations.md).
4. Update affected authored specs, ADRs, and runbooks. Mark planned behavior and unverified gaps explicitly.
5. After implementation changes, run the generated-navigation refresh:

```powershell
npm.cmd run refresh-ai
```

Success means both generation commands finish and the diff contains expected navigation/index updates. Inspect it; generation does not validate the behavior it indexes and must not overwrite authored documents.

## Finish

Record changed behavior, revision, commands and results, skipped checks with reasons, and remaining ownership. Follow the [PR template](../../.github/pull_request_template.md). For documentation-only work, verify links, commands, and claims; do not manufacture runtime evidence by copying old passing results.
