import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AcceptInvitePage from "@/pages/AcceptInvitePage";
import { supabase } from "@/api/supabase/client";
import { useAuth } from "@/hooks/useAuth";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/api/supabase/client", () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(),
    },
  },
}));

const renderPage = (initialEntry = "/accept-invite") =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/accept-invite" element={<AcceptInvitePage />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>
    </MemoryRouter>
  );

describe("AcceptInvitePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows an invalid invite state without a verified invite session", () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    renderPage();

    expect(screen.getByText("This invite could not be verified")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to sign in/i })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  it("sets the invited user's password and redirects to the dashboard", async () => {
    const user = userEvent.setup();
    const updateUser = vi.mocked(supabase.auth.updateUser);
    const successfulUpdate = {
      data: { user: { id: "user-id" } },
      error: null,
    } as Awaited<ReturnType<typeof supabase.auth.updateUser>>;
    updateUser.mockResolvedValue(successfulUpdate);

    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { email: "client@example.com" },
    });

    renderPage();

    await user.type(screen.getByLabelText(/new password/i), "strongpass123");
    await user.type(screen.getByLabelText(/confirm password/i), "strongpass123");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /accept invite/i }));

    await waitFor(() => {
      expect(updateUser).toHaveBeenCalledWith({ password: "strongpass123" });
    });

    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
  });
});
