export type DemoLead = {
  id: string;
  name: string;
  email: string;
  source: string;
  status: "new" | "contacted" | "qualified";
};

export type DemoRun = {
  id: string;
  featureKey: string;
  workflowName: string;
  status: "success" | "error";
  ranAt: string;
  recordsProcessed: number;
  recordsFailed: number;
  durationMs: number;
};

export const DEMO_TENANT = {
  name: "Northstar Realty",
  label: "Demo workspace",
};

export const DEMO_LEADS: DemoLead[] = [
  { id: "lead-001", name: "Maya Chen", email: "maya.chen@example.test", source: "Website", status: "qualified" },
  { id: "lead-002", name: "Jordan Ellis", email: "jordan.ellis@example.test", source: "Referral", status: "contacted" },
  { id: "lead-003", name: "Rafael Torres", email: "rafael.torres@example.test", source: "Listing portal", status: "new" },
];

export const DEMO_RUNS: DemoRun[] = [
  {
    id: "run-004",
    featureKey: "lead_follow_up",
    workflowName: "New lead follow-up",
    status: "success",
    ranAt: "2026-07-16T07:42:00.000Z",
    recordsProcessed: 8,
    recordsFailed: 0,
    durationMs: 1840,
  },
  {
    id: "run-003",
    featureKey: "appointment_scheduling",
    workflowName: "Appointment confirmation",
    status: "success",
    ranAt: "2026-07-15T13:18:00.000Z",
    recordsProcessed: 4,
    recordsFailed: 0,
    durationMs: 2310,
  },
  {
    id: "run-002",
    featureKey: "listing_notifications",
    workflowName: "Listing status notification",
    status: "error",
    ranAt: "2026-07-15T09:06:00.000Z",
    recordsProcessed: 11,
    recordsFailed: 1,
    durationMs: 4120,
  },
  {
    id: "run-001",
    featureKey: "crm_sync",
    workflowName: "CRM contact synchronization",
    status: "success",
    ranAt: "2026-07-14T16:30:00.000Z",
    recordsProcessed: 24,
    recordsFailed: 0,
    durationMs: 6920,
  },
];

export const summarizeRuns = (runs: DemoRun[]) => ({
  total: runs.length,
  successful: runs.filter((run) => run.status === "success").length,
  failed: runs.filter((run) => run.status === "error").length,
  records: runs.reduce((total, run) => total + run.recordsProcessed, 0),
});
