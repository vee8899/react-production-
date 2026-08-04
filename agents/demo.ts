import { loadConfig } from "./config.ts";
import { runCodingAgentsWithRepoContext } from "./index.ts";

const task = process.argv.slice(2).join(" ") || "Add a unit test for the ROI calculator in src/lib.";
const config = loadConfig();
const startedAt = Date.now();

console.log("Running coding agents...");
console.log(`  orchestrator: ${describe(config.orchestrator.model)}`);
console.log(`  coder:        ${describe(config.coder.model)}`);
console.log(`  reviewer:     ${describe(config.reviewer.model)}`);
console.log(`  task:         ${task}`);
console.log("");

const result = await runCodingAgentsWithRepoContext({ task }, config);

for (const entry of result.logs) console.log(`  - ${entry}`);

console.log("");
console.log(`Verdict: ${result.verdict} after ${result.attempts} review attempt(s) in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);
console.log("");
console.log("## Plan");
console.log(result.plan);
console.log("");
console.log("## Files");
for (const file of result.files) console.log(`- ${file}`);
console.log("");
console.log("## Implementation");
console.log(result.code);
console.log("");
console.log("## Review comments");
for (const comment of result.reviewComments) console.log(`- ${comment}`);
if (result.verdict === "changes") {
  console.log("");
  console.log(`NOT APPROVED: ${result.summary}`);
  process.exitCode = 1;
}

function describe(model: unknown): string {
  if (typeof model === "object" && model !== null && "model" in model && typeof model.model === "string") {
    return model.model;
  }
  return "unknown model";
}
