# Workflow Health Dashboard

## Purpose

Workflow health should give clients a fast answer to three questions:

1. Are my workflows running?
2. Are they completing successfully?
3. Which workflow needs attention?

Health should be calculated from workflow activity rather than maintained as a manually updated status field.

## Source of truth

`public.workflow_runs` remains the canonical execution history.

The dashboard should combine:

- `public.workflows` for configuration and activation state.
- `public.workflow_runs` for execution history.
- `public.workflow_steps` for step-level failures and duration.
- `workflow_run_entities` for affected records.

The legacy `automation_runs` table remains a compatibility projection and should not drive the new health dashboard.

## Health states

Each workflow should resolve to one of these states:

| State | Meaning |
| --- | --- |
| Healthy | Active workflow with recent successful runs and normal performance. |
| Degraded | Workflow is running, but has elevated failures, retries, partial runs, or latency. |
| Failing | The latest run failed or the recent failure rate is materially high. |
| Stale | No successful run within the expected execution window. |
| Never run | Workflow is active but has no execution history. |
| Paused | Workflow is intentionally inactive. |

Health state should be derived in this order:

1. `Paused` when `workflows.is_active = false`.
2. `Never run` when no run exists.
3. `Failing` when the latest run is `error` or the recent failure rate is above the failure threshold.
4. `Stale` when the workflow has exceeded its expected execution window without a successful run.
5. `Degraded` when retries, partial runs, elevated duration, or a moderate failure rate are present.
6. `Healthy` otherwise.

## Health metrics

For each workflow, calculate over a recent window such as the last 30 runs or last 30 days:

- Latest run status
- Last successful run timestamp
- Failure rate
- Partial-run rate
- Retry count
- Average duration
- Latest duration
- Records processed
- Records failed
- Time since last successful run
- Most recent error message
- Number of affected entities

The workflow configuration should eventually include an expected cadence, for example:

```text
expected_interval_minutes
```

Until cadence is available, stale detection can use a conservative default or be omitted for event-triggered workflows.

## Initial thresholds

The first version can use simple thresholds:

- Healthy: failure rate below 10%, no recent error, and normal duration.
- Degraded: failure rate from 10% to 30%, recent retries, partial runs, or duration more than twice the baseline.
- Failing: latest run failed or failure rate above 30%.
- Stale: no successful run inside the expected cadence window.

Thresholds should eventually be configurable per workflow because a real-time webhook and a nightly report have different expectations.

## Dashboard experience

### Overall summary

The dashboard should show a compact health summary near the top:

- Healthy workflow count
- Workflows needing attention
- Failing workflow count
- Overall success rate
- Most recent platform activity

Example:

```text
7 Healthy    1 Needs attention    0 Failing
92% success rate    Last activity 4 minutes ago
```

### Workflow list

Each workflow row should show:

- Workflow name
- Associated UI service
- Health indicator
- Last run time
- Success rate
- Latest duration
- Records processed
- Clear attention state when action is required

Example:

| Workflow | Service | Health | Last run | Success rate | Duration | Records |
| --- | --- | --- | --- | ---: | ---: | ---: |
| Lead enrichment assistant | Agentic Operations | Healthy | 3 min ago | 98% | 2.1s | 6 |
| Listing notification | Notifications | Degraded | 1 day ago | 72% | 4.1s | 11 |
| CRM synchronization | System Integrations | Never run | Never | — | — | 0 |

### Workflow detail view

Selecting a workflow should open:

- Current health state and explanation
- Run timeline
- Successful, partial, and failed runs
- Step-level duration and errors
- Retry history
- Records affected
- Last successful run
- Recommended next action

The explanation should be human-readable, such as:

> Degraded because 3 of the last 10 runs required retries and the latest run took 2.4 times longer than its baseline.

## Service health versus workflow health

These should remain separate concepts.

A service can contain several workflows. For example, `System Integrations` may be healthy overall while one CRM synchronization workflow is failing.

Service health should aggregate the workflows assigned to that service, but the workflow remains the unit that clients can investigate and fix.

## Data model direction

The first implementation can calculate health through a database view or dashboard query. Avoid persisting duplicate health state until there is a demonstrated performance need.

Possible future fields on `public.workflows`:

```text
expected_interval_minutes integer null
health_check_enabled boolean not null default true
```

Possible future aggregate view:

```text
workflow_health_summary
```

The view would return one row per workflow with recent run counts, success rate, latest status, latest success timestamp, duration statistics, and derived health state.

## Demo requirements

The demo tenant should intentionally contain varied health states:

- Several healthy workflows
- One degraded workflow with retries or partial runs
- One failed workflow with a visible error
- One active workflow that has never run
- Optionally one paused workflow

This makes the health dashboard demonstrate operational judgment rather than displaying eight identical green cards.

Demo events should continue writing through the same `ingest_workflow_run` RPC used by real integrations. The dashboard should therefore exercise the same health calculation path as production activity.

## Recommended implementation sequence

1. Add a shared service and health vocabulary in the frontend.
2. Create a workflow health aggregation query or database view.
3. Add health calculations and threshold tests.
4. Add the overall dashboard summary.
5. Add health indicators to workflow rows.
6. Add workflow detail history and step errors.
7. Add expected cadence and stale detection.
8. Expand demo fixtures to cover every health state.
