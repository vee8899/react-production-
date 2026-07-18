import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AuditTrail } from "@/components/dashboard/AuditTrail";

vi.mock("@/hooks/useClient", () => ({
  useClient: () => ({ data: { organization_id: "org-1" } }),
}));

vi.mock("@/hooks/useAuditLog", () => ({
  useAuditLog: () => ({
    data: [{
      id: "event-1",
      actorType: "automation",
      actorId: null,
      entityType: "listing",
      entityId: "listing-1",
      action: "listing_updated",
      beforeState: null,
      afterState: null,
      requestId: "event-ref-1",
      workflowId: "workflow-1",
      workflowName: "Listing notification",
      createdAt: new Date().toISOString(),
      runId: null,
    }],
    isLoading: false,
    error: null,
  }),
}));

describe("AuditTrail", () => {
  it("renders audit events as links to their detail pages", () => {
    render(<MemoryRouter><AuditTrail /></MemoryRouter>);

    expect(screen.getByText("listing updated")).toBeInTheDocument();
    expect(screen.getByText(/automation.*Listing notification/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /listing updated/i })).toHaveAttribute("href", "/audit/event-1");
  });
});
