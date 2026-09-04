import { HumanMessage, SystemMessage, type MessageContent } from "@langchain/core/messages";
import { applyPatch } from "diff";
import type { Plan, Review, AgentState } from "./state.ts";
import { PlanSchema, ReviewSchema } from "./state.ts";
import type { AgentModel } from "./types.ts";

export interface CodeBlock {
  file: string;
  language: string;
  code: string;
}

const CODE_BLOCK_RE = /```([a-zA-Z0-9_+-]+)?(?:\s+file:(\S+))?\n([\s\S]*?)```/g;
const DIFF_BLOCK_RE = /```diff\n([\s\S]*?)```/g;

export function parseCodeBlocks(content: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  for (const match of content.matchAll(CODE_BLOCK_RE)) {
    const language = (match[1] ?? "text").trim();
    const file = (match[2] ?? "").trim();
    blocks.push({ file, language, code: match[3] });
  }
  return blocks;
}

export function parsePatches(content: string): string[] {
  const patches: string[] = [];
  for (const match of content.matchAll(DIFF_BLOCK_RE)) {
    patches.push(match[1]);
  }
  return patches;
}

export function patchTargetFile(patch: string): string | null {
  const lines = patch.split("\n");
  for (const line of lines) {
    const added = line.match(/^\+\+\+\s+(?:b\/)?(.+)$/);
    if (added) return added[1].trim();
  }
  for (const line of lines) {
    const removed = line.match(/^---\s+(?:a\/)?(.+)$/);
    if (removed) return removed[1].trim();
  }
  return null;
}

/**
 * Apply the worker's response (full files and/or ```diff patches) on top of
 * the current implementation. Returns only the changed files.
 */
export function applyImplementation(
  content: string,
  current: Record<string, string>,
): { updates: Record<string, string>; logs: string[] } {
  const updates: Record<string, string> = {};
  const logs: string[] = [];

  for (const patch of parsePatches(content)) {
    const target = patchTargetFile(patch);
    if (!target || !(target in current)) {
      logs.push(`coder: skipped patch for unknown file "${target ?? "?"}"`);
      continue;
    }
    try {
      const applied = applyPatch(current[target], patch);
      if (typeof applied === "string") {
        updates[target] = applied;
        logs.push(`coder: applied patch to ${target}`);
      } else {
        logs.push(`coder: patch for ${target} did not apply cleanly`);
      }
    } catch {
      logs.push(`coder: patch for ${target} could not be parsed`);
    }
  }

  for (const block of parseCodeBlocks(content)) {
    if (block.language === "diff") continue;
    const key = block.file || `output-${Object.keys(updates).length + 1}.txt`;
    updates[key] = block.code;
    if (block.file) logs.push(`coder: rewrote ${block.file}`);
  }

  return { updates, logs };
}

function systemMessage(text: string, cacheControl: boolean): SystemMessage {
  if (!cacheControl) return new SystemMessage(text);
  return new SystemMessage({
    content: [{ type: "text", text, cache_control: { type: "ephemeral" } }] as unknown as MessageContent,
  });
}

export function formatPlan(plan: Plan): string {
  return [
    `Goal: ${plan.goal}`,
    "",
    "Steps:",
    ...plan.steps.map((step, index) => `${index + 1}. ${step}`),
    "",
    "Coding spec:",
    plan.codingSpec,
  ].join("\n");
}

const ORCHESTRATOR_SYSTEM_PROMPT = [
  "You are the orchestrator of a small coding multi-agent system.",
  "You receive a task and repository context. Produce a clear, decomposed plan",
  "with an unambiguous coding spec that a single coding worker will implement.",
  "Treat AGENT.md in the repository context as the change-control contract.",
  "Scope the work precisely, include relevant verification, and identify assumptions",
  "or skipped checks. If authored documentation conflicts with implementation, stop",
  "and state the explicit decision required; do not silently choose a source of truth.",
  "Do not write the implementation yourself.",
].join("\n");

