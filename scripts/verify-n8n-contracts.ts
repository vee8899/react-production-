import fs from "node:fs";
import path from "node:path";

const packageRoot = path.resolve("n8n/workflows/shared-packages");
const packageFiles = fs.readdirSync(packageRoot).filter((file) => file.endsWith(".json"));
const errors: string[] = [];
const requiredPackageMarkers = ["event_id", "client_id", "source_event_id", "workflow_name", "feature_type", "retryOnFail", "maxTries"];

for (const file of packageFiles) {
  const text = fs.readFileSync(path.join(packageRoot, file), "utf8");
  for (const marker of requiredPackageMarkers) if (!text.includes(marker)) errors.push(`${file}: missing ${marker}`);
}

for (const file of ["record-success.json", "record-partial.json", "record-failure.json", "operator-alert.json"]) {
  if (!fs.existsSync(path.join(packageRoot, "runtime", file))) errors.push(`runtime/${file}: missing`);
}

if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Validated ${packageFiles.length} shared package/runtime workflow exports.`);
