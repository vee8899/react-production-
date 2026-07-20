import { beforeEach, describe, expect, it, vi } from "vitest";

const posthogMock = vi.hoisted(() => ({
  init: vi.fn(),
  capture: vi.fn(),
  identify: vi.fn(),
  opt_in_capturing: vi.fn(),
  opt_out_capturing: vi.fn(),
  reset: vi.fn(),
}));

vi.mock("posthog-js", () => ({ default: posthogMock }));

vi.mock("@/utils/env", () => ({
  env: {
    supabase: {
      url: "https://example.supabase.co",
      anonKey: "anon-key",
    },
    posthog: {
      projectToken: "phc_test",
      host: "https://us.i.posthog.com",
    },
  },
}));

const loadPostHog = async () => import("@/lib/posthog");

describe("posthog analytics", () => {
  beforeEach(() => {
    vi.resetModules();
    Object.values(posthogMock).forEach((mock) => mock.mockClear());
  });

  it("initializes opted out with automatic capture disabled", async () => {
    const { initPostHog } = await loadPostHog();

    initPostHog();

    expect(posthogMock.init).toHaveBeenCalledWith(
      "phc_test",
      expect.objectContaining({
        api_host: "https://us.i.posthog.com",
        autocapture: false,
        capture_pageview: false,
        disable_session_recording: true,
        opt_out_capturing_by_default: true,
      })
    );
  });

  it("captures pageviews only after analytics consent", async () => {
    const { capturePageview, initPostHog, setPostHogAnalyticsConsent } = await loadPostHog();

    initPostHog();
    capturePageview("/dashboard");
    expect(posthogMock.capture).not.toHaveBeenCalled();

    setPostHogAnalyticsConsent(true);
    capturePageview("/dashboard");

    expect(posthogMock.opt_in_capturing).toHaveBeenCalledOnce();
    expect(posthogMock.capture).toHaveBeenCalledWith(
      "$pageview",
      expect.objectContaining({ path: "/dashboard" })
    );
  });

  it("does not identify users without consent and resets identity when consent is revoked", async () => {
    const { initPostHog, setPostHogAnalyticsConsent, syncPostHogIdentity } = await loadPostHog();
    const session = { user: { id: "user-1", email: "client@example.com" } };

    initPostHog();
    syncPostHogIdentity(session as never);
    expect(posthogMock.identify).not.toHaveBeenCalled();

    setPostHogAnalyticsConsent(true);
    syncPostHogIdentity(session as never);
    expect(posthogMock.identify).toHaveBeenCalledWith("user-1", {
      email: "client@example.com",
    });

    setPostHogAnalyticsConsent(false);
    expect(posthogMock.opt_out_capturing).toHaveBeenCalledOnce();
    expect(posthogMock.reset).toHaveBeenCalledOnce();
  });
});
