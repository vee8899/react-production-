import { describe, expect, it } from "vitest";
import { AIMessageChunk } from "@langchain/core/messages";
import { RunnableLambda } from "@langchain/core/runnables";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { CodingAgentsConfig } from "./config.ts";
import { loadConfig, parseModelSpec } from "./config.ts";
import { loadEnvFiles } from "./env.ts";
import { loadRepoContext } from "./repoContext.ts";
import { applyImplementation, parseCodeBlocks, parsePatches, patchTargetFile } from "./index.ts";
import { runCodingAgents } from "./index.ts";
import type { AgentModel } from "./types.ts";

interface FakeResponse {
  kind: "raw" | "object";
  content?: string;
  value?: Record<string, unknown>;
}

class FakeModel implements AgentModel {
  private queue: FakeResponse[];

  constructor(responses: FakeResponse[]) {
    this.queue = [...responses];
  }

  withStructuredOutput() {
    return RunnableLambda.from(() => this.nextObject());
  }

  async invoke(): Promise<AIMessageChunk> {
    return new AIMessageChunk({ content: this.nextRaw() });
  }

  private next(): FakeResponse {
    const next = this.queue.shift();
    if (!next) throw new Error("Fake model ran out of canned responses");
    return next;
  }

  private nextRaw(): string {
    const response = this.next();
    if (response.kind !== "raw") throw new Error("Expected a raw response, got an object response");
    return response.content ?? "";
  }

  private nextObject(): Record<string, unknown> {
    const response = this.next();
    if (response.kind !== "object") throw new Error("Expected an object response, got a raw response");
    return response.value ?? {};
  }
}

function configFor(queue: FakeResponse[], maxAttempts = 2): CodingAgentsConfig {
  const fake = new FakeModel(queue) as unknown as CodingAgentsConfig["orchestrator"]["model"];
  return {
    orchestrator: { model: fake, cacheControl: false },
    coder: { model: fake, cacheControl: false },
    reviewer: { model: fake, cacheControl: false },
    maxAttempts,
  };
}

const plan = {
  goal: "Add an ROI test",
  steps: ["Write the test", "Run it"],
  codingSpec: "Add src/lib/roi.test.ts covering the ROI calculator.",
  verification: ["Run the ROI test."],
  exceptions: [],
  documentationStatus: "aligned",
};

const testFile = `import { describe, expect, it } from 'vitest';
import { roi } from './roi.ts';
describe('roi', () => {
  it('computes positive returns', () => {
    expect(roi(100, 120)).toBe(20);
  });
});`;

const code = ["```ts file:src/lib/roi.test.ts", testFile, "```"].join("\n");

const approve = { verdict: "approve", comments: ["Looks good."], requestedChanges: "" };
const changes = {
  verdict: "changes",
  comments: ["Add the negative-return case."],
  requestedChanges: "Cover the negative-return case.",
};

describe("parseCodeBlocks", () => {
  it("extracts file-annotated fenced blocks", () => {
    const blocks = parseCodeBlocks(code);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({ file: "src/lib/roi.test.ts", language: "ts" });
    expect(blocks[0].code).toContain("describe('roi'");
  });

  it("returns an empty list when there are no fences", () => {
    expect(parseCodeBlocks("plain text")).toEqual([]);
  });
});

describe("patch parsing and application", () => {
  const patch = [
    "```diff",
    "--- a/src/lib/roi.test.ts",
    "+++ b/src/lib/roi.test.ts",
    "@@ -4,5 +4,6 @@",
    " describe('roi', () => {",
    "   it('computes positive returns', () => {",
    "     expect(roi(100, 120)).toBe(20);",
    "+    expect(roi(100, 100)).toBe(0);",
    "   });",
    " });",
    "```",
  ].join("\n");

  it("extracts diff blocks and their target file", () => {
    expect(parsePatches(patch)).toHaveLength(1);
    expect(patchTargetFile(parsePatches(patch)[0])).toBe("src/lib/roi.test.ts");
  });

  it("applies a git diff patch to the current implementation", () => {
    const { updates, logs } = applyImplementation(patch, { "src/lib/roi.test.ts": testFile });
    expect(updates["src/lib/roi.test.ts"]).toContain("expect(roi(100, 100)).toBe(0);");
    expect(logs).toContain("coder: applied patch to src/lib/roi.test.ts");
  });

  it("does not apply a patch for a file it does not know", () => {
    const { updates, logs } = applyImplementation(patch, {});
    expect(updates).toEqual({});
    expect(logs.join("\n")).toMatch(/skipped patch/);
  });
});

