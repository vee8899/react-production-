import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import HomePage from "@/pages/HomePage";

vi.mock("@/components/motion/FadeUp", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/features/IntegrationsShowcase", () => ({
  default: () => <section>04 - INTEGRATION LAYER</section>,
}));

vi.mock("@/components/features/ROICalculator", () => ({
  default: () => <section>05 - BUSINESS VALUE</section>,
}));

vi.mock("@/components/features/FAQ", () => ({
  default: () => <section>FAQ</section>,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
    session: null,
    user: null,
    signOut: vi.fn(),
  }),
}));

describe("HomePage", () => {
  it("communicates the platform foundation, modular capabilities, and operating model", () => {
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("01 - PLATFORM FOUNDATION")).toBeInTheDocument();
    expect(screen.queryByText("01 - WHAT WE DO")).not.toBeInTheDocument();
    expect(screen.queryByText("03 - PROCESS")).not.toBeInTheDocument();
    expect(screen.queryByText("04 - BY THE NUMBERS")).not.toBeInTheDocument();

    expect(screen.getByText("Configure")).toBeInTheDocument();
    expect(screen.getByText("Orchestrate")).toBeInTheDocument();
    expect(screen.getByText("Operate")).toBeInTheDocument();

    expect(screen.getByText("for operations.")).toBeInTheDocument();
    expect(screen.getAllByText("Modular").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Configurable")).toBeInTheDocument();
    expect(screen.getByText("Multi-tenant")).toBeInTheDocument();
    expect(screen.getByText("Auditable")).toBeInTheDocument();

    expect(screen.getByText("02 - MODULAR CAPABILITIES")).toBeInTheDocument();
    expect(screen.getByText("Talk to an expert →")).toBeInTheDocument();
    expect(container.querySelector("#modules")).toBeInTheDocument();
  });
});
