// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scanRepository } from "./repo-map.ts";
import { writeKnowledge } from "./knowledge.ts";

const temporaryRoots: string[] = [];
afterEach(() => {
  for (const root of temporaryRoots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("generated knowledge boundaries", () => {
  it("discovers provider candidates, removes stale matches, and preserves authored decisions", () => {
    const root = mkdtempSync(join(tmpdir(), "prime-state-knowledge-"));
    temporaryRoots.push(root);
    mkdirSync(join(root, "src"));
    mkdirSync(join(root, "docs", "adrs"), { recursive: true });
    writeFileSync(join(root, "package.json"), '{"dependencies":{"react":"^19.0.0"}}');
    const authoredPath = join(root, "docs", "adrs", "state.md");
    const authoredDecision = "# State decision\n\nAn authored decision that generation must preserve.\n";
    writeFileSync(authoredPath, authoredDecision);
    writeFileSync(join(root, "src", "main.tsx"), 'export const App = () => <QueryClientProvider><PostHogProvider /></QueryClientProvider>;');

    writeKnowledge(scanRepository(root));
    const contextsPath = join(root, "docs", "knowledge-base", "contexts.md");
    const contexts = readFileSync(contextsPath, "utf8");
    expect(contexts).toContain("QueryClientProvider");
    expect(contexts).toContain("PostHogProvider");
    expect(contexts).toContain("../../src/main.tsx");
    expect(contexts).not.toContain("No React Context provider was detected");
    expect(readFileSync(authoredPath, "utf8")).toBe(authoredDecision);
    expect(readFileSync(join(root, "docs", "generated", "architecture.md"), "utf8")).toContain("../knowledge-base/architecture.md");

    writeFileSync(join(root, "src", "main.tsx"), 'export const App = () => <main />;');
    writeKnowledge(scanRepository(root));
    const refreshed = readFileSync(contextsPath, "utf8");
    expect(refreshed).not.toContain("QueryClientProvider");
    expect(refreshed).not.toContain("PostHogProvider");
    expect(refreshed).toContain("not proof of absence");
    expect(readFileSync(authoredPath, "utf8")).toBe(authoredDecision);
    writeKnowledge(scanRepository(root));
    expect(readFileSync(contextsPath, "utf8")).toBe(refreshed);
  });
});
