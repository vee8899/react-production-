import { beforeEach, describe, expect, it, vi } from "vitest";

const sentryMock = vi.hoisted(() => ({
  browserTracingIntegration: vi.fn(() => "browser-tracing"),
  captureException: vi.fn(),
  init: vi.fn(),
  setUser: vi.fn(),
}));

vi.mock("@sentry/react", () => sentryMock);

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
      dsn: "https://public@example.ingest.sentry.io/1",
      environment: "test",
      tracesSampleRate: 0.25,
    },
  },
}));

const loadSentry = async () => import("@/lib/sentry");

describe("sentry error reporting", () => {
  beforeEach(() => {
    vi.resetModules();
    Object.values(sentryMock).forEach((mock) => mock.mockClear());
  });

  it("initializes Sentry with conservative browser defaults", async () => {
    const { initSentry } = await loadSentry();

    initSentry();

    expect(sentryMock.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: "https://public@example.ingest.sentry.io/1",
        environment: "test",
        integrations: ["browser-tracing"],
        tracesSampleRate: 0.25,
      })
    );
  });

  it("strips user email and IP address before sending events", async () => {
    const { initSentry } = await loadSentry();

    initSentry();
    const initConfig = sentryMock.init.mock.calls[0][0];
    const event = {
      user: {
        id: "user-1",
        email: "client@example.com",
        ip_address: "127.0.0.1",
      },
    };

    expect(initConfig.beforeSend(event)).toEqual({
      user: {
        id: "user-1",
      },
    });
  });

  it("captures errors and stores only the Supabase user ID as user context", async () => {
    const { captureError, initSentry, syncSentryIdentity } = await loadSentry();
    const error = new Error("boom");

    initSentry();
    syncSentryIdentity({ user: { id: "user-1", email: "client@example.com" } } as never);
    captureError(error, { componentStack: "stack" });
    syncSentryIdentity(null);

    expect(sentryMock.setUser).toHaveBeenNthCalledWith(1, { id: "user-1" });
    expect(sentryMock.captureException).toHaveBeenCalledWith(error, {
      extra: { componentStack: "stack" },
    });
    expect(sentryMock.setUser).toHaveBeenNthCalledWith(2, null);
  });
});
