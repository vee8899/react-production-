import { env } from "@/utils/env";

type WebhookPayload = Record<string, unknown>;

export const triggerWebhook = async (
  webhookPath: string,
  payload: WebhookPayload
): Promise<void> => {
  const res = await fetch(
    `${env.n8n.baseUrl}/webhook/${webhookPath}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error(`Webhook ${webhookPath} failed: ${res.status}`);
  }
};

export const WEBHOOKS = {
  USER_SIGNUP: "user-signup",
  REPORT_EXPORT: "report-export",
} as const;