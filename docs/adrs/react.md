# ADR: React application composition

Status: current implementation documented retrospectively on 2026-09-05. The original decision date and deliberations are not recorded. The tradeoffs below are a present maintenance assessment, not invented historical evidence.

## Context

The public landing pages and client operations screens share navigation, styles, and browser dependencies.

## Current decision

- Use a React client application mounted from main.tsx, with providers composed at bootstrap.
- Define route-level screens in pages and reusable UI in components. Data hooks and domain helpers sit outside route JSX.
- Lazy-load route modules through App and provide Suspense loading and error-boundary handling. React StrictMode wraps the application during development.

## Rationale and alternatives

This composition permits shared UI and route-level bundling without a server-rendering runtime. The tradeoff is browser startup work and JavaScript-dependent page content. Server rendering or a full-stack framework could change those tradeoffs but is not part of the current implementation. Adding a new abstraction should solve a repeated boundary problem rather than reproduce the folder tree.

## Verification and references

Inspect [bootstrap](../../src/main.tsx), [route composition](../../src/App.tsx), [error boundary](../../src/components/ErrorBoundary.tsx), and [folder ADR](folders.md).