const CODER_SYSTEM_PROMPT = [
  "You are a fast, precise coding worker. Implement exactly the coding spec you",
  "are given.",
  "",
  "First pass: respond with the full implementation using fenced code blocks.",
  "Each block must start with a language tag and a `file:` annotation, for example:",
  "",
  "```ts file:src/example.ts",
  "// implementation",
  "```",
  "",
  "Revision passes: only include files that changed. Prefer a `git diff` patch",
  "for partial edits inside an existing file, for example:",
  "",
  "```diff",
  "--- a/src/example.ts",
  "+++ b/src/example.ts",
  "@@ -1,3 +1,4 @@",
  " ...",
  "+// added line",
  "```",
  "",
  "or rewrite the full file if that is cleaner. Keep the diff minimal and",
  "consistent with the spec and the AGENT.md change-control contract. Do not",
  "broaden scope or resolve an authored-documentation conflict by guessing. If",
  "the spec is impossible, underspecified, or has unresolved drift, state the",
  "blocker instead of writing an implementation.",
].join("\n");

const REVIEWER_SYSTEM_PROMPT = [
  "You are a strict code reviewer. Review the coding worker's implementation",
  "against the orchestrator's plan, spec, and AGENT.md change-control contract.",
  "Return \"approve\" only when the implementation is correct, complete, and",
  "matches the spec with relevant verification and exceptions accounted for.",
  "Return \"changes\" for an unresolved documentation conflict, unexplained",
  "scope expansion, or missing required verification evidence. Comments must",
  "identify the concern, affected file or evidence, and the action needed; do",
  "not give generic compliance feedback.",
].join("\n");

export function makeOrchestratorNode(model: AgentModel, cacheControl = false) {
  const structured = model.withStructuredOutput(PlanSchema);
  return async (state: AgentState): Promise<Partial<AgentState>> => {
    const messages = [
      systemMessage(ORCHESTRATOR_SYSTEM_PROMPT, cacheControl),
      new HumanMessage(`Task:\n${state.task}\n\nRepository context:\n${state.context}`),
    ];
    const plan = (await structured.invoke(messages)) as Plan;
    return {
      plan: formatPlan(plan),
      logs: [`orchestrator: planned ${plan.steps.length} step(s)`],
    };
  };
}

export function makeCoderNode(model: AgentModel, cacheControl = false) {
  return async (state: AgentState): Promise<Partial<AgentState>> => {
    const isRevision = Object.keys(state.fileContents).length > 0;
    const current = isRevision
      ? Object.entries(state.fileContents).map(([file, content]) => `### ${file}\n${content}`).join("\n\n")
      : "No previous implementation exists yet.";
    const feedback =
      state.reviewComments.length > 0
        ? `## Review feedback to address\n${state.reviewComments.map((comment) => `- ${comment}`).join("\n")}`
        : "";
    const messages = [
      systemMessage(CODER_SYSTEM_PROMPT, cacheControl),
      new HumanMessage([`Plan:\n${state.plan}`, "", "## Current implementation", current, feedback].join("\n")),
    ];
    const raw = await model.invoke(messages);
    const content = typeof raw.content === "string" ? raw.content : JSON.stringify(raw.content);
    const { updates, logs } = applyImplementation(content, state.fileContents);
    return {
      fileContents: updates,
      summary: content.slice(0, 2000),
      logs,
    };
  };
}

export function makeReviewerNode(model: AgentModel, cacheControl = false) {
  const structured = model.withStructuredOutput(ReviewSchema);
  return async (state: AgentState): Promise<Partial<AgentState>> => {
    const implementation = Object.entries(state.fileContents)
      .map(([file, content]) => `### ${file}\n${content}`)
      .join("\n\n");
    const messages = [
      systemMessage(REVIEWER_SYSTEM_PROMPT, cacheControl),
      new HumanMessage(
        [
          `Plan:\n${state.plan}`,
          "",
          `Implementation files:\n${Object.keys(state.fileContents).length > 0 ? Object.keys(state.fileContents).map((file) => `- ${file}`).join("\n") : "- (none)"}`,
          "",
          `Implementation:\n${implementation || "(empty)"}`,
          "",
          state.reviewComments.length > 0
            ? `Previous review comments (verify they were addressed):\n${state.reviewComments.map((comment) => `- ${comment}`).join("\n")}`
            : "First review pass.",
        ].join("\n"),
      ),
    ];
    const review = (await structured.invoke(messages)) as Review;
    return {
      reviewVerdict: review.verdict,
      reviewComments: review.comments,
      summary: review.requestedChanges,
      attempts: 1,
      logs: [`reviewer: ${review.verdict} (${review.comments.length} comment(s))`],
    };
  };
}
