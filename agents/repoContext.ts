import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const BASE_CONTEXT_SOURCES = [
  "AGENT.md",
  "docs/README.md",
];

const TASK_DOCUMENTS = [
  { keywords: ["database", "migration", "rls", "policy", "sql", "supabase"], paths: ["docs/runbooks/database-migrations.md", "docs/runbooks/rls-testing.md", "docs/mcp-operations.md"] },
  { keywords: ["ingest", "workflow", "run", "event"], paths: ["docs/specs/automation-run-ingestion.md", "docs/architecture/canonical-workflow-runs.md"] },
  { keywords: ["invite", "auth", "login", "client"], paths: ["docs/specs/client-invitation.md", "docs/adrs/authentication.md"] },
  { keywords: ["release", "deploy", "staging", "production"], paths: ["docs/runbooks/release-checklist.md", "docs/runbooks/deployment.md"] },
];

const STOP_WORDS = new Set(["about", "after", "agent", "and", "code", "change", "for", "from", "have", "into", "make", "refactor", "repository", "the", "this", "that", "with"]);
const MAX_DOCUMENT_CHARS = 6_000;
const MAX_SOURCE_CHARS = 5_000;
const MAX_RELEVANT_SOURCES = 6;

type IndexRecord = {
  path?: string;
  kind?: string;
  imports?: string[];
  exports?: string[];
  symbols?: string[];
  apiUsage?: string[];
  databaseUsage?: string[];
};

function taskTerms(task: string): string[] {
  return [...new Set(task.toLowerCase().match(/[a-z0-9_/-]{3,}/g) ?? [])].filter((term) => !STOP_WORDS.has(term));
}

function readContextFile(root: string, relative: string, maxChars: number): string | null {
  const path = join(root, relative);
  if (!existsSync(path)) return null;
  return `## ${relative}\n${readFileSync(path, "utf8").slice(0, maxChars)}`;
}

function taskDocuments(terms: string[]): string[] {
  return [...new Set(TASK_DOCUMENTS.filter(({ keywords }) => keywords.some((keyword) => terms.some((term) => term.includes(keyword) || keyword.includes(term)))).flatMap(({ paths }) => paths))];
}

function taskSourcePaths(root: string, terms: string[]): string[] {
  const indexPath = join(root, "outputs", "repo-index", "files.json");
  if (!existsSync(indexPath) || !terms.length) return [];

  const parsed = JSON.parse(readFileSync(indexPath, "utf8")) as { records?: IndexRecord[] };
  return (parsed.records ?? [])
    .filter((record) => record.path && ["source", "function", "migration"].includes(record.kind ?? ""))
    .map((record) => {
      const searchable = [record.path, ...(record.imports ?? []), ...(record.exports ?? []), ...(record.symbols ?? []), ...(record.apiUsage ?? []), ...(record.databaseUsage ?? [])].join(" ").toLowerCase();
      const score = terms.reduce((total, term) => total + (searchable.includes(term) ? 1 : 0), 0);
      return { path: record.path!, score };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.path.localeCompare(right.path))
    .slice(0, MAX_RELEVANT_SOURCES)
    .map(({ path }) => path)
    .filter((relative) => {
      const absolute = resolve(root, relative);
      return absolute.startsWith(`${resolve(root)}\\`) || absolute.startsWith(`${resolve(root)}/`);
    });
}

export function loadRepoContext(root = process.cwd(), task = ""): string {
  const terms = taskTerms(task);
  const documents = [...BASE_CONTEXT_SOURCES, ...taskDocuments(terms)];
  const parts = documents.map((relative) => readContextFile(root, relative, MAX_DOCUMENT_CHARS)).filter((content): content is string => content !== null);
  for (const relative of taskSourcePaths(root, terms)) {
    const source = readContextFile(root, relative, MAX_SOURCE_CHARS);
    if (source) parts.push(source);
  }
  return parts.join("\n\n");
}
