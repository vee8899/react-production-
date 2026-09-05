# ADR: Browser and trusted API boundaries

Status: current implementation documented retrospectively on 2026-09-05. The original decision date and deliberations are not recorded. The tradeoffs below are a present maintenance assessment, not invented historical evidence.

## Context

The portal reads Supabase data directly, while ingestion and provisioning need privileges that must never reach browser code.

## Current decision

- Use the typed Supabase browser client through hooks and domain helpers for portal data access. RLS remains the database authorization boundary.
- ingest-run validates the webhook secret and payload before calling the service-role ingestion RPC; invite-client uses an administrator invite secret.
- demo-event and configure-alert-route authenticate bearer tokens and perform endpoint-specific organization checks before privileged writes.
- Do not infer that every Edge Function is browser-accessible or that being signed in authorizes every operation.

## Rationale and alternatives

Direct Supabase access avoids a redundant proxy for ordinary tenant reads. Privileged operations stay in narrow server handlers. A separate API server would centralize transport but add deployment and credential management. Endpoint authorization and errors need executable tests; browser CORS support for the two bearer endpoints is still planned in phase 2. The storage module is currently a placeholder, not a file-upload API.

## Verification and references

Inspect [browser client](../../src/api/supabase/client.ts), [Edge Functions](../../supabase/functions/), [ingestion spec](../specs/automation-run-ingestion.md), [invitation spec](../specs/client-invitation.md), and [environment settings](../environments.md).
