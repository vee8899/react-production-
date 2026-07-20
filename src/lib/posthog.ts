import posthog from "posthog-js";
import type { PostHogConfig } from "posthog-js";
import type { Session } from "@supabase/supabase-js";
import { env } from "@/utils/env";

let initialized = false;
let identifiedUserId: string | null = null;
let analyticsConsentGranted = false;

export const isPostHogConfigured = Boolean(env.posthog.projectToken);
export const posthogClient = posthog;

export const initPostHog = () => {
  if (!env.posthog.projectToken || initialized) return null;

  const config: Partial<PostHogConfig> = {
    api_host: env.posthog.host,
    defaults: "2026-05-30",
    capture_pageview: false,
    autocapture: false,
    disable_session_recording: true,
    opt_out_capturing_by_default: true,
  };

  posthog.init(env.posthog.projectToken, config);
  initialized = true;
  return posthog;
};

export const setPostHogAnalyticsConsent = (granted: boolean) => {
  analyticsConsentGranted = granted;
  if (!initialized) return;

  if (granted) {
    posthog.opt_in_capturing();
    return;
  }

  posthog.opt_out_capturing();
  if (identifiedUserId) {
    posthog.reset();
    identifiedUserId = null;
  }
};

export const capturePageview = (path: string) => {
  if (!initialized || !analyticsConsentGranted) return;

  posthog.capture("$pageview", {
    $current_url: window.location.href,
    path,
  });
};

export const syncPostHogIdentity = (session: Session | null) => {
  if (!initialized) return;

  const user = session?.user;
  if (!user || !analyticsConsentGranted) {
    if (identifiedUserId) {
      posthog.reset();
      identifiedUserId = null;
    }
    return;
  }

  if (identifiedUserId === user.id) return;

  posthog.identify(user.id, {
    email: user.email,
  });
  identifiedUserId = user.id;
};
