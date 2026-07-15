# Prime State Systems — Future Product Roadmap

## Product direction

Build a reliable, observable automation platform that gives real-estate clients clear visibility into what their workflows are doing and gives operators safe control over failures, integrations, and onboarding.

## Strategic priorities

1. Prove production reliability.
2. Secure and observe external integrations.
3. Complete the canonical workflow-run transition.
4. Improve the client-facing value of the dashboard.
5. Build repeatable operator and onboarding workflows.
6. Expand into additional vertical automation modules.

## Success definition

The product is ready for repeatable client delivery when:

- A real n8n workflow can be deployed, monitored, retried, and audited.
- Duplicate and failed events do not corrupt client data.
- One client cannot access another client’s data.
- Operators can diagnose and replay failed work safely.
- Clients can understand the value and health of each automation.
- Deployments, backups, migrations, and restores have documented procedures.

---

## Phase 1 — Production proof

**Timeline:** Weeks 1–2  
**Priority:** P0  
**Goal:** Prove the current architecture works safely in staging.

### Tasks

- [ ] Deploy the current Supabase migrations to staging.
- [ ] Deploy the latest `ingest-run` Edge Function.
- [ ] Deploy the latest `invite-client` Edge Function.
- [ ] Run the canonical `workflow_runs` backfill in staging.
- [ ] Test invite acceptance from email through dashboard access.
- [ ] Test two-client tenant isolation.
- [ ] Test successful workflow ingestion.
- [ ] Test duplicate `event_id` ingestion.
- [ ] Test malformed payload rejection.
- [ ] Test failed workflow ingestion.
- [ ] Test workflow retry behavior.
- [ ] Record all staging results and unresolved issues.

### Exit criteria

- No cross-tenant data is visible.
- Duplicate events produce one canonical run.
- Failed ingestion returns a useful error and does not create partial records.
- Invite provisioning does not leave orphaned users or workspaces.

---

## Phase 2 — Real n8n workflow integration

**Timeline:** Weeks 2–4  
**Priority:** P0  
**Goal:** Prove one complete client workflow end to end.

### First workflow

Lead follow-up:

1. Receive a lead.
2. Validate required data.
3. Generate a stable `event_id`.
4. Deduplicate the source record.
5. Create or update the CRM record.
6. Send the approved follow-up.
7. Report success to Supabase.
8. Report failure and notify the operator when any step fails.

### Tasks

- [ ] Build the first production-shaped n8n workflow.
- [ ] Store credentials outside exported workflow JSON.
- [ ] Configure the Supabase ingest URL.
- [ ] Configure the webhook secret securely.
- [ ] Add explicit success and failure branches.
- [ ] Add retry handling for temporary provider failures.
- [ ] Add operator notification for terminal failure.
- [ ] Export a sanitized workflow JSON into `n8n/workflows/`.
- [ ] Run acceptance tests using realistic but non-production data.
- [ ] Document the workflow’s required inputs and outputs.

### Exit criteria

- One real workflow completes successfully.
- A failed step creates an error run.
- A retry updates the same `event_id` rather than creating duplicates.
- An operator can identify the failed step without reading n8n internals.

---

## Phase 3 — Integration security and observability

**Timeline:** Weeks 4–6  
**Priority:** P0  
**Goal:** Make external automation safe to operate continuously.

### Tasks

- [ ] Replace static webhook-only authentication with signed requests.
- [ ] Add request timestamp validation and replay protection.
- [ ] Add request-size limits.
- [ ] Add rate limiting at the Edge Function or gateway layer.
- [ ] Add structured ingestion logs with correlation IDs.
- [ ] Add alerts for repeated ingestion failures.
- [ ] Add alerts for stale workflows and disconnected integrations.
- [ ] Add a dead-letter or failed-event review process.
- [ ] Add dashboards for success rate, failure rate, latency, and retries.
- [ ] Document secret rotation procedures.

### Exit criteria

- Webhook credentials can be rotated without redesigning workflows.
- Replayed or stale requests are rejected.
- Operators are alerted before clients report an outage.
- Every run can be traced from n8n to Supabase and back.

---

## Phase 4 — Canonical data-model cleanup

