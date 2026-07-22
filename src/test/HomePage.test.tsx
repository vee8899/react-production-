import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import HomePage from "@/pages/HomePage";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: false, isLoading: false, session: null, user: null, signOut: vi.fn() }),
}));

vi.mock("@/components/features/ROICalculator", () => ({
  default: () => <section>05 - BUSINESS VALUE</section>,
}));

describe("HomePage", () => {
  it("communicates the managed operations value proposition", () => {
    const { container } = render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getByText("MANAGED OPERATIONS LAYER")).toBeInTheDocument();
    expect(screen.getByText("Encode how your enterprise works.")).toBeInTheDocument();
    expect(screen.getByText("WORKFLOW EXAMPLES")).toBeInTheDocument();
    expect(screen.getByText("Lead follow-up")).toBeInTheDocument();
    expect(screen.getByText("MODULAR CAPABILITIES")).toBeInTheDocument();
    expect(screen.getByText("HOW WE ENGAGE")).toBeInTheDocument();
    expect(screen.getByText("CONTROL AND VISIBILITY")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /security controls/i })).toHaveAttribute("href", "/security");
    expect(container.querySelector("#modules")).not.toBeInTheDocument();
  });
});
