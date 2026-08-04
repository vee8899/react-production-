import type { AIMessageChunk, BaseMessage } from "@langchain/core/messages";
import type { Runnable } from "@langchain/core/runnables";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { z } from "zod";

export interface AgentModel {
  withStructuredOutput(schema: z.ZodTypeAny): Runnable;
  invoke(messages: BaseMessage[]): Promise<AIMessageChunk>;
}

export function toAgentModel(model: BaseChatModel): AgentModel {
  return model as AgentModel;
}
