const optional = (key: string, fallback: string): string => {
  const val = import.meta.env[key];
  return val || fallback;
};

export const env = {
  supabase: {
    url: optional("VITE_SUPABASE_URL", "https://iutycpnqlzxovffctjyz.supabase.co"),
    anonKey: optional("VITE_SUPABASE_ANON_KEY", "sb_publishable_VJaP1tog1UmGd19mcUdTOw_LSRzDlrG"),
  },
} as const;
