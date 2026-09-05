# ADR: Browser routes and access gates

Status: current implementation documented retrospectively on 2026-09-05. The original decision date and deliberations are not recorded. The tradeoffs below are a present maintenance assessment, not invented historical evidence.

## Context

The same application serves public URLs, authenticated operations, and invite/consent transitions.

## Current decision

- BrowserRouter owns navigation; App declares routes and lazy-loaded pages.
- ProtectedRoute waits for authentication and redirects anonymous access to /login. Most protected routes also require the consent gate.
- Recent activity has list and detail URLs; legal documents are public, while consent/settings have their own protected transitions.
- Unknown paths redirect to the home route. The container's nginx configuration falls back to index.html for client-side navigation.

## Rationale and alternatives

Explicit routes make access wrappers and deep links reviewable. Server routing alone would require separate browser navigation wiring; file-based routing is not used. SPA fallback must be configured at any hosting provider, and a route wrapper does not replace endpoint/database authorization. Generated route matches do not determine which wrappers execute.

## Verification and references

Inspect [App](../../src/App.tsx), [bootstrap](../../src/main.tsx), [nginx fallback](../../nginx.conf), and [activity specification](../specs/workflow-activity.md).
