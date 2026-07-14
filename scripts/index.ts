import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { scanRepository, stableJson } from "./repo-map.ts";

const map = scanRepository();
const output = join(map.root, "index");
mkdirSync(output, { recursive: true });
const sourceFiles = map.files.filter((file) => file.kind === "source" || file.kind === "function" || file.kind === "migration");
const records = sourceFiles.map((file) => ({
  file: file.path, exportedSymbols: file.exports, importedSymbols: file.imports,
  dependencies: file.imports.filter((item) => item.startsWith(".") || item.startsWith("@/")),
  referencedComponents: file.referencedComponents, referencedHooks: file.referencedHooks,
  apiUsage: file.apiUsage, databaseUsage: file.databaseUsage,
}));
const by = (predicate: (path: string) => boolean) => records.filter((record) => predicate(record.file));

const indexes: Record<string, unknown> = {
  components: by((path) => path.includes("/components/")),
  routes: map.files.flatMap((file) => file.routes.map((route) => ({ route, file: file.path, protected: file.path === "src/App.tsx" && route !== "/" && route !== "/login" && route !== "/accept-invite" }))),
  hooks: by((path) => path.includes("/hooks/")),
  contexts: records.filter((record) => record.exportedSymbols.some((symbol) => /Context|Provider$/.test(symbol))),
  services: by((path) => path.includes("/api/") || path.includes("/services/")),
  api: records.filter((record) => record.apiUsage.length > 0),
  database: records.filter((record) => record.databaseUsage.length > 0),
  imports: records.map(({ file, importedSymbols, dependencies }) => ({ file, importedSymbols, dependencies })),
  exports: records.map(({ file, exportedSymbols }) => ({ file, exportedSymbols })),
  dependencies: Object.entries(map.dependencies).sort(([a], [b]) => a.localeCompare(b)).map(([name, version]) => ({ name, version, usedBy: map.files.filter((file) => file.imports.some((item) => item === name || item.startsWith(`${name}/`))).map((file) => file.path) })),
  files: map.files,
};

for (const [name, value] of Object.entries(indexes)) writeFileSync(join(output, `${name}.json`), stableJson({ generatedAt: map.generatedAt, ...({ records: value } as object) }), "utf8");
console.log(`Indexed ${map.files.length} files into ${output}`);
