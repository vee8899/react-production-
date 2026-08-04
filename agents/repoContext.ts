import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const CONTEXT_SOURCES = [
  "docs/knowledge-base/folder_structure.md",
  "docs/knowledge-base/architecture.md",
  "outputs/repo-index/files.json",
];

export function loadRepoContext(root = process.cwd()): string {
  const parts: string[] = [];
  for (const relative of CONTEXT_SOURCES) {
    const path = join(root, relative);
    if (!existsSync(path)) continue;
    const content = readFileSync(path, "utf8");
    parts.push(`## ${relative}\n${content.slice(0, 4000)}`);
  }
  return parts.join("\n\n");
}
