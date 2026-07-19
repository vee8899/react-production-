const required = (key: string): string => {
  const val = import.meta.env[key];
  if (!val) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val;
};

export const env = {
  supabase: {
    url: required("VITE_SUPABASE_URL"),
    anonKey: required("VITE_SUPABASE_ANON_KEY"),
  },
} as const;
