import { Annotation } from "@langchain/langgraph";
import { z } from "zod";

export const PlanSchema = z.object({
  goal: z.string().describe("One-sentence restatement of the goal."),
  steps: z.array(z.string()).describe("Ordered implementation steps."),
  codingSpec: z.string().describe("Precise, self-contained spec the coding worker should implement."),
  verification: z.array(z.string()).describe("Commands or acceptance checks required before approval."),
  exceptions: z.array(z.string()).describe("Skipped checks, assumptions, limitations, or follow-up ownership. Use an empty array when none apply."),
  documentationStatus: z.enum(["aligned", "decision_required"]).describe("Use decision_required when authored documentation and implementation conflict or the task lacks an explicit product decision."),
});

export type Plan = z.infer<typeof PlanSchema>;

export const ReviewSchema = z.object({
  verdict: z.enum(["approve", "changes"]).describe('"approve" when the implementation is ready, "changes" when revisions are required.'),
  comments: z.array(z.string()).describe("Specific, actionable comments per file or concern."),
  requestedChanges: z.string().describe("Short summary of the changes the coding worker must make."),
});

export type Review = z.infer<typeof ReviewSchema>;

export const StateAnnotation = Annotation.Root({
  task: Annotation<string>,
  context: Annotation<string>({ reducer: (_current, update) => update, default: () => "" }),
  plan: Annotation<string>({ reducer: (_current, update) => update, default: () => "" }),
  blocked: Annotation<boolean>({ reducer: (_current, update) => update, default: () => false }),
  fileContents: Annotation<Record<string, string>>({
    reducer: (current, update) => ({ ...current, ...update }),
    default: () => ({}),
  }),
  summary: Annotation<string>({ reducer: (_current, update) => update, default: () => "" }),
  reviewVerdict: Annotation<"approve" | "changes">({
    reducer: (_current, update) => update,
    default: () => "changes" as const,
  }),
  reviewComments: Annotation<string[]>({ reducer: (current, update) => [...current, ...update], default: () => [] }),
  attempts: Annotation<number>({ reducer: (current, update) => current + update, default: () => 0 }),
  logs: Annotation<string[]>({ reducer: (current, update) => [...current, ...update], default: () => [] }),
});

export type AgentState = typeof StateAnnotation.State;

export interface CodingAgentsInput {
  task: string;
  context?: string;
}

export interface CodingAgentsResult {
  plan: string;
  code: string;
  files: string[];
  summary: string;
  verdict: "approve" | "changes";
  reviewComments: string[];
  attempts: number;
  logs: string[];
}

export function toResult(state: AgentState): CodingAgentsResult {
  const files = Object.keys(state.fileContents);
  return {
    plan: state.plan,
    code: files.map((file) => `# ${file}\n${state.fileContents[file]}`).join("\n\n"),
    files,
    summary: state.summary,
    verdict: state.reviewVerdict,
    reviewComments: state.reviewComments,
    attempts: state.attempts,
    logs: state.logs,
  };
}
