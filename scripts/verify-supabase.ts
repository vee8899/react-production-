import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

type Environment = "local" | "staging";
const environment = (process.env.SUPABASE_ENV ?? "local") as Environment;
if (environment !== "local" && environment !== "staging") {
  throw new Error("SUPABASE_ENV must be local or staging. Production is intentionally excluded.");
}

const url = process.env.SUPABASE_URL ?? "";
const projectRef = process.env.SUPABASE_PROJECT_REF ?? "";
const forbidden = /prod|production|live/i;
if (forbidden.test(url) || forbidden.test(projectRef)) {
  throw new Error("Production-looking Supabase targets are not allowed by the repository preflight.");
}

const root = process.cwd();
const migrationDirectory = join(root, "supabase", "migrations");
const migrations = readdirSync(migrationDirectory).filter((file) => file.endsWith(".sql")).sort();
const sql = migrations.map((file) => readFileSync(join(migrationDirectory, file), "utf8")).join("\n");
const requiredTables = [
  "organizations",
  "organization_members",
  "clients",
  "workflows",
  "automation_runs",
  "analytics_snapshots",
  "client_services",
  "integrations",
  "feature_subscriptions",
  "workflow_runs",
  "workflow_steps",
  "workflow_run_entities",
  "notifications",
  "notification_deliveries",
  "reports",
  "ai_jobs",
  "audit_log",
];
const requiredTypes = ["feature_type", "run_status", "client_service_status"];
const missingTables = requiredTables.filter((table) => !new RegExp(`create table(?: if not exists)? public\\.${table}\\b`, "i").test(sql));
const missingVerticalTables = ["leads", "listings", "appointments"].filter((table) => !new RegExp(`create table(?: if not exists)? real_estate\\.${table}\\b`, "i").test(sql));
const missingTypes = requiredTypes.filter((type) => !new RegExp(`create type public\\.${type}\\b`, "i").test(sql));
if (missingTables.length || missingVerticalTables.length || missingTypes.length) {
  throw new Error(`Migration inventory is incomplete. Missing core tables: ${missingTables.join(", ") || "none"}; missing vertical tables: ${missingVerticalTables.join(", ") || "none"}; missing types: ${missingTypes.join(", ") || "none"}.`);
}

console.log(`Supabase preflight: ${environment}`);
console.log(`Migrations: ${migrations.length}`);
console.log(`Core tables: ${requiredTables.join(", ")}`);
console.log("Real-estate tables: leads, listings, appointments (real_estate schema)");
console.log(`Enums: ${requiredTypes.join(", ")}`);
console.log(`Target configured: ${url || projectRef ? "yes" : "no (MCP/CLI environment variables are not set)"}`);
console.log("Production access: blocked");
console.log("Next: run `npx supabase db push --dry-run` against the selected local or staging project.");

if (existsSync(join(root, ".env.mcp"))) {
  console.warn("Warning: .env.mcp exists locally; keep it untracked and never copy secrets into repository files.");
}
