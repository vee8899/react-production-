import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "@/pages/LoginPage";
import { supabase } from "@/api/supabase/client";

vi.mock("@/api/supabase/client", () => ({
  supabase: { auth: { signInWithPassword: vi.fn() } },
}));

const renderPage = () => render(
  <MemoryRouter initialEntries={["/login"]}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<div>Dashboard</div>} />
    </Routes>
  </MemoryRouter>
);

describe("LoginPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects malformed credentials without calling Supabase", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText("Email"), "client@example.com");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(screen.getByText("Too small: expected string to have >=8 characters")).toBeInTheDocument();
    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it("signs in and navigates only after authentication succeeds", async () => {
    const user = userEvent.setup();
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({ data: { user: null, session: null }, error: null } as never);
    renderPage();
    await user.type(screen.getByLabelText("Email"), "client@example.com");
    await user.type(screen.getByLabelText("Password"), "correct-horse");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: "client@example.com", password: "correct-horse" }));
    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
  });

  it("keeps the user on the form and surfaces provider errors", async () => {
    const user = userEvent.setup();
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({ data: { user: null, session: null }, error: new Error("Invalid login credentials") } as never);
    renderPage();
    await user.type(screen.getByLabelText("Email"), "client@example.com");
    await user.type(screen.getByLabelText("Password"), "correct-horse");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("Invalid login credentials")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });
});
