# ADR: Supabase authentication and portal gates

Status: current implementation documented retrospectively on 2026-09-05. The original decision date and deliberations are not recorded. The tradeoffs below are a present maintenance assessment, not invented historical evidence.

## Context

The public site and authenticated portal share one browser application. Portal authorization also depends on database ownership and consent state.

## Current decision

- Supabase owns authentication. Bootstrap requests the existing session and subscribes to subsequent auth changes; Zustand holds the session and loading state.
- Rendering starts while the session request is pending. App and route loading gates wait for resolution; bootstrap is not an awaited prerequisite to calling createRoot.
- ProtectedRoute redirects anonymous users to /login and normally applies LegalGate. Consent routes bypass the consent gate so users can complete it.
- Database RLS and endpoint authorization enforce data access independently of route visibility.

## Rationale and alternatives

Using Supabase avoids implementing a separate password/session service. Keeping route gates in React makes navigation explicit but cannot prevent direct API calls. A custom auth backend would add operational work. Any change to session transitions still needs observable tests; this ADR is not proof that every race or sign-out failure is handled.

## Verification and references

Inspect [bootstrap](../../src/main.tsx), [auth store](../../src/store/authStore.ts), [auth hook](../../src/hooks/useAuth.ts), [routes](../../src/App.tsx), [consent gate](../../src/components/legal/LegalGate.tsx), and [RLS testing](../runbooks/rls-testing.md).
