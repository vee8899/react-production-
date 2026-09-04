import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import SentryExamplePage from "@/pages/SentryExamplePage";

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

vi.mock("@/lib/sentry", () => ({
  isSentryConfigured: true,
  captureError: vi.fn(),
  initSentry: vi.fn(),
  syncSentryIdentity: vi.fn(),
}));

vi.mock("@/utils/env", () => ({
  env: {
    supabase: {
      url: "https://example.supabase.co",
      anonKey: "anon-key",
    },
    posthog: {
      projectToken: undefined,
      host: "https://us.i.posthog.com",
    },
    sentry: {
      dsn: "https://0f412154dc0f9398b47fa3c64e7723ab@o4511761161519104.ingest.us.sentry.io/4511761192321024",
      environment: "test",
      tracesSampleRate: 0,
    },
  },
}));

describe("SentryExamplePage", () => {
  it("identifies the page as an active Sentry verification screen", () => {
    render(
      <MemoryRouter>
        <SentryExamplePage />
      </MemoryRouter>
    );

    expect(screen.getByText("Sentry Verification Page")).toBeInTheDocument();
    expect(screen.getByText("Configured & Active")).toBeInTheDocument();
  });

  it("offers both uncaught and manual exception verification actions", () => {
    render(
      <MemoryRouter>
        <SentryExamplePage />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: /trigger uncaught exception/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /capture exception manually/i })).toBeInTheDocument();
  });

  it("sends a manual exception when the operator selects that action", async () => {
    const user = userEvent.setup();
    const { captureError } = await import("@/lib/sentry");

    render(
      <MemoryRouter>
        <SentryExamplePage />
      </MemoryRouter>
    );

    const manualBtn = screen.getByRole("button", { name: /capture exception manually/i });
    await user.click(manualBtn);

    expect(captureError).toHaveBeenCalledTimes(1);
  });
});
