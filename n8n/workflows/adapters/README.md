# Provider adapter templates

These are disabled-by-default n8n adapter scaffolds for the providers advertised by the platform. They intentionally contain no credentials, account IDs, client data, or secrets.

Adapters:

- Gmail: email intake and follow-up
- Microsoft Outlook: shared inbox and email actions
- WhatsApp Business Cloud: client message updates
- Telegram: operational alerts
- Slack: internal notifications
- Google Calendar: scheduling triggers and appointment actions
- Google Sheets: structured work-data synchronization
- Google Docs: document generation

Configure the provider credential in n8n after import, then connect the adapter to a shared package runtime reporter. Do not activate an adapter until its provider-specific staging acceptance test passes.
