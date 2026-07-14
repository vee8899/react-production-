# ADR: Authentication

## Context
The repository is a React + TypeScript client portal with Supabase integration.

## Decision
Use the patterns currently implemented in the repository and keep this decision aligned with the generated knowledge files.

## Rationale
This keeps the codebase navigable for humans and coding agents while preserving clear boundaries.

## Alternatives
A wholesale framework or state-layer replacement was not selected because it would expand scope without solving a current product need.

## Consequences
Future changes should update the implementation first, then run `npm run refresh-ai` and review the generated indexes.
