import * as Sentry from "@sentry/react";
import type { Session } from "@supabase/supabase-js";
import { env } from "@/utils/env";

let initialized = false;

export const isSentryConfigured = Boolean(env.sentry.dsn);

export const initSentry = () => {
  if (!env.sentry.dsn || initialized) return;

  Sentry.init({
    dsn: env.sentry.dsn,
    environment: env.sentry.environment,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: env.sentry.tracesSampleRate,
    beforeSend(event) {
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }

      return event;
    },
  });

  initialized = true;
};

export const captureError = (error: unknown, context?: Record<string, unknown>) => {
  if (!initialized) return;

  Sentry.captureException(error, {
    extra: context,
  });
};

export const syncSentryIdentity = (session: Session | null) => {
  if (!initialized) return;

  if (!session?.user) {
    Sentry.setUser(null);
    return;
  }

  Sentry.setUser({ id: session.user.id });
};
