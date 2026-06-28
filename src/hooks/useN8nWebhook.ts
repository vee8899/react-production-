import { useState } from "react";
import { triggerWebhook } from "@/api/n8n/webhooks";

export const useN8nWebhook = (webhookPath: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trigger = async (payload: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      await triggerWebhook(webhookPath, payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return { trigger, loading, error };
};