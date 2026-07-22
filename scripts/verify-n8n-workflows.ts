import fs from "node:fs";
import path from "node:path";

const root = path.resolve("n8n/workflows");
const forbidden = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
  /(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\s*[:=]/i,
  /service_role/i,
  /supabase_service_role_key/i,
];
const requiredIngestFields = ["event_id", "client_id", "feature_type", "workflow_name", "status"];
const files = fs.readdirSync(root, { recursive: true })
  .filter((file) => file.endsWith(".json") && !file.startsWith(`examples${path.sep}`) && !file.endsWith(`${path.sep}example-request.json`) && !file.endsWith(`${path.sep}example-batch.json`));
const errors: string[] = [];
type WorkflowExport = {
  name?: unknown;
  nodes?: unknown;
  connections?: unknown;
};

for (const file of files) {
  const filename = path.join(root, file);
  let workflow: WorkflowExport;
  try {
    workflow = JSON.parse(fs.readFileSync(filename, "utf8"));
  } catch (error) {
    errors.push(`${file}: invalid JSON (${String(error)})`);
    continue;
  }

  if (typeof workflow.name !== "string" || !Array.isArray(workflow.nodes) || !workflow.connections) {
    errors.push(`${file}: missing n8n workflow structure`);
  }
  const text = JSON.stringify(workflow);
  for (const pattern of forbidden) if (pattern.test(text)) errors.push(`${file}: forbidden secret-like content (${pattern})`);
  if (text.includes("SUPABASE_INGEST_URL")) {
    for (const field of requiredIngestFields) if (!text.includes(field)) errors.push(`${file}: ingestion workflow is missing ${field}`);
    if (!text.includes('"method":"POST"')) errors.push(`${file}: ingestion must use POST`);
    if (!text.includes("X-Webhook-Secret")) errors.push(`${file}: ingestion must send X-Webhook-Secret`);
    if (!text.includes("SUPABASE_INGEST_URL") || !text.includes("WEBHOOK_SECRET")) errors.push(`${file}: ingestion must use environment variables`);
  }
}

const example = path.join(root, "examples", "lead-event.json");
if (!fs.existsSync(example)) errors.push("examples/lead-event.json: missing sanitized example");
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Validated ${files.length} n8n workflow exports and sanitized examples.`);
