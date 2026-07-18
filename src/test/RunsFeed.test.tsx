import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { RunsFeed } from "@/components/dashboard/RunsFeed";

vi.mock("@/hooks/useClient", () => ({
  useClient: () => ({ data: { id: "client-1", organization_id: "org-1" } }),
}));

vi.mock("@/hooks/useRuns", () => ({
  useRuns: () => ({
    data: [{
      id: "run-1",
      featureKey: "workflow_automation",
      workflowName: "Lead enrichment",
      status: "error",
      ranAt: "2026-07-18T08:00:00.000Z",
      recordsProcessed: 2,
      recordsFailed: 1,
      durationMs: 4000,
    }],
    isLoading: false,
    error: null,
  }),
}));

describe("RunsFeed", () => {
  it("links each run to its read-only detail route", () => {
    render(<MemoryRouter><RunsFeed /></MemoryRouter>);

    expect(screen.getByRole("link", { name: /lead enrichment/i })).toHaveAttribute("href", "/activity/run-1");
  });
});