describe("runCodingAgents", () => {
  it("routes to an approved end state on the first pass", async () => {
    const config = configFor([
      { kind: "object", value: plan },
      { kind: "raw", content: code },
      { kind: "object", value: approve },
    ]);
    const result = await runCodingAgents({ task: "Add an ROI test" }, config);
    expect(result.verdict).toBe("approve");
    expect(result.attempts).toBe(1);
    expect(result.files).toEqual(["src/lib/roi.test.ts"]);
    expect(result.plan).toContain("Coding spec:");
    expect(result.code).toContain("describe('roi'");
    expect(result.logs).toEqual([
      "orchestrator: planned 2 step(s)",
      "coder: rewrote src/lib/roi.test.ts",
      "reviewer: approve (1 comment(s))",
    ]);
  });

  it("applies a diff patch on the revision pass when the reviewer requests changes", async () => {
    const revisionPatch = [
      "```diff",
      "--- a/src/lib/roi.test.ts",
      "+++ b/src/lib/roi.test.ts",
      "@@ -4,5 +4,6 @@",
      " describe('roi', () => {",
      "   it('computes positive returns', () => {",
      "     expect(roi(100, 120)).toBe(20);",
      "+    expect(roi(100, 100)).toBe(0);",
      "   });",
      " });",
      "```",
    ].join("\n");
    const config = configFor([
      { kind: "object", value: plan },
      { kind: "raw", content: code },
      { kind: "object", value: changes },
      { kind: "raw", content: revisionPatch },
      { kind: "object", value: approve },
    ]);
    const result = await runCodingAgents({ task: "Add an ROI test" }, config);
    expect(result.verdict).toBe("approve");
    expect(result.attempts).toBe(2);
    expect(result.code).toContain("expect(roi(100, 100)).toBe(0);");
    expect(result.reviewComments).toEqual(["Add the negative-return case.", "Looks good."]);
    expect(result.logs).toContain("coder: applied patch to src/lib/roi.test.ts");
  });

  it("stops with a failing verdict when review cycles exceed maxAttempts", async () => {
    const config = configFor(
      [
        { kind: "object", value: plan },
        { kind: "raw", content: code },
        { kind: "object", value: changes },
        { kind: "raw", content: code },
        { kind: "object", value: changes },
      ],
      2,
    );
    const result = await runCodingAgents({ task: "Add an ROI test" }, config);
    expect(result.verdict).toBe("changes");
    expect(result.attempts).toBe(2);
    expect(result.summary).toContain("negative-return");
  });

  it("stops before coding when the plan requires a documentation decision", async () => {
    const config = configFor([
      {
        kind: "object",
        value: {
          ...plan,
          codingSpec: "Do not implement until the conflict is resolved.",
          exceptions: ["The authored specification and implementation disagree."],
          documentationStatus: "decision_required",
        },
      },
    ]);

    const result = await runCodingAgents({ task: "Resolve a documented behavior conflict" }, config);

    expect(result.verdict).toBe("changes");
    expect(result.attempts).toBe(0);
    expect(result.files).toEqual([]);
    expect(result.plan).toContain("Documentation status: decision_required");
  });
});

describe("parseModelSpec", () => {
  it("parses provider-qualified model specs", () => {
    expect(parseModelSpec("deepseek/deepseek-v4-flash")).toEqual({ provider: "deepseek", model: "deepseek-v4-flash" });
    expect(parseModelSpec("anthropic/claude-opus-4-8")).toEqual({ provider: "anthropic", model: "claude-opus-4-8" });
  });

  it("rejects unknown providers and malformed specs", () => {
    expect(() => parseModelSpec("unknown/model")).toThrow(/Unknown provider/);
    expect(() => parseModelSpec("no-separator")).toThrow(/Invalid model spec/);
  });
});

