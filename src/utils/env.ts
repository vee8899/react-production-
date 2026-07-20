const required = (key: string): string => {
  const val = import.meta.env[key];
  if (!val) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val;
};

const optional = (key: string): string | undefined => {
  const val = import.meta.env[key];
  return val ? String(val) : undefined;
};

const optionalNumber = (key: string, fallback: number): number => {
  const val = optional(key);
  if (!val) return fallback;

  const parsed = Number(val);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, 0), 1);
};

export const env = {
  supabase: {
    url: required("VITE_SUPABASE_URL"),
    anonKey: required("VITE_SUPABASE_ANON_KEY"),
  },
  posthog: {
    projectToken: optional("VITE_POSTHOG_PROJECT_TOKEN"),
    host: optional("VITE_POSTHOG_HOST") ?? "https://us.i.posthog.com",
  },
  sentry: {
    dsn: optional("VITE_SENTRY_DSN"),
    environment: optional("VITE_SENTRY_ENVIRONMENT") ?? import.meta.env.MODE,
    tracesSampleRate: optionalNumber("VITE_SENTRY_TRACES_SAMPLE_RATE", 0),
  },
} as const;
