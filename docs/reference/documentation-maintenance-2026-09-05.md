# Documentation maintenance evidence: 2026-09-05

## Identity and scope

- Author/verifier: Codex, following the user's instruction to implement the documentation assessment.
- Base commit: `4be66356387c1709d0fd1b66df5a153bfb20c864`.
- Tested state: uncommitted documentation and repository-generation changes on that base, including the existing phase documents from the preceding documentation task. No new commit or release was created.
- Environment: local Windows workspace. No database, staging, production, or GitHub publishing operation was performed.

## Changes and decisions

Defined separate authority for implementation, requirements, decisions, procedures, plans, and evidence. Corrected factual drift without treating it as a request to change product behavior. Recorded the user's authorization to narrow the blanket documentation-conflict pause rule to unresolved contract decisions.

Replaced generic ADRs, specs, and runbooks with source-backed guidance; labeled reconstructed rationale and historical observations; clarified that local database inventory checks do not verify deployed schema. Removed credentials from an old audit heading without attempting to use or validate them. Centralized reliability status in its overview while retaining historical handoffs.

Changed generated knowledge to navigation based on approximate text matches with authored links for interpretation. Legacy generated locations now redirect to the current navigation. The route index preserves the `protected` key with `null` to mean not evaluated, instead of a guessed boolean; consumers must not interpret it as an authorization decision. No repository consumer of that boolean was found in the source search. Added `scanMethod` metadata to the JSON indexes without changing their `records` container.

## Local verification

| Check | Result and limit |
| --- | --- |
| `npm.cmd run lint` | Passed for the changed repository state |
| `npm.cmd run test -- --run` | Passed: 112 tests in 26 files, including the new generator regression |
| `npm.cmd run build` | Passed: referenced TypeScript projects and production bundling |
| `npm.cmd run refresh-ai` | Passed: regenerated knowledge and repository indexes from the updated generator |
| Changed Markdown link/anchor and npm-script validation | Passed using a PowerShell scan against existing paths/headings and `package.json`; web destinations were not checked |
| `git diff --check` | Passed for tracked changes; new authored/tooling files were separately checked for whitespace |

The generator regression uses a disposable filesystem fixture: it discovers provider candidates, removes candidates after source changes, preserves an authored ADR, maintains the legacy redirect, and produces stable content when rerun. It does not prove complete semantic discovery; scanner limitations remain documented.

Detailed command output is in the documentation-maintenance conversation. There is no separate deployed-environment report. Counts from the earlier phase-document delivery describe that earlier state, not this change.

## Remaining work and ownership

All three runtime-hardening phases remain Not started in the [current tracker](../plans/reliability-hardening/README.md#phase-tracker). Documentation updates have not enabled strict mode, repaired ingestion, added CORS, changed dashboard behavior, or gated publication.

Database, endpoint, browser E2E, live GitHub, and staging acceptance were skipped because this task changed documentation and local generation tooling, not those runtime boundaries. No remote-readiness claim is made. The next implementation owner is unassigned; their next action is the [phase-1 handoff](../plans/reliability-hardening/phase-1-ingestion-safety.md#session-handoff).
