import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { loadEnv } from "./env.ts";

export type ProviderName = "anthropic" | "deepseek";
export type AgentRole = "orchestrator" | "coder" | "reviewer";

export interface AgentEnv {
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_BASE_URL?: string;
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_BASE_URL?: string;
  ORCHESTRATOR_MODEL?: string;
  CODING_MODEL?: string;
  REVIEWER_MODEL?: string;
  AGENTS_MAX_ATTEMPTS?: string;
}

export interface ModelSpec {
  provider: ProviderName;
  model: string;
}

export const DEFAULT_MODELS = {
  orchestrator: "anthropic/claude-opus-4-8",
  coder: "deepseek/deepseek-v4-flash",
  reviewer: "anthropic/claude-opus-4-8",
} as const;

export const DEFAULT_DEEPSEEK_BASE_URL = "https://api.deepseek.com";

export function parseModelSpec(spec: string): ModelSpec {
  const separator = spec.indexOf("/");
  if (separator <= 0 || separator === spec.length - 1) {
    throw new Error(`Invalid model spec "${spec}". Expected "provider/model-id" (e.g. "deepseek/deepseek-v4-flash").`);
  }
  const provider = spec.slice(0, separator) as ProviderName;
  if (provider !== "anthropic" && provider !== "deepseek") {
    throw new Error(`Unknown provider "${provider}". Supported providers: anthropic, deepseek.`);
  }
  return { provider, model: spec.slice(separator + 1) };
}

export function createModel(spec: ModelSpec | string, env: AgentEnv): ConfiguredModel {
  const resolved = typeof spec === "string" ? parseModelSpec(spec) : spec;
  switch (resolved.provider) {
    case "anthropic":
      if (!env.ANTHROPIC_API_KEY) {
        throw new Error("ANTHROPIC_API_KEY is required for the anthropic provider.");
      }
      return {
        model: new ChatAnthropic({
          model: resolved.model,
          apiKey: env.ANTHROPIC_API_KEY,
          ...(env.ANTHROPIC_BASE_URL ? { anthropicApiUrl: env.ANTHROPIC_BASE_URL } : {}),
        }),
        cacheControl: true,
      };
    case "deepseek":
      if (!env.DEEPSEEK_API_KEY) {
        throw new Error("DEEPSEEK_API_KEY is required for the deepseek provider.");
      }
      return {
        model: new ChatOpenAI({
          model: resolved.model,
          apiKey: env.DEEPSEEK_API_KEY,
          configuration: { baseURL: env.DEEPSEEK_BASE_URL ?? DEFAULT_DEEPSEEK_BASE_URL },
        }),
        cacheControl: false,
      };
  }
}

export interface ConfiguredModel {
  model: BaseChatModel;
  /** Whether the provider supports Anthropic-style prompt caching (cache_control). */
  cacheControl: boolean;
}

export interface CodingAgentsConfig {
  orchestrator: ConfiguredModel;
  coder: ConfiguredModel;
  reviewer: ConfiguredModel;
  maxAttempts: number;
}

export function loadConfig(env: AgentEnv = loadEnv()): CodingAgentsConfig {
  const maxAttempts = Number(env.AGENTS_MAX_ATTEMPTS ?? 2);
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 10) {
    throw new Error(`AGENTS_MAX_ATTEMPTS must be an integer between 1 and 10. Received "${env.AGENTS_MAX_ATTEMPTS}".`);
  }
  return {
    orchestrator: createModel(env.ORCHESTRATOR_MODEL ?? DEFAULT_MODELS.orchestrator, env),
    coder: createModel(env.CODING_MODEL ?? DEFAULT_MODELS.coder, env),
    reviewer: createModel(env.REVIEWER_MODEL ?? DEFAULT_MODELS.reviewer, env),
    maxAttempts,
  };
}
