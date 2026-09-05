# Reliability hardening: implementation phases

Status: planned work. Created 2026-09-05 from the codebase review and the user's approved phase design. No implementation phase has started as part of creating these documents.

Use this folder to carry the work across three focused sessions. A phase may take more than one session; its acceptance evidence, not elapsed time, determines completion. Follow the repository's [change contract](../../../AGENT.md).

## Agreed decisions

- Preserve the application architecture and globally unique event IDs.
- Reject event-ID ownership collisions while retaining valid same-owner replay.
- Use analytics snapshots only after a successful canonical run query returns no rows. Query failures must remain visible.
- Keep automatic container publishing from `main`, gated by verification of that exact commit.
- Keep staging acceptance manually triggered and separate from automatic publishing.
- Treat production deployment, environment provisioning, and secret configuration as separate operational work.

These are intended changes, not claims about current behavior. Existing specifications and runbooks remain in place until their corresponding implementation phase updates them. The approved change to unrestricted event replay is ownership-preserving replay; record this decision in the ingestion specification during phase 1. If additional documentation conflicts arise, record them under the change contract before changing either source.

## Phase tracker

| Phase | Dependency | Local status | Staging verification | Live GitHub evidence | Owner / latest handoff |
| --- | --- | --- | --- | --- | --- |
| [1. Ingestion safety](phase-1-ingestion-safety.md) | Review baseline | Not started | Not run | Not applicable | Unassigned / initial handoff in phase document |
| [2. Application reliability](phase-2-application-reliability.md) | Phase 1 verified locally | Not started | Not run | Not applicable | Unassigned / initial handoff in phase document |
| [3. Release safeguards](phase-3-release-safeguards.md) | Phases 1 and 2 verified locally | Not started | Not run | Not run | Unassigned / initial handoff in phase document |

Local status must be one of:

- **Not started:** no implementation work has begun.
- **In progress:** implementation or required local verification is underway.
- **Blocked:** a required dependency, decision, or executable check is unavailable or failing and prevents completion; describe the blocker and next action.
- **Verified locally:** every local exit criterion in the phase document has supporting evidence.

Record staging and live GitHub checks independently as Not run, Blocked, Failed, or Passed, with an evidence reference. A skipped check is not a pass. Local completion does not establish staging readiness, a successful published image, or production readiness. Continue to use the [release checklist](../../runbooks/release-checklist.md) and [production launch checklist](../../runbooks/production-launch-checklist.md) for releases.

## Review baseline, not phase acceptance

The initial review on 2026-09-05 observed a clean working tree and ran:

| Check | Observed result |
| --- | --- |
| `npm.cmd run lint` | Passed |
| `npm.cmd run test -- --run` | Passed: 111 tests across 25 files |
| `npm.cmd run build` | Passed |
| Independent compiler checks using `--strict --noEmit --incremental false --pretty false` | Passed for the app, node/scripts, and agents projects; strict mode was not enabled in their saved configurations |

Evidence is the command output in the review conversation. No exact baseline commit SHA or standalone evidence artifact was recorded. Capture the implementation starting SHA at the beginning of each phase; do not retroactively attribute these baseline results to another revision.

Live database, staging, and n8n acceptance checks were not run in that review. The baseline does not prove that any planned fix works and must not be used to check off implementation acceptance.

## Finding coverage and boundaries

| Review finding | Owning phase |
| --- | --- |
| Global event-ID collision can change run ownership | Phase 1 |
| Metrics query failures can appear as zero activity | Phase 2 |
| Browser endpoints lack CORS preflight handling | Phase 2 |
| Database and endpoint guarantees are not enforced by CI | Phase 3, using tests delivered in phases 1 and 2 |
| Container publishing runs independently of verification | Phase 3 |
| Strict TypeScript is disabled | Phase 2 |
| Several architecture decision records contain generic reasoning | Phase 2; ingestion and release guidance updated in their owning phases |

Each phase includes its tests and closest authored documentation updates. Do not defer all testing or documentation to phase 3. Framework replacement, metric redesign, legacy-table retirement, unrelated product features, and production rollout are outside this work.

After implementation changes, run `npm.cmd run refresh-ai` and review the generated diff as required by the change contract. Creating this planning documentation alone does not require regenerating knowledge or modifying application code, migrations, or workflows.

## Session procedure and handoff

At session start, read the relevant phase document, its linked source and authored guidance, and the previous handoff. Inspect `git status --short` and `git rev-parse HEAD`; preserve unrelated changes. This overview is the single current-status tracker: update its owner, status, evidence, and latest-handoff reference here. Phase documents own acceptance criteria and dated handoffs, not a second live status summary.

At session end, append a dated handoff under the phase's Session handoff section using this template. Keep earlier records so another session can distinguish historical evidence from the latest state.

```text
Date / owner:
Phase / local status:
Starting commit SHA:
Result commit SHA, or uncommitted file list and working-tree state:
Completed work:
Remaining work:
Commands, exit codes, results, and environment:
Evidence locations, tested SHA or uncommitted state, and timestamps:
Skipped checks and reasons:
Failures / blockers:
Documentation conflicts and recorded decisions:
Staging verification / live GitHub evidence:
Follow-up owner:
Exact next action:
```

Use durable sanitized report references where available. Do not store secrets, access tokens, customer data, or raw authenticated browser storage in these documents or committed artifacts. If evidence contains sensitive data, record a restricted evidence reference and a sanitized result instead.

## Documentation acceptance

- [x] Relative links and referenced commands resolve against the current repository.
- [x] Every review finding has an owning phase.
- [x] Each phase has prerequisites, executable acceptance criteria, and a usable handoff.
- [x] Phase dependencies and exit conditions agree with this tracker.
- [x] Baseline results, implementation status, staging evidence, and release readiness are distinct.
- [x] The documentation-only diff contains no application, migration, workflow, or generated-knowledge changes.

These documentation checks can be completed when the planning documents are verified. They do not advance any implementation phase.

Historical verification of the initial documentation delivery, 2026-09-05:

- Author/verifier: Codex. Base commit: `4be66356387c1709d0fd1b66df5a153bfb20c864`.
- Working-tree result: four new planning documents and one link added to the documentation index; changes are uncommitted.
- PowerShell link/script validation passed for all five documents: 89 relative links resolved and 28 npm script references matched `package.json`.
- Structural validation passed: all three phase documents contain the six required sections, start at Not started, and have no completed implementation checkboxes. Code fences and trailing whitespace were checked in all four planning documents.
- `git diff --check` passed for the tracked documentation-index change; new documents were included in the separate whitespace validation. Finding coverage, dependencies, and status distinctions were reviewed against the approved plan.
- Evidence: validation command output in the documentation implementation conversation; no standalone runtime report was generated.
- Skipped checks: application tests/build, database tests, endpoint tests, live GitHub, staging, and generated-knowledge refresh were not run because this change only adds authored planning documentation.
- No unresolved documentation decision was identified. All implementation phases remain Not started; the next implementation action is the initial phase-1 handoff above.

Documentation maintenance note, 2026-09-05: the subsequent documentation-semantics pass clarified authority, corrected factual drift, and rewrote placeholder ADRs/runbooks. It also improved generated navigation. These are supporting documentation/tooling changes, not execution of the three runtime-hardening phases. The initial delivery counts above apply only to that earlier working-tree state. The current tracker remains unchanged, and phase 2 now asks the implementer to review/update the rewritten ADRs when runtime behavior changes.
