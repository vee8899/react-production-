import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabase/client";

export type RunStepDetail = {
  id: string;
  stepKey: string;
  stepName: string;
  status: string;
  attempt: number;
  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number | null;
  errorMessage: string | null;
};

export type RunEntitySummary = {
  entityType: string;
  action: string;
  sourceSystem: string;
  count: number;
};

export type RunDetails = {
  id: string;
  workflowName: string;
  featureKey: string;
  status: "success" | "error" | "partial";
  eventId: string;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  retries: number;
  recordsProcessed: number;
  recordsFailed: number;
  errorMessage: string | null;
  correlationId: string | null;
  steps: RunStepDetail[];
  entitySummaries: RunEntitySummary[];
};

const summarizeEntities = (entities: Array<{ entity_type: string; action: string; source_system: string }>) => {
  const summaries = new Map<string, RunEntitySummary>();
  entities.forEach((entity) => {
    const key = `${entity.entity_type}:${entity.action}:${entity.source_system}`;
    const current = summaries.get(key);
    summaries.set(key, current ? { ...current, count: current.count + 1 } : {
      entityType: entity.entity_type,
      action: entity.action,
      sourceSystem: entity.source_system,
      count: 1,
    });
  });
  return Array.from(summaries.values());
};

const sanitizeDiagnosticMessage = (message: string | null) => message
  ?.replace(/Bearer\s+[^\s]+/gi, "Bearer [redacted]")
  .replace(/\b(api[_-]?key|token|secret|password)\s*[:=]\s*[^\s,;]+/gi, "$1=[redacted]") ?? null;

export const useRunDetails = (runId: string | undefined, organizationId: string | undefined) =>
  useQuery({
    queryKey: ["run-details", organizationId, runId],
    enabled: !!runId && !!organizationId,
    queryFn: async (): Promise<RunDetails | null> => {
      const { data: run, error: runError } = await supabase
        .from("workflow_runs")
        .select("id, organization_id, workflow_id, event_id, feature_key, status, started_at, finished_at, duration_ms, retries, records_processed, records_failed, error_message, correlation_id")
        .eq("id", runId!)
        .eq("organization_id", organizationId!)
        .maybeSingle();

      if (runError) throw runError;
      if (!run) return null;

      const [workflowResult, stepsResult, entitiesResult] = await Promise.all([
        run.workflow_id
          ? supabase
            .from("workflows")
            .select("id, name")
            .eq("id", run.workflow_id)
            .eq("organization_id", organizationId!)
            .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        supabase
          .from("workflow_steps")
          .select("id, step_key, step_name, status, attempt, started_at, finished_at, duration_ms, error_message")
          .eq("workflow_run_id", run.id)
          .eq("organization_id", organizationId!)
          .order("created_at", { ascending: true }),
        supabase
          .from("workflow_run_entities")
          .select("entity_type, action, source_system")
          .eq("workflow_run_id", run.id)
          .eq("organization_id", organizationId!),
      ]);

      if (workflowResult.error) throw workflowResult.error;
      if (stepsResult.error) throw stepsResult.error;
      if (entitiesResult.error) throw entitiesResult.error;

      return {
        id: run.id,
        workflowName: workflowResult.data?.name ?? run.feature_key,
        featureKey: run.feature_key,
        status: run.status,
        eventId: run.event_id,
        startedAt: run.started_at,
        finishedAt: run.finished_at,
        durationMs: run.duration_ms,
        retries: run.retries,
        recordsProcessed: run.records_processed,
        recordsFailed: run.records_failed,
        errorMessage: sanitizeDiagnosticMessage(run.error_message),
        correlationId: run.correlation_id,
        steps: (stepsResult.data ?? []).map((step) => ({
          id: step.id,
          stepKey: step.step_key,
          stepName: step.step_name,
          status: step.status,
          attempt: step.attempt,
          startedAt: step.started_at,
          finishedAt: step.finished_at,
          durationMs: step.duration_ms,
          errorMessage: sanitizeDiagnosticMessage(step.error_message),
        })),
        entitySummaries: summarizeEntities(entitiesResult.data ?? []),
      };
    },
  });
