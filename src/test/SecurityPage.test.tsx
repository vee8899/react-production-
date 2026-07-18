import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import SecurityPage from "@/pages/SecurityPage";

vi.mock("@/components/motion/FadeUp", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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

describe("SecurityPage", () => {
  it("shows current controls, deployment qualifiers, and a diligence CTA", () => {
    render(
      <MemoryRouter>
        <SecurityPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Govern every workflow." })).toBeInTheDocument();
    expect(screen.getByText("Implemented in the current product")).toBeInTheDocument();
    expect(screen.getByText("Organization-scoped access and tenant data boundaries")).toBeInTheDocument();
    expect(screen.getByText("Deployment-dependent")).toBeInTheDocument();
    expect(screen.getByText(/Hosting, retention, access review, and recovery commitments/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /talk to an expert/i })).toHaveAttribute("href", expect.stringContaining("mailto:"));
  });
});
