import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { Database } from "../../../src/types/supabase.ts";
import { createAlertRouteHandler } from "./handler.ts";

Deno.serve(createAlertRouteHandler({
  env: (key) => Deno.env.get(key),
  createClient: (url, key) => createClient<Database>(url, key),
}));
