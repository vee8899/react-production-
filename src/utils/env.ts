const optional = (key: string, fallback: string): string => {
  const val = import.meta.env[key];
  return val || fallback;
};

export const env = {
  supabase: {
    url: optional("VITE_SUPABASE_URL", "https://placeholder.supabase.co"),
    anonKey: optional("VITE_SUPABASE_ANON_KEY", "placeholder-anon-key"),
  },
} as const;
