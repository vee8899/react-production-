import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

export type FileRecord = {
  path: string;
  kind: "source" | "config" | "migration" | "function" | "documentation" | "asset" | "other";
  extension: string;
  hash: string;
  lines: number;
  imports: string[];
  exports: string[];
  symbols: string[];
  referencedComponents: string[];
  referencedHooks: string[];
  apiUsage: string[];
  databaseUsage: string[];
  routes: string[];
};

export type RepositoryMap = {
  root: string;
  generatedAt: string;
  files: FileRecord[];
  dependencies: Record<string, string>;
};

const ignoredDirectories = new Set([
  ".git", ".github", ".vscode", "node_modules", "dist", "build", "coverage", ".next", ".cache",
  "knowledge", "index", ".ai-state", "tmp", "temp",
]);
const ignoredFiles = new Set(["package-lock.json", "pnpm-lock.yaml", "yarn.lock"]);
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

function walk(root: string, current = root): string[] {
  return readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      const directoryPath = relative(root, join(current, entry.name)).replaceAll("\\", "/");
      const generatedDocs = directoryPath === "docs/specs" || directoryPath === "docs/adrs" || directoryPath === "docs/runbooks" || directoryPath.startsWith("docs/specs/") || directoryPath.startsWith("docs/adrs/") || directoryPath.startsWith("docs/runbooks/");
      return ignoredDirectories.has(entry.name) || generatedDocs ? [] : walk(root, join(current, entry.name));
    }
    if (ignoredFiles.has(entry.name) || entry.name.endsWith(".generated.ts") || entry.name.endsWith(".map")) return [];
    return [relative(root, join(current, entry.name)).replaceAll("\\", "/")];
  });
}

function unique(values: string[]): string[] { return [...new Set(values)].sort(); }

function matches(text: string, pattern: RegExp): string[] {
  return [...text.matchAll(pattern)].map((match) => match[1] ?? match[0]).filter(Boolean);
}

function classify(path: string): FileRecord["kind"] {
  if (path.startsWith("supabase/migrations/")) return "migration";
  if (path.startsWith("supabase/functions/")) return "function";
  if (/\.(md|mdx|txt)$/i.test(path)) return "documentation";
  if (sourceExtensions.has(path.slice(path.lastIndexOf(".")))) return "source";
  if (/\.(json|toml|yml|yaml|css|html)$/i.test(path)) return "config";
  if (/\.(svg|png|jpg|jpeg|gif|ico|webp)$/i.test(path)) return "asset";
  return "other";
}

function parseFile(root: string, path: string): FileRecord {
  const absolute = join(root, path);
  const binary = /\.(svg|png|jpg|jpeg|gif|ico|webp)$/i.test(path);
  const text = binary ? "" : readFileSync(absolute, "utf8");
  const imports = unique([
    ...matches(text, /import\s+(?:[\s\S]*?\s+from\s+|)['"]([^'"]+)['"]/g),
    ...matches(text, /(?:require|import)\(\s*['"]([^'"]+)['"]\s*\)/g),
  ]);
  const exports = unique([
    ...matches(text, /export\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var|type|interface|enum)\s+([A-Za-z_$][\w$]*)/g),
    ...matches(text, /export\s*\{([^}]+)\}/g).flatMap((value) => value.split(",").map((item) => item.trim().split(/\s+as\s+/)[0])),
  ]);
  const symbols = unique([
    ...exports,
    ...matches(text, /(?:function|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/g),
    ...matches(text, /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::|=)/g),
  ]);
  const referencedComponents = unique(matches(text, /<([A-Z][A-Za-z0-9]*)[\s/>]/g));
  const referencedHooks = unique(matches(text, /\b(use[A-Z][A-Za-z0-9]*)\s*\(/g));
  const apiUsage = unique(matches(text, /\b(supabase\.[A-Za-z0-9_.]+|fetch\s*\(|axios\.[A-Za-z]+|\/functions\/v1\/[A-Za-z0-9_-]+)/g));
  const databaseUsage = unique([
    ...matches(text, /\.from\(\s*["'`]([^"'`]+)["'`]/g),
    ...matches(text, /\b(create table|alter table|insert into|select .* from|update .* set|delete from)\b/gi),
  ]);
  const routes = unique([
    ...matches(text, /<Route\s+path=["'`]([^"'`]+)["'`]/g),
    ...matches(text, /(?:navigate|to|href)=?[({\s]*["'`]((?:\/|https?:\/\/)[^"'`]*)["'`]/g),
  ]);
  return {
    path, kind: classify(path), extension: path.includes(".") ? path.slice(path.lastIndexOf(".")) : "",
    hash: createHash("sha256").update(binary ? readFileSync(absolute) : text).digest("hex"),
    lines: text ? text.split(/\r?\n/).length : 0, imports, exports, symbols,
    referencedComponents, referencedHooks, apiUsage, databaseUsage, routes,
  };
}

export function scanRepository(root = process.cwd()): RepositoryMap {
  const resolvedRoot = resolve(root);
  const files = walk(resolvedRoot).sort().map((path) => parseFile(resolvedRoot, path));
  const packagePath = join(resolvedRoot, "package.json");
  const packageJson = existsSync(packagePath) ? JSON.parse(readFileSync(packagePath, "utf8")) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> } : {};
  return { root: resolvedRoot, generatedAt: "deterministic", files, dependencies: { ...packageJson.dependencies, ...packageJson.devDependencies } };
}

export function readSource(map: RepositoryMap, path: string): string {
  return readFileSync(join(map.root, path), "utf8");
}

export function writeIfChanged(path: string, content: string): boolean {
  const current = existsSync(path) ? readFileSync(path, "utf8") : undefined;
  if (current === content) return false;
  mkdirSync(resolve(path, ".."), { recursive: true });
  writeFileSync(path, content, "utf8");
  return true;
}

export function stableJson(value: unknown): string { return `${JSON.stringify(value, null, 2)}\n`; }
