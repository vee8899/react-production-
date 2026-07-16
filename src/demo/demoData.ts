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

export const SAMPLE_LEADS_CSV = `first_name,last_name,email,phone,source
Alex, Morgan,alex.morgan@example.test,555-0101,Open house
Priya, Shah,priya.shah@example.test,555-0102,Website
Sam, Rivera,sam.rivera@example.test,555-0103,Referral`;

const normalizeHeader = (header: string) =>
  header.trim().toLowerCase().replace(/\s+/g, "_");

const splitCsvLine = (line: string) => {
  const values: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      values.push(value.trim());
      value = "";
    } else {
      value += character;
    }
  }

  values.push(value.trim());
  return values;
};

export const parseDemoLeadsCsv = (csv: string): DemoLead[] => {
  const lines = csv.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) throw new Error("Add at least one lead row.");

  const headers = splitCsvLine(lines[0]).map(normalizeHeader);
  if (!headers.includes("email")) throw new Error("The CSV must include an email column.");

  return lines.slice(1).map((line, index) => {
    const values = splitCsvLine(line);
    const row = Object.fromEntries(headers.map((header, column) => [header, values[column] ?? ""]));
    if (!row.email || !row.email.includes("@")) {
      throw new Error(`Lead row ${index + 2} needs a valid email.`);
    }

    const name = [row.first_name, row.last_name].filter(Boolean).join(" ") || row.name || row.email;
    return {
      id: `demo-upload-${Date.now()}-${index}`,
      name,
      email: row.email,
      source: row.source || "Demo upload",
      status: "new",
    };
  });
};

export const summarizeRuns = (runs: DemoRun[]) => ({
  total: runs.length,
  successful: runs.filter((run) => run.status === "success").length,
  failed: runs.filter((run) => run.status === "error").length,
  records: runs.reduce((total, run) => total + run.recordsProcessed, 0),
});
