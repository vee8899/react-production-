import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "@/pages/DashboardPage";
import { useClient } from "@/hooks/useClient";

vi.mock("@/hooks/useClient", () => ({ useClient: vi.fn() }));
vi.mock("@/components/ui/Nav", () => ({ default: () => <nav>Primary navigation</nav> }));
vi.mock("@/components/ui/Footer", () => ({ default: () => <footer>Footer</footer> }));
vi.mock("@/components/ui/SectionHeader", () => ({ default: ({ label }: { label: string }) => <h2>{label}</h2> }));
vi.mock("@/components/dashboard/StatsRow", () => ({ StatsRow: () => <div>42 runs · 39 successful · 3 failed</div> }));
vi.mock("@/components/dashboard/Sparkline", () => ({ Sparkline: () => <div>30-day activity trend</div> }));
vi.mock("@/components/dashboard/ClientServices", () => ({ ClientServices: ({ clientId }: { clientId: string }) => <div>Services for {clientId}</div> }));
vi.mock("@/components/dashboard/RunsFeed", () => ({ RunsFeed: () => <div>Workflow run history</div> }));
vi.mock("@/components/dashboard/AuditTrail", () => ({ AuditTrail: () => <div>Tenant audit trail</div> }));

describe("DashboardPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the complete dashboard shell for a realistic tenant", () => {
    vi.mocked(useClient).mockReturnValue({
      data: { id: "client-1", organization_id: "org-1", company_name: "Northstar Realty" },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useClient>);

    render(<MemoryRouter><DashboardPage /></MemoryRouter>);

    expect(screen.getByText("01 - Dashboard")).toBeInTheDocument();
    expect(screen.getByText("42 runs · 39 successful · 3 failed")).toBeInTheDocument();
    expect(screen.getByText("Services for client-1")).toBeInTheDocument();
    expect(screen.getByText("Workflow run history")).toBeInTheDocument();
    expect(screen.getByText("Tenant audit trail")).toBeInTheDocument();
  });

  it.each([
    ["loading", { data: undefined, isLoading: true, error: null }, "LOADING..."],
    ["error", { data: undefined, isLoading: false, error: new Error("network") }, "Failed to load data. Please refresh."],
    ["empty", { data: undefined, isLoading: false, error: null }, "No data yet. Automations will appear here once workflows run."],
  ])("renders a safe %s state", (_name, result, message) => {
    vi.mocked(useClient).mockReturnValue(result as ReturnType<typeof useClient>);
    render(<MemoryRouter><DashboardPage /></MemoryRouter>);
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.queryByText("42 runs · 39 successful · 3 failed")).not.toBeInTheDocument();
  });

  it("stops before rendering data queries when organization provisioning is incomplete", () => {
    vi.mocked(useClient).mockReturnValue({
      data: { id: "client-1", organization_id: null, company_name: "Northstar Realty" },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useClient>);

    render(<MemoryRouter><DashboardPage /></MemoryRouter>);

    expect(screen.getByText("Your organization setup is incomplete. Please contact the team to finish provisioning.")).toBeInTheDocument();
    expect(screen.queryByText("Workflow run history")).not.toBeInTheDocument();
  });
});
