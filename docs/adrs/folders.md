# ADR: Repository boundaries

Status: current implementation documented retrospectively on 2026-09-05. The original decision date and deliberations are not recorded. The tradeoffs below are a present maintenance assessment, not invented historical evidence.

## Context

The repository contains browser UI, database migrations and HTTP handlers, automation exports, coding-agent tooling, and authored documentation.

## Current decision

- Keep route screens in src/pages, shared UI in src/components, data access in src/hooks and src/api, and domain behavior in src/lib.
- Keep trusted database/function behavior under supabase and external workflow exports under n8n. The agents library is a separate Node compiler project.
- Keep authored specs, decisions, runbooks, plans, and evidence in docs. Generated navigation belongs in docs/knowledge-base and outputs/repo-index.

## Rationale and alternatives

The separation makes privileged code and operational artifacts easier to locate during review. A single feature-directory layout could colocate more files but would change established navigation and import boundaries. Avoid a repository-wide move without a concrete maintenance need; folders do not enforce security by themselves.

## Verification and references

Inspect [documentation authority](../README.md#authority-and-status), [repository change contract](../../AGENT.md), and [package commands](../../package.json).
