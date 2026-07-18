import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabase/client";
import type { Json } from "@/types/supabase";

export type AuditEvent = {
  id: string;
  actorType: string;
  actorId: string | null;
  entityType: string;
  entityId: string | null;
  action: string;
  beforeState: Json | null;
  afterState: Json | null;
  requestId: string | null;
  workflowId: string | null;
  workflowName: string | null;
  createdAt: string;
  runId: string | null;
};

type AuditRow = {
  id: string;
  actor_type: string;
  actor_id: string | null;
  entity_type: string;
  entity_id: string | null;
  action: string;
  before_state: Json | null;
  after_state: Json | null;
  request_id: string | null;
  workflow_id: string | null;
  created_at: string;
};

const getStartIso = (windowDays?: number) => {
  if (!windowDays) return null;
  const start = new Date();
  start.setDate(start.getDate() - windowDays);
  return start.toISOString();
};

const loadWorkflowNames = async (organizationId: string, workflowIds: string[]) => {
  const names = new Map<string, string>();
  if (!workflowIds.length) return names;

  const { data, error } = await supabase
    .from("workflows")
    .select("id, name")
    .eq("organization_id", organizationId)
    .in("id", workflowIds);

  if (error) throw error;
  (data ?? []).forEach((workflow) => names.set(workflow.id, workflow.name));
  return names;
};

const mapAuditRow = (row: AuditRow, workflowNames: Map<string, string>, runId: string | null = null): AuditEvent => ({
  id: row.id,
  actorType: row.actor_type,
  actorId: row.actor_id,
  entityType: row.entity_type,
  entityId: row.entity_id,
  action: row.action,
  beforeState: row.before_state,
  afterState: row.after_state,
  requestId: row.request_id,
  workflowId: row.workflow_id,
  workflowName: row.workflow_id ? workflowNames.get(row.workflow_id) ?? null : null,
  createdAt: row.created_at,
  runId,
});

export const useAuditLog = (organizationId: string | undefined, limit = 8, windowDays?: number) =>
  useQuery({
    queryKey: ["audit-log", organizationId, limit, windowDays],
    enabled: !!organizationId,
    refetchInterval: 30_000,
    queryFn: async (): Promise<AuditEvent[]> => {
      let query = supabase
        .from("audit_log")
        .select("id, actor_type, actor_id, entity_type, entity_id, action, before_state, after_state, request_id, workflow_id, created_at")
        .eq("organization_id", organizationId!)
        .order("created_at", { ascending: false });
      const startIso = getStartIso(windowDays);

      if (startIso) query = query.gte("created_at", startIso);

      const { data, error } = await query.limit(limit);
      if (error) throw error;

      const rows = (data ?? []) as AuditRow[];
      const workflowNames = await loadWorkflowNames(
        organizationId!,
        rows.map((event) => event.workflow_id).filter((id): id is string => !!id),
      );

      return rows.map((row) => mapAuditRow(row, workflowNames));
    },
  });

export const useAuditEvent = (organizationId: string | undefined, eventId: string | undefined) =>
  useQuery({
    queryKey: ["audit-event", organizationId, eventId],
    enabled: !!organizationId && !!eventId,
    queryFn: async (): Promise<AuditEvent | null> => {
      const { data, error } = await supabase
        .from("audit_log")
        .select("id, actor_type, actor_id, entity_type, entity_id, action, before_state, after_state, request_id, workflow_id, created_at")
        .eq("organization_id", organizationId!)
        .eq("id", eventId!)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const row = data as AuditRow;
      const workflowNames = await loadWorkflowNames(
        organizationId!,
        row.workflow_id ? [row.workflow_id] : [],
      );
      let runId: string | null = null;

      if (row.request_id) {
        const { data: run, error: runError } = await supabase
          .from("workflow_runs")
          .select("id")
          .eq("organization_id", organizationId!)
          .eq("event_id", row.request_id)
          .maybeSingle();

        if (runError) throw runError;
        runId = run?.id ?? null;
      }

      return mapAuditRow(row, workflowNames, runId);
    },
  });