**Timeline:** Weeks 6–8  
**Priority:** P1  
**Goal:** Finish the transition to `workflow_runs`.

### Tasks

- [ ] Search all application and workflow consumers for `automation_runs`.
- [ ] Confirm all frontend reads use `workflow_runs`.
- [ ] Confirm all historical rows have a `workflow_run_id`.
- [ ] Confirm external integrations no longer read `automation_runs`.
- [ ] Remove compatibility-only code from documentation and tests.
- [ ] Stop dual-writing to `automation_runs`.
- [ ] Monitor staging after the compatibility write is removed.
- [ ] Remove the legacy table in a separately reviewed migration.
- [ ] Regenerate Supabase types from the deployed schema.

### Exit criteria

- `workflow_runs` is the only run source used by the product.
- `automation_runs` has no active consumers.
- The legacy table can be removed without data loss.

---

## Phase 5 — Operator control center

**Timeline:** Weeks 8–12  
**Priority:** P1  
**Goal:** Give operators safe tools to manage the platform.

### Tasks

- [ ] Build an operator organization list.
- [ ] Add client onboarding status and ownership views.
- [ ] Add workflow health and last-run status.
- [ ] Add audit-log visibility.
- [ ] Add failed-run inspection.
- [ ] Add safe event replay controls.
- [ ] Add service enablement and pause controls.
- [ ] Add integration connection-health views.
- [ ] Add operator notes and support history.
- [ ] Add role-based operator permissions.

### Exit criteria

- An operator can diagnose common failures without database access.
- Failed events can be replayed safely.
- Client onboarding status is visible in one place.

---

## Phase 6 — Client dashboard value

**Timeline:** Months 3–4  
**Priority:** P1  
**Goal:** Show clients the business value of their automations.

### Tasks

- [ ] Add service-specific dashboard cards.
- [ ] Show records processed and records failed by service.
- [ ] Show workflow health and recent incidents.
- [ ] Explain failures in client-friendly language.
- [ ] Show recent workflow activity by business object.
- [ ] Add integration connection status.
- [ ] Add notification preferences.
- [ ] Add client-facing reports or weekly summaries.
- [ ] Add empty, degraded, paused, and disconnected states.
- [ ] Measure dashboard engagement and feature usage.

### Exit criteria

- Clients can answer “what ran?”, “what changed?”, and “did anything fail?”
- The dashboard communicates value without exposing implementation details.
- Service visibility matches the client’s actual subscription.

---

## Phase 7 — Commercial and vertical expansion

**Timeline:** Months 4–6  
**Priority:** P2  
**Goal:** Expand the platform after reliability is proven.

### Tasks

- [ ] Define the next vertical module based on customer demand.
- [ ] Add module-specific entities without weakening core tenancy rules.
- [ ] Add reusable integration adapters.
- [ ] Add usage and cost reporting.
- [ ] Define service-level targets.
- [ ] Add subscription and plan enforcement.
- [ ] Improve multi-user organization roles.
- [ ] Add onboarding templates by vertical.
- [ ] Create a repeatable client launch checklist.
- [ ] Create a repeatable workflow acceptance checklist.

### Exit criteria

- A new client can be launched using a documented process.
- A new vertical can reuse the core workflow, audit, and notification model.
- Pricing, usage, and service entitlements are enforceable in the product.

---

## Operating cadence

### Weekly

- [ ] Review failed runs and unresolved incidents.
- [ ] Review staging and production error rates.
- [ ] Review roadmap progress and blockers.
- [ ] Capture customer feedback and requested automations.

### Monthly

- [ ] Test backup restoration.
- [ ] Review secrets and access permissions.
- [ ] Review dependency and infrastructure updates.
- [ ] Review service usage and delivery margin.
- [ ] Reprioritize the next month’s work.

### Quarterly

- [ ] Review the canonical schema and remove obsolete compatibility code.
- [ ] Review tenant-isolation assumptions.
- [ ] Review disaster-recovery readiness.
- [ ] Review product-market fit by service and vertical.

## Priority rule

Do not add another major vertical or large feature until:

- one real workflow is proven end to end;
- failures and retries are observable;
- tenant isolation has been tested;
- backup restoration has been verified;
- operators can diagnose and replay failures safely.
