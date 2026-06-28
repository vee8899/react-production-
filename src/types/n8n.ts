// n8n API response types

export type N8nWorkflow = {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type N8nWebhookPayload = Record<string, unknown>;