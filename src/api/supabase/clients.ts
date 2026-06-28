import { supabase } from "./client";
import type { Tables } from "@/types/supabase";

export const getClientByUserId = async (
  userId: string
): Promise<Tables<"clients"> | null> => {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // no rows returned — client row not yet created
      return null;
    }
    throw error;
  }

  return data;
};