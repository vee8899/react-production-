import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import HomePage from "@/pages/HomePage";

vi.mock("@/components/motion/FadeUp", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/features/IntegrationsShowcase", () => ({
  default: () => <section>03 - INTEGRATIONS</section>,
}));

vi.mock("@/components/features/ROICalculator", () => ({
  default: () => <section>04 - BUSINESS VALUE</section>,
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
  it("combines the intro, process, and proof content into one operating model section", () => {
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("01 - OPERATING MODEL")).toBeInTheDocument();
    expect(screen.queryByText("01 - WHAT WE DO")).not.toBeInTheDocument();
    expect(screen.queryByText("03 - PROCESS")).not.toBeInTheDocument();
    expect(screen.queryByText("04 - BY THE NUMBERS")).not.toBeInTheDocument();

    expect(screen.getByText("Discovery")).toBeInTheDocument();
    expect(screen.getByText("Build")).toBeInTheDocument();
    expect(screen.getByText("Monitor")).toBeInTheDocument();

    expect(screen.getByText("Custom")).toBeInTheDocument();
    expect(screen.getByText("Scoped")).toBeInTheDocument();
    expect(screen.getByText("Visible")).toBeInTheDocument();
    expect(screen.getByText("Supported")).toBeInTheDocument();

    expect(screen.getByText("02 - SERVICES")).toBeInTheDocument();
    expect(container.querySelector("#services")).toBeInTheDocument();
  });
});
