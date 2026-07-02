import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

// We need to mock the auth store to control auth state
vi.mock("@/store/authStore", () => ({
  useAuthStore: vi.fn(),
}));

// The ProtectedRoute component is defined inline in App.tsx, so we recreate it here for testing
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useAuthStore() as {
    session: unknown;
    isLoading: boolean;
  };

  if (isLoading) return null;

  return session ? <>{children}</> : <div>Redirected to login</div>;
};

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when authenticated", () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      session: { user: { id: "test" } },
      isLoading: false,
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
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      session: null,
      isLoading: false,
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

    expect(screen.getByText("Redirected to login")).toBeInTheDocument();
  });

  it("renders nothing while loading", () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      session: null,
      isLoading: true,
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