# Project documentation

This directory contains the documentation that should be read and maintained by the team. Start with the root [`README.md`](../README.md) for setup and the short project overview.

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

If a runbook is missing a decision, prerequisite, verification step, or rollback path, update it when you discover the gap.

## ADRs

The ADRs in [`adrs/`](adrs/) record the current approach to React, TypeScript, routing, authentication, state, APIs, database access, styling, folder organization, and deployment. They should explain the choice and its consequences, not merely repeat the directory structure.

## Generated knowledge

The sibling [`knowledge/`](../knowledge/) directory is generated from the implementation by `npm.cmd run ingest` and `npm.cmd run index`. It is useful for navigation and coding-agent context, but it is not the authoritative documentation and should not be edited by hand.

When implementation changes, update authored docs in this directory if behavior or operational guidance changed, then refresh generated knowledge and review the diff.