describe("loadEnvFiles", () => {
  it("loads .env.local into process.env without overwriting existing values", () => {
    const dir = mkdtempSync(join(tmpdir(), "agents-env-"));
    const key = "AGENTS_TEST_ENV_KEY";
    try {
      writeFileSync(join(dir, ".env.local"), `${key}=from-file\n`);
      const original = process.env[key];
      delete process.env[key];
      try {
        loadEnvFiles(dir);
        expect(process.env[key]).toBe("from-file");
      } finally {
        if (original === undefined) delete process.env[key];
        else process.env[key] = original;
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("loadRepoContext", () => {
  it("includes task-relevant authored documentation and source after the alignment contract", () => {
    const root = mkdtempSync(join(tmpdir(), "agents-context-"));
    try {
      writeFileSync(join(root, "AGENT.md"), "# Repository alignment\n\nFollow the change contract.\n");
      const knowledgeDirectory = join(root, "docs", "knowledge-base");
      mkdirSync(knowledgeDirectory, { recursive: true });
      writeFileSync(join(knowledgeDirectory, "architecture.md"), "# Architecture\n\nGenerated navigation.\n");
      const specDirectory = join(root, "docs", "specs");
      mkdirSync(specDirectory, { recursive: true });
      writeFileSync(join(specDirectory, "automation-run-ingestion.md"), "# Ingestion contract\n\nStable event IDs are required.\n");
      const sourceDirectory = join(root, "supabase", "functions", "ingest-run");
      mkdirSync(sourceDirectory, { recursive: true });
      writeFileSync(join(sourceDirectory, "index.ts"), "export function ingestWorkflowRun() {}\n");
      const indexDirectory = join(root, "outputs", "repo-index");
      mkdirSync(indexDirectory, { recursive: true });
      writeFileSync(join(indexDirectory, "files.json"), JSON.stringify({ records: [{ path: "supabase/functions/ingest-run/index.ts", kind: "function", exports: ["ingestWorkflowRun"] }] }));

      const context = loadRepoContext(root, "Refactor workflow run ingestion");

      expect(context).toContain("## AGENT.md\n# Repository alignment");
      expect(context).toContain("## docs/specs/automation-run-ingestion.md\n# Ingestion contract");
      expect(context).toContain("## supabase/functions/ingest-run/index.ts\nexport function ingestWorkflowRun");
      expect(context.indexOf("## AGENT.md")).toBeLessThan(context.indexOf("## docs/specs/automation-run-ingestion.md"));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("loadConfig", () => {
  it("rejects missing API keys with a clear error", () => {
    expect(() => loadConfig({ ORCHESTRATOR_MODEL: "anthropic/claude-opus-4-8" })).toThrow(/ANTHROPIC_API_KEY/);
    const withAnthropicKey = { ANTHROPIC_API_KEY: "test" };
    expect(() => loadConfig({ ...withAnthropicKey, CODING_MODEL: "deepseek/deepseek-v4-flash" })).toThrow(/DEEPSEEK_API_KEY/);
  });

  it("marks anthropic models as cacheable and deepseek as not", () => {
    const env = { ANTHROPIC_API_KEY: "test", DEEPSEEK_API_KEY: "test" };
    const config = loadConfig(env);
    expect(config.orchestrator.cacheControl).toBe(true);
    expect(config.coder.cacheControl).toBe(false);
  });

  it("validates AGENTS_MAX_ATTEMPTS", () => {
    const base = { ANTHROPIC_API_KEY: "test", DEEPSEEK_API_KEY: "test" };
    expect(() => loadConfig({ ...base, AGENTS_MAX_ATTEMPTS: "0" })).toThrow(/AGENTS_MAX_ATTEMPTS/);
    expect(() => loadConfig({ ...base, AGENTS_MAX_ATTEMPTS: "abc" })).toThrow(/AGENTS_MAX_ATTEMPTS/);
    expect(loadConfig({ ...base, AGENTS_MAX_ATTEMPTS: "3" }).maxAttempts).toBe(3);
  });
});
