import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRuns } from "@/hooks/useRuns";

const { from } = vi.hoisted(() => ({ from: vi.fn() }));

vi.mock("@/api/supabase/client", () => ({
  supabase: { from },
}));

describe("useRuns", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const limit = vi.fn().mockResolvedValue({ data: [], error: null });
    const order = vi.fn().mockReturnValue({ limit });
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq });
    from.mockReset();
    from.mockReturnValue({ select });
  });

  it("keeps Northstar's 10-run and 50-run requests in separate cache entries", async () => {
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const first = renderHook(() => useRuns("northstar-client", 10, "northstar-org"), { wrapper });
    await waitFor(() => expect(first.result.current.isSuccess).toBe(true));

    const second = renderHook(() => useRuns("northstar-client", 50, "northstar-org"), { wrapper });
    await waitFor(() => expect(second.result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryData(["runs", "northstar-client", "northstar-org", 10])).toEqual([]);
    expect(queryClient.getQueryData(["runs", "northstar-client", "northstar-org", 50])).toEqual([]);
    expect(from).toHaveBeenCalledTimes(2);
  });
});
