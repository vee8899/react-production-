import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { scanRepository, stableJson, writeIfChanged } from "./repo-map.ts";
import { writeKnowledge } from "./knowledge.ts";

const map = scanRepository();
const statePath = join(map.root, ".ai-state", "manifest.json");
const previous = existsSync(statePath) ? JSON.parse(readFileSync(statePath, "utf8")) as { files?: Record<string, string> } : {};
const current = Object.fromEntries(map.files.map((file) => [file.path, file.hash]));
const changed = map.files.filter((file) => previous.files?.[file.path] !== file.hash).map((file) => file.path);
const deleted = Object.keys(previous.files ?? {}).filter((path) => !(path in current));

writeKnowledge(map);
// Only generated navigation and state are written; authored decisions stay intact.
writeIfChanged(statePath, stableJson({ files: current, changed, deleted }));
console.log(`Ingested ${map.files.length} files. Changed: ${changed.length}; deleted: ${deleted.length}.`);
