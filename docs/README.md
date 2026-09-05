# Project documentation

This directory contains the documentation that should be read and maintained by the team. Start with the root [`README.md`](../README.md) for setup and the short project overview.

For every codebase change, follow [`AGENT.md`](../AGENT.md) as the repository-wide
change-control contract. Record intended behavior, verification evidence, factual corrections,
and the authorization for deliberate behavior changes. Escalate unresolved contract decisions;
routine drift corrections and already-authorized work do not need another approval.

## Authority and status

| Source | Authoritative about | Does not establish |
| --- | --- | --- |
| Code and migrations | Implemented behavior and schema definitions | That the behavior meets requirements or is deployed |
| Specs | Required observable behavior and acceptance criteria | That every requirement is implemented or verified |
| Architecture and ADRs | System boundaries, accepted choices, and tradeoffs | Historical reasoning unless a decision record supports it |
| Runbooks | Preconditions, operational steps, expected results, and recovery | A successful execution without dated evidence |
| Plans and roadmap | Proposed or approved work still to be done | Current features, delivery dates, or release readiness |
| Evidence and historical records | Results for a stated revision, environment, and time | The current state of another revision or environment |
| Generated knowledge and indexes | Approximate source-text matches and navigation links | Authorization, runtime behavior, complete discovery, or correctness |

Mark proposed features as proposed and record known implementation gaps beside required behavior. Reconstructed ADRs must say when they were documented and distinguish today's maintenance rationale from an unrecorded original decision. Evidence must name its tested revision, environment, date, command, and outcome; use "not recorded" when that information is unavailable.

Keep one current status tracker per plan. Phase documents own acceptance criteria; dated handoffs preserve session evidence. Do not duplicate live status across all three. Checklists describe required work until an evidence-backed result is explicitly recorded.

## Choose a document by the question you have

| Question | Location |
| --- | --- |
| How do I run, test, lint, build, debug, or deploy the project? | [`runbooks/`](runbooks/) |
| How is the system structured? | [`architecture/`](architecture/) |
| What behavior should a feature have? | [`specs/`](specs/) |
| Why was a technical choice made? | [`adrs/`](adrs/) |
| Which environment or secret should be used? | [`environments.md`](environments.md) |
| What should happen before a release? | [`runbooks/release-checklist.md`](runbooks/release-checklist.md) |
| How should local/staging MCP and browser checks be used? | [`mcp-operations.md`](mcp-operations.md) |
| What is planned for the product? | [`future-product-roadmap.md`](future-product-roadmap.md) |
| How will the reliability fixes be implemented across sessions? | [Reliability hardening phases](plans/reliability-hardening/README.md) |
| Which old notes are historical rather than current guidance? | [Reference records](reference/README.md) |

## Architecture

- [`platform-core-and-vertical-modules.md`](architecture/platform-core-and-vertical-modules.md) explains the platform and vertical-module boundary.
- [`canonical-workflow-runs.md`](architecture/canonical-workflow-runs.md) explains the canonical workflow execution model and compatibility table.

## Feature specifications

- [`public-landing-experience.md`](specs/public-landing-experience.md)
- [`authenticated-client-dashboard.md`](specs/authenticated-client-dashboard.md)
- [`workflow-activity.md`](specs/workflow-activity.md)
- [`workflow-health-dashboard.md`](specs/workflow-health-dashboard.md)
- [`automation-run-ingestion.md`](specs/automation-run-ingestion.md)
- [`client-invitation.md`](specs/client-invitation.md)

## Runbooks

The most commonly used runbooks are:

- [`local-development.md`](runbooks/local-development.md)
- [`testing.md`](runbooks/testing.md)
- [`database-migrations.md`](runbooks/database-migrations.md)
- [`deployment.md`](runbooks/deployment.md)
- [`debugging.md`](runbooks/debugging.md)

Each runbook should identify prerequisites, target environment, commands or actions, expected results, failure handling, and the limits of its verification. Correct factual gaps when discovered. Record already-authorized changes, and raise unresolved contract decisions under the change-control contract. Link to a canonical procedure rather than copying it into another runbook.

## ADRs

The ADRs in [`adrs/`](adrs/) record the current approach to React, TypeScript, routing, authentication, state, APIs, database access, styling, folder organization, and deployment. They should explain the choice and its consequences, not merely repeat the directory structure.

## Generated knowledge

The [`knowledge-base/`](knowledge-base/) directory is generated by `npm.cmd run ingest`; [`../outputs/repo-index/`](../outputs/repo-index/) contains the generated JSON index from `npm.cmd run index`. Legacy pages in `generated/` are generator-maintained redirects. Do not edit generated files by hand.

The scanner uses text patterns, not semantic or runtime analysis. Matches can include comments and examples and can miss aliases or dynamic behavior. The route index's `protected` value is `null` (not evaluated); inspect route guards and database policy tests for access rules. Generated files link to authored guidance for interpretation instead of making hard-coded claims about detected features or security.

When implementation changes, update authored docs in this directory if behavior or operational guidance changed, then refresh generated knowledge and review the diff.
