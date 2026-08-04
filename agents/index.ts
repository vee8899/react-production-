import type { CodingAgentsConfig } from "./config.ts";
import { loadConfig } from "./config.ts";
import { buildCodingAgents } from "./graph.ts";
import { toResult, type CodingAgentsInput, type CodingAgentsResult } from "./state.ts";
import { loadRepoContext } from "./repoContext.ts";

export { loadConfig, parseModelSpec, createModel, DEFAULT_MODELS } from "./config.ts";
export type { CodingAgentsConfig, ConfiguredModel, AgentEnv, AgentRole, ModelSpec, ProviderName } from "./config.ts";
export { loadEnv, loadEnvFiles } from "./env.ts";
export { buildCodingAgents } from "./graph.ts";
export { loadRepoContext } from "./repoContext.ts";
export { parseCodeBlocks, parsePatches, patchTargetFile, applyImplementation, formatPlan } from "./nodes.ts";
export type { CodeBlock } from "./nodes.ts";
export type { CodingAgentsInput, CodingAgentsResult } from "./state.ts";

export function createCodingAgents(config: CodingAgentsConfig) {
  return buildCodingAgents(config);
}

export async function runCodingAgents(
  input: CodingAgentsInput,
  config?: CodingAgentsConfig,
): Promise<CodingAgentsResult> {
  const resolved = config ?? loadConfig();
  const graph = buildCodingAgents(resolved);
  const result = await graph.invoke({
    task: input.task,
    context: input.context ?? "",
  });
  return toResult(result);
}

export async function runCodingAgentsWithRepoContext(
  input: CodingAgentsInput,
  config?: CodingAgentsConfig,
  root = process.cwd(),
): Promise<CodingAgentsResult> {
  return runCodingAgents(
    {
      task: input.task,
      context: input.context ?? loadRepoContext(root),
    },
    config,
  );
}
