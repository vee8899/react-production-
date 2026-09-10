import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { Database } from "../../../src/types/supabase.ts";
import { createDemoEventHandler } from "./handler.ts";

Deno.serve(createDemoEventHandler({
  env: (key) => Deno.env.get(key),
  createClient: (url, key) => createClient<Database>(url, key),
}));
