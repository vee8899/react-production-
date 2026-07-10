# Self-hosted n8n

This deployment is for the private-infrastructure offering. It runs n8n behind Caddy with its own Postgres database. The n8n editor is for operators only; clients use the React dashboard.

## First Deployment

1. Create a DNS record for `N8N_HOST` that points to the server.
2. Copy `.env.example` to `.env` on the host and replace every placeholder. Pin `N8N_VERSION` to a reviewed release before starting.
3. Start the stack:

   ```sh
   docker compose --env-file .env up -d
   ```

4. Create the first n8n owner account over HTTPS.
5. Store `SUPABASE_INGEST_URL` and `WEBHOOK_SECRET` as n8n credentials or variables, not in workflow JSON.
6. Schedule `scripts/backup.sh` off-host and test `scripts/restore.sh` before client launch.

## Operating Rules

- Do not expose port 5678 or Postgres publicly.
- Keep `.env` out of Git and back up the encryption key with the database backup.
- Run `n8n audit` before launch and after meaningful changes.
- Upgrade only after testing the same pinned version in a staging instance.
