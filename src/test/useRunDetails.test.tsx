import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRunDetails } from "@/hooks/useRunDetails";

const { from } = vi.hoisted(() => ({ from: vi.fn() }));

vi.mock("@/api/supabase/client", () => ({
  supabase: { from },
}));

const builder = <T,>(result: T) => {
  const chain = {
    data: (result as { data?: unknown } | null)?.data ?? null,
    error: null,
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    maybeSingle: vi.fn(),
  } as Record<string, ReturnType<typeof vi.fn> | unknown>;
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.order = vi.fn(() => Promise.resolve(result));
  chain.maybeSingle = vi.fn(() => Promise.resolve(result));
  return chain;
};

describe("useRunDetails", () => {
  beforeEach(() => {
    from.mockReset();
  });

  it("loads a tenant-scoped run and summarizes related diagnostics", async () => {
    const runBuilder = builder({
      data: {
        id: "run-1",
        organization_id: "org-1",
        workflow_id: "workflow-1",
        event_id: "event-1",
        feature_key: "workflow_automation",
        status: "error",
        started_at: "2026-07-18T08:00:00.000Z",
        finished_at: "2026-07-18T08:00:04.000Z",
        duration_ms: 4000,
        retries: 1,
        records_processed: 2,
        records_failed: 1,
        error_message: "Provider timed out; token=secret-value",
        correlation_id: "corr-1",
      },
      error: null,
    });
    const workflowBuilder = builder({ data: { id: "workflow-1", name: "Lead enrichment" }, error: null });
    const stepsBuilder = builder({
      data: [{
        id: "step-1",
        step_key: "enrich",
        step_name: "Enrich lead",
        status: "error",
        attempt: 2,
        started_at: null,
        finished_at: null,
        duration_ms: 4000,
        error_message: "Provider timed out",
      }],
      error: null,
    });
    const entitiesBuilder = builder({
      data: [{ entity_type: "lead", action: "updated", source_system: "crm" }],
      error: null,
    });

    from.mockImplementation((table: string) => ({
      workflow_runs: runBuilder,
      workflows: workflowBuilder,
      workflow_steps: stepsBuilder,
      workflow_run_entities: entitiesBuilder,
    })[table]);

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const result = renderHook(() => useRunDetails("run-1", "org-1"), { wrapper });

    await waitFor(() => expect(result.result.current.isSuccess).toBe(true));
    expect(result.result.current.data?.workflowName).toBe("Lead enrichment");
    expect(result.result.current.data?.steps[0].errorMessage).toBe("Provider timed out");
    expect(result.result.current.data?.errorMessage).toBe("Provider timed out; token=[redacted]");
    expect(result.result.current.data?.entitySummaries).toEqual([
      { entityType: "lead", action: "updated", sourceSystem: "crm", count: 1 },
    ]);
    expect(runBuilder.eq).toHaveBeenCalledWith("organization_id", "org-1");
    expect(stepsBuilder.eq).toHaveBeenCalledWith("organization_id", "org-1");
    expect(entitiesBuilder.eq).toHaveBeenCalledWith("organization_id", "org-1");
  });

  it("returns null for a run outside the tenant scope", async () => {
    const runBuilder = builder({ data: null, error: null });
    from.mockReturnValue(runBuilder);

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const result = renderHook(() => useRunDetails("other-run", "org-1"), { wrapper });

    await waitFor(() => expect(result.result.current.isSuccess).toBe(true));
    expect(result.result.current.data).toBeNull();
    expect(runBuilder.eq).toHaveBeenCalledWith("id", "other-run");
    expect(runBuilder.eq).toHaveBeenCalledWith("organization_id", "org-1");
  });
});
