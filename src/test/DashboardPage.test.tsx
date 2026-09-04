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

  it("shows the dashboard heading for a provisioned Northstar Realty tenant", () => {
    vi.mocked(useClient).mockReturnValue({
      data: { id: "client-1", organization_id: "org-1", company_name: "Northstar Realty" },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useClient>);

    render(<MemoryRouter><DashboardPage /></MemoryRouter>);

    expect(screen.getByText("01 - Dashboard")).toBeInTheDocument();
  });

  it("shows run metrics for a provisioned Northstar Realty tenant", () => {
    vi.mocked(useClient).mockReturnValue({
      data: { id: "northstar-client", organization_id: "northstar-org", company_name: "Northstar Realty" },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useClient>);

    render(<MemoryRouter><DashboardPage /></MemoryRouter>);

    expect(screen.getByText("42 runs · 39 successful · 3 failed")).toBeInTheDocument();
  });

  it("passes the provisioned client to the services panel", () => {
    vi.mocked(useClient).mockReturnValue({
      data: { id: "northstar-client", organization_id: "northstar-org", company_name: "Northstar Realty" },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useClient>);

    render(<MemoryRouter><DashboardPage /></MemoryRouter>);

    expect(screen.getByText("Services for northstar-client")).toBeInTheDocument();
  });

  it("shows workflow history for a provisioned tenant", () => {
    vi.mocked(useClient).mockReturnValue({
      data: { id: "northstar-client", organization_id: "northstar-org", company_name: "Northstar Realty" },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useClient>);

    render(<MemoryRouter><DashboardPage /></MemoryRouter>);

    expect(screen.getByText("Workflow run history")).toBeInTheDocument();
  });

  it("shows the tenant audit trail for a provisioned tenant", () => {
    vi.mocked(useClient).mockReturnValue({
      data: { id: "northstar-client", organization_id: "northstar-org", company_name: "Northstar Realty" },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useClient>);

    render(<MemoryRouter><DashboardPage /></MemoryRouter>);

    expect(screen.getByText("Tenant audit trail")).toBeInTheDocument();
  });

  it("shows a loading state before the tenant record resolves", () => {
    vi.mocked(useClient).mockReturnValue({ data: undefined, isLoading: true, error: null } as ReturnType<typeof useClient>);
    render(<MemoryRouter><DashboardPage /></MemoryRouter>);
    expect(screen.getByText("LOADING...")).toBeInTheDocument();
    expect(screen.queryByText("42 runs · 39 successful · 3 failed")).not.toBeInTheDocument();
  });

  it("shows a refresh message when the tenant record fails to load", () => {
    vi.mocked(useClient).mockReturnValue({ data: undefined, isLoading: false, error: new Error("network") } as ReturnType<typeof useClient>);
    render(<MemoryRouter><DashboardPage /></MemoryRouter>);
    expect(screen.getByText("Failed to load data. Please refresh.")).toBeInTheDocument();
    expect(screen.queryByText("42 runs · 39 successful · 3 failed")).not.toBeInTheDocument();
  });

  it("explains that workflows appear after the tenant has runs", () => {
    vi.mocked(useClient).mockReturnValue({ data: undefined, isLoading: false, error: null } as ReturnType<typeof useClient>);
    render(<MemoryRouter><DashboardPage /></MemoryRouter>);
    expect(screen.getByText("No data yet. Automations will appear here once workflows run.")).toBeInTheDocument();
    expect(screen.queryByText("42 runs · 39 successful · 3 failed")).not.toBeInTheDocument();
  });

  it("stops before rendering data queries when organization provisioning is incomplete", () => {
    vi.mocked(useClient).mockReturnValue({
      data: { id: "northstar-client", organization_id: null, company_name: "Northstar Realty" },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useClient>);

    render(<MemoryRouter><DashboardPage /></MemoryRouter>);

    expect(screen.getByText("Your organization setup is incomplete. Please contact the team to finish provisioning.")).toBeInTheDocument();
    expect(screen.queryByText("Workflow run history")).not.toBeInTheDocument();
  });
});
