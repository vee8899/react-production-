import fs from "node:fs";
import path from "node:path";

const root = path.resolve("n8n/workflows/adapters");
const expected = ["gmail", "outlook", "whatsapp", "telegram", "slack", "google-calendar", "google-sheets", "google-docs"];
const errors: string[] = [];
for (const provider of expected) {
  const file = path.join(root, `${provider}.json`);
  if (!fs.existsSync(file)) { errors.push(`${provider}: missing adapter`); continue; }
  const text = fs.readFileSync(file, "utf8");
  try { JSON.parse(text); } catch { errors.push(`${provider}: invalid JSON`); }
  if (!text.includes('"active":false')) errors.push(`${provider}: adapter must be inactive`);
  if (!text.includes("configured: false")) errors.push(`${provider}: adapter must remain unconfigured`);
  if (/BEGIN .*PRIVATE KEY|service_role|api[_-]?key\s*[:=]|password\s*[:=]/i.test(text)) errors.push(`${provider}: secret-like content detected`);
}
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Validated ${expected.length} disabled provider adapter templates.`);
