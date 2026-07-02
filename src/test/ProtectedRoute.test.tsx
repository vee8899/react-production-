import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/App";
import { useAuth } from "@/hooks/useAuth";

// Mock the useAuth hook to control auth state
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when authenticated", () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      session: { user: { id: "test" } },
      isLoading: false,
      isAuthenticated: true,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={<ProtectedRoute><div>Dashboard Content</div></ProtectedRoute>}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Dashboard Content")).toBeInTheDocument();
  });

  it("redirects to login when not authenticated", () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      session: null,
      isLoading: false,
      isAuthenticated: false,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><div>Dashboard Content</div></ProtectedRoute>}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders nothing while loading", () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      session: null,
      isLoading: true,
      isAuthenticated: false,
    });

    const { container } = render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={<ProtectedRoute><div>Dashboard Content</div></ProtectedRoute>}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(container.innerHTML).toBe("");
  });
});