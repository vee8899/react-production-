# ADR: Build, publication, and deployment

Status: current implementation documented retrospectively on 2026-09-05. The original decision date and deliberations are not recorded. The tradeoffs below are a present maintenance assessment, not invented historical evidence.

## Context

The repository builds a static Vite application and packages it in an nginx image. Hosting and live environment provisioning are not defined by this repository.

## Current decision

- Application CI runs npm installation, lint, unit tests, and build for PRs and main pushes.
- The current container workflow runs separately on main pushes or manual dispatch, builds the image, and publishes latest and commit-SHA tags using the production GitHub environment.
- Public Vite settings are build inputs; server-side credentials belong in their service's secret store. An nginx-served browser bundle cannot acquire new Vite values merely by changing container runtime environment variables.
- Operators select releases and apply database/function changes through documented procedures.

## Rationale and alternatives

A static container is portable and separates UI serving from Supabase. It requires independent verification of the linked database, function versions, and build-time public settings. Publication currently does not wait for application CI, and a published image is not evidence of a deployed healthy system. Verification-gated publication is approved planned work in phase 3, not implemented here.

## Verification and references

Inspect [application CI](../../.github/workflows/ci.yml), [container workflow](../../.github/workflows/docker.yml), [Dockerfile](../../Dockerfile), [deployment runbook](../runbooks/deployment.md), and [phase 3](../plans/reliability-hardening/phase-3-release-safeguards.md).
