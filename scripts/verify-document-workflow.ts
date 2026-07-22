import fs from "node:fs";
import path from "node:path";

const root = path.resolve("n8n/workflows/document-automation");
const workflow = JSON.parse(fs.readFileSync(path.join(root, "document-generation.json"), "utf8")) as { active?: boolean; nodes?: Array<{ type?: string; parameters?: Record<string, unknown> }>; connections?: unknown };
const example = JSON.parse(fs.readFileSync(path.join(root, "example-request.json"), "utf8")) as Record<string, unknown>;
const text = JSON.stringify(workflow);
const requiredMarkers = ["template_key", "template_version", "field_values", "required_fields", "conditions", "approval", "output_format", "output_reference", "entity_refs", "workflow_steps", "SUPABASE_INGEST_URL", "WEBHOOK_SECRET"];
const errors = requiredMarkers.filter((marker) => !text.includes(marker));
if (workflow.active !== false) errors.push("workflow must be inactive");
if (!workflow.nodes?.some((node) => node.type === "n8n-nodes-base.httpRequest")) errors.push("missing HTTP adapter node");
for (const field of ["client_id", "source_event_id", "workflow_name", "template_key", "template_version", "field_values", "output_format"]) if (example[field] === undefined) errors.push(`example missing ${field}`);
if (/BEGIN .*PRIVATE KEY|service_role|api[_-]?key\s*[:=]|password\s*[:=]/i.test(text)) errors.push("secret-like content detected");
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log("Validated standardized document workflow contract and sanitized example.");
