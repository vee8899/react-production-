import fs from "node:fs";
import path from "node:path";

const root = path.resolve("n8n/workflows/data-synchronization");
const workflow = fs.readFileSync(path.join(root, "crm-spreadsheet-portal-sync.json"), "utf8");
const example = JSON.parse(fs.readFileSync(path.join(root, "example-batch.json"), "utf8")) as Record<string, unknown>;
const markers = ["source_system", "records", "field_map", "external_id", "record_key", "failed_record_ids", "records_processed", "records_failed", "partial", "entity_refs", "workflow_steps", "DATA_SYNC_PROVIDER_URL", "SUPABASE_INGEST_URL", "WEBHOOK_SECRET", "retryOnFail", "maxTries"];
const errors = markers.filter((marker) => !workflow.includes(marker));
for (const field of ["client_id", "source_event_id", "workflow_name", "source_system", "records", "field_map"]) if (example[field] === undefined) errors.push(`example missing ${field}`);
if (!workflow.includes('"active": false')) errors.push("workflow must be inactive");
if (/BEGIN .*PRIVATE KEY|service_role|api[_-]?key\s*[:=]|password\s*[:=]/i.test(workflow)) errors.push("secret-like content detected");
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log("Validated CRM/spreadsheet/portal synchronization workflow and sanitized example.");
