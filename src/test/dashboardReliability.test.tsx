import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StatsRow, type DashboardWindowDays } from "@/components/dashboard/StatsRow";
import { Sparkline } from "@/components/dashboard/Sparkline";
import DemoPage from "@/pages/DemoPage";

const { from, invoke } = vi.hoisted(() => ({ from: vi.fn(), invoke: vi.fn() }));
vi.mock("@/api/supabase/client", () => ({ supabase: { from, schema: () => ({ from }), functions: { invoke } } }));
vi.mock("@/hooks/useClient", () => ({ useClient: () => ({
  data: { id: "northstar-client", organization_id: "northstar-org", company_name: "Northstar Realty Demo" },
  isLoading: false, error: null,
}) }));
vi.mock("@/hooks/useRuns", () => ({ useRuns: () => ({ data: [] }) }));
vi.mock("@/components/ui/Nav", () => ({ default: () => <nav>Navigation</nav> }));
vi.mock("@/components/ui/Footer", () => ({ default: () => <footer>Footer</footer> }));

type Response = { data: unknown[] | null; error: Error | null };
const run = { status: "success", duration_ms: 1200, retries: 0, records_processed: 17, records_failed: 0, started_at: new Date().toISOString() };
let mode: "pending" | "success" | "empty" | "failure";
let resolveRequest: (result: Response) => void;
let client: QueryClient;

function WindowedDashboard() {
  const [days, setDays] = useState<DashboardWindowDays>(30);
  return <><StatsRow windowDays={days} onWindowDaysChange={setDays} /><Sparkline windowDays={days} /></>;
}

beforeEach(() => {
  mode = "success";
  client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  invoke.mockReset();
  from.mockReset().mockImplementation((table: string) => {
    const response: Promise<Response> = table === "leads" ? Promise.resolve({ data: [], error: null })
      : mode === "pending" ? new Promise((resolve) => { resolveRequest = resolve; })
      : Promise.resolve({ data: mode === "success" ? [run] : [], error: mode === "failure" ? new Error("Private database detail") : null });
    const chain = {
      select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(),
      then: response.then.bind(response),
    };
    return chain;
  });
});
afterEach(() => { cleanup(); client.clear(); vi.restoreAllMocks(); });

const surfaces = [
  { label: "statistics", render: () => <StatsRow windowDays={30} onWindowDaysChange={() => {}} />, value: "17", empty: "No workflow runs in the last 30 days." },
  { label: "run activity", render: () => <Sparkline windowDays={30} />, value: "1 total", empty: "No workflow activity in the last 30 days." },
  { label: "workflow summary", render: () => <DemoPage />, value: "17", empty: "No workflow runs in the last 30 days." },
];

describe.each(surfaces)("$label with real query hooks", (surface) => {
  it("distinguishes initial loading, failed requests, and retry recovery", async () => {
    mode = "pending";
    render(<QueryClientProvider client={client}>{surface.render()}</QueryClientProvider>);
    expect(screen.getByText(`Loading ${surface.label}...`)).toBeVisible();
    expect(screen.queryByText(surface.value)).not.toBeInTheDocument();
    expect(screen.queryByText(surface.empty)).not.toBeInTheDocument();

    await act(async () => resolveRequest({ data: null, error: new Error("Private database detail") }));
    expect(await screen.findByRole("alert")).toHaveTextContent(`Couldn't load ${surface.label}`);
    expect(screen.queryByText(/Private database detail/)).not.toBeInTheDocument();
    expect(screen.queryByText(surface.empty)).not.toBeInTheDocument();
    mode = "success";
    fireEvent.click(screen.getByRole("button", { name: `Retry ${surface.label}` }));
    expect(await screen.findByText(surface.value)).toBeVisible();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows an empty state only after a successful empty request", async () => {
    mode = "empty";
    render(<QueryClientProvider client={client}>{surface.render()}</QueryClientProvider>);
    expect(await screen.findByText(surface.empty)).toBeVisible();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("retains cached results on failed refresh and removes the notice on recovery", async () => {
    render(<QueryClientProvider client={client}>{surface.render()}</QueryClientProvider>);
    expect(await screen.findByText(surface.value)).toBeVisible();
    mode = "failure";
    await act(async () => { await client.invalidateQueries(); });
    expect(await screen.findByRole("alert")).toHaveTextContent(`Couldn't refresh ${surface.label}. Showing the last available results.`);
    expect(screen.getByText(surface.value)).toBeVisible();
    mode = "success";
    fireEvent.click(screen.getByRole("button", { name: `Retry ${surface.label}` }));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
    expect(screen.getByText(surface.value)).toBeVisible();
  });
});

it("does not display another time window's statistics or chart while the selected window loads or fails", async () => {
  render(<QueryClientProvider client={client}><WindowedDashboard /></QueryClientProvider>);
  expect(await screen.findByText("17")).toBeVisible();
  expect(await screen.findByText("1 total")).toBeVisible();
  mode = "pending";
  fireEvent.click(screen.getByRole("button", { name: "7d" }));
  expect(screen.getByText("Loading statistics...")).toBeVisible();
  expect(screen.getByText("Loading run activity...")).toBeVisible();
  expect(screen.queryByText("17")).not.toBeInTheDocument();
  expect(screen.queryByText("1 total")).not.toBeInTheDocument();
  mode = "failure";
  fireEvent.click(screen.getByRole("button", { name: "90d" }));
  await waitFor(() => expect(screen.getAllByRole("alert")).toHaveLength(2));
  expect(screen.queryByText("17")).not.toBeInTheDocument();
  expect(screen.queryByText("1 total")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "30d" }));
  expect(screen.getByText("17")).toBeVisible();
  expect(screen.getByText("1 total")).toBeVisible();
});

describe("demo event controls", () => {
  it.each(["success", "handler error", "thrown request", "failed invalidation"])("restores controls after %s", async (outcome) => {
    let finish: () => void = () => {};
    invoke.mockImplementation(() => new Promise((resolve, reject) => {
      finish = () => outcome === "thrown request" ? reject(new Error("Private transport detail"))
        : resolve({ error: outcome === "handler error" ? new Error("Private handler detail") : null });
    }));
    render(<QueryClientProvider client={client}><DemoPage /></QueryClientProvider>);
    await screen.findByText("17");
    fireEvent.click(screen.getByRole("button", { name: "New lead received" }));
    expect(screen.getByRole("button", { name: "Processing..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Appointment booked" })).toBeDisabled();
    if (outcome === "failed invalidation") mode = "failure";
    await act(async () => finish());
    await waitFor(() => expect(screen.getByRole("button", { name: "New lead received" })).toBeEnabled());
    expect(screen.getByRole("button", { name: "Appointment booked" })).toBeEnabled();
    expect(invoke).toHaveBeenCalledExactlyOnceWith("demo-event", { body: { event: "new_lead" } });
    expect(screen.getByRole("status")).toHaveTextContent(outcome === "success" ? "was processed through the demo workspace"
      : outcome === "failed invalidation" ? "The event was processed, but the workspace couldn't refresh"
      : "The demo event could not be confirmed");
    expect(screen.queryByText(/Private .* detail/)).not.toBeInTheDocument();
  });
});
