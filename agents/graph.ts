import { END, START, StateGraph } from "@langchain/langgraph";
import type { CodingAgentsConfig } from "./config.ts";
import { makeCoderNode, makeOrchestratorNode, makeReviewerNode } from "./nodes.ts";
import { StateAnnotation, type AgentState } from "./state.ts";
import { toAgentModel } from "./types.ts";

type ReviewRoute = "approve" | "changes" | "stop";
type PlanningRoute = "implement" | "blocked";

export function buildCodingAgents(config: CodingAgentsConfig) {
  const orchestrator = makeOrchestratorNode(toAgentModel(config.orchestrator.model), config.orchestrator.cacheControl);
  const coder = makeCoderNode(toAgentModel(config.coder.model), config.coder.cacheControl);
  const reviewer = makeReviewerNode(toAgentModel(config.reviewer.model), config.reviewer.cacheControl);

  const route = (state: AgentState): ReviewRoute => {
    if (state.reviewVerdict === "approve") return "approve";
    if (state.attempts >= config.maxAttempts) return "stop";
    return "changes";
  };

  const afterPlanning = (state: AgentState): PlanningRoute => state.blocked ? "blocked" : "implement";

  return new StateGraph(StateAnnotation)
    .addNode("orchestrator", orchestrator)
    .addNode("coder", coder)
    .addNode("reviewer", reviewer)
    .addEdge(START, "orchestrator")
    .addConditionalEdges("orchestrator", afterPlanning, {
      implement: "coder",
      blocked: END,
    })
    .addEdge("coder", "reviewer")
    .addConditionalEdges("reviewer", route, {
      approve: END,
      changes: "coder",
      stop: END,
    })
    .compile();
}
