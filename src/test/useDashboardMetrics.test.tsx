import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";

const { from } = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock("@/api/supabase/client", () => ({ supabase: { from } }));

const query = (data: unknown[], error: unknown = null) => {
  const result = Promise.resolve({ data, error });
  const chain = { select: vi.fn(), eq: vi.fn(), gte: vi.fn() } as Record<string, unknown>;
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.gte = vi.fn(() => result);
  return chain;
};

describe("useDashboardMetrics", () => {
  beforeEach(() => from.mockReset());

  it("aggregates realistic workflow runs, including retries and failed records", async () => {
    from.mockReturnValue(query([
      { status: "success", duration_ms: 1000, retries: 0, records_processed: 12, records_failed: 0 },
      { status: "error", duration_ms: 3000, retries: 2, records_processed: 4, records_failed: 3 },
      { status: "partial", duration_ms: null, retries: 1, records_processed: 8, records_failed: 2 },
    ]));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    const result = renderHook(() => useDashboardMetrics("org-1", "client-1"), { wrapper });

    await waitFor(() => expect(result.result.current.isSuccess).toBe(true));
    expect(result.result.current.data).toEqual({ totalRuns: 3, successfulRuns: 1, failedRuns: 2, totalRecords: 24, avgDurationMs: 2000, retries: 3, source: "workflow_runs" });
  });

  it("falls back to daily snapshots when the run table has no rows", async () => {
    from.mockImplementation((table: string) => table === "workflow_runs"
      ? query([])
      : query([{ total_runs: 10, successful_runs: 9, failed_runs: 1, total_records: 100, avg_duration_ms: 800 }]));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    const result = renderHook(() => useDashboardMetrics("org-1", "client-1"), { wrapper });

    await waitFor(() => expect(result.result.current.isSuccess).toBe(true));
    expect(result.result.current.data?.source).toBe("analytics_snapshots");
    expect(result.result.current.data?.totalRuns).toBe(10);
  });
});
