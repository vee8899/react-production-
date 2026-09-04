import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { normalizeServiceSubscription } from "@/lib/serviceSubscriptions";
import { ClientServices } from "@/components/dashboard/ClientServices";

vi.mock("@/hooks/useClientServices", () => ({
  useClientServices: vi.fn(),
}));

vi.mock("@/hooks/useRealEstateMetrics", () => ({
  useRealEstateMetrics: () => ({
    data: { activeLeads: 4, activeListings: 2, upcomingAppointments: 3 },
    isLoading: false,
    error: null,
  }),
}));

import { useClientServices } from "@/hooks/useClientServices";

describe("service subscriptions", () => {
  it("classifies a namespaced real-estate key as a module", () => {
    expect(normalizeServiceSubscription({
      featureKey: "module.real_estate",
      status: "active",
      source: "feature_subscriptions",
    })).toMatchObject({
      isModule: true,
      moduleKey: "real_estate",
    });
  });

  it("keeps a platform integration separate from module subscriptions", () => {
    expect(normalizeServiceSubscription({
      featureKey: "system_integrations",
      status: "active",
      source: "client_services",
    })).toMatchObject({
      isModule: false,
      moduleKey: null,
    });
  });

  it("does not render real-estate metrics without a module subscription", () => {
    vi.mocked(useClientServices).mockReturnValue({
      data: [normalizeServiceSubscription({ featureKey: "system_integrations", status: "active", source: "feature_subscriptions" })],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useClientServices>);

    render(<ClientServices clientId="client-1" organizationId="org-1" />);
    expect(screen.queryByText("Real Estate Operations")).not.toBeInTheDocument();
  });

  it("labels the real-estate subscription as a module", () => {
    vi.mocked(useClientServices).mockReturnValue({
      data: [normalizeServiceSubscription({ featureKey: "module.real_estate", status: "active", source: "feature_subscriptions" })],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useClientServices>);

    render(<ClientServices clientId="client-1" organizationId="org-1" />);
    expect(screen.getByText("Subscribed module")).toBeInTheDocument();
  });

  it("shows real-estate metrics after the module subscription resolves", () => {
    vi.mocked(useClientServices).mockReturnValue({
      data: [normalizeServiceSubscription({ featureKey: "module.real_estate", status: "active", source: "feature_subscriptions" })],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useClientServices>);

    render(<ClientServices clientId="northstar-client" organizationId="northstar-org" />);

    expect(screen.getByText("Real Estate Operations")).toBeInTheDocument();
    expect(screen.getByText("Active Leads")).toBeInTheDocument();
  });
});
