# Environments and secrets

Keep local development, staging, and production separate. The purpose of an environment is to make the target and the consequences of a command obvious before it runs.

## Environment boundaries

| Environment | Purpose | Data policy | Deployment policy |
| --- | --- | --- | --- |
| Local | Feature development and unit/component work | Local or disposable test data | Manual from a developer machine |
| Staging | Migration rehearsals, acceptance testing, and release verification | Non-production test accounts and data | Manual or automated after CI, depending on the hosting provider |
| Production | Real client traffic and data | Real data; treat every operation as irreversible unless a rollback is documented | Approved release only |

Use the local or staging Supabase project for MCP, database, and browser smoke-test operations. The repository intentionally does not support production MCP operations by default.

## Browser environment variables

These variables are safe to expose to the browser because they identify public browser clients or ingestion endpoints:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_POSTHOG_PROJECT_TOKEN=phc_your-project-token
VITE_POSTHOG_HOST=https://us.i.posthog.com
VITE_SENTRY_DSN=https://public-key@o000000.ingest.sentry.io/000000
VITE_SENTRY_ENVIRONMENT=local
VITE_SENTRY_TRACES_SAMPLE_RATE=0
```

Access them through `src/utils/env.ts`. A browser-visible key does not bypass Row Level Security. The PostHog project token and Sentry DSN are also browser-visible by design; they only enable event ingestion for the configured projects.

PostHog analytics is optional. If `VITE_POSTHOG_PROJECT_TOKEN` is missing, the application runs without analytics. If it is present, pageview capture and user identification stay disabled until the authenticated user's saved cookie preferences allow analytics.

Sentry error reporting is optional. If `VITE_SENTRY_DSN` is missing, the application runs without Sentry. If it is present, browser exceptions and React error-boundary failures are reported. Sentry user context uses the Supabase user ID only; email and IP address are stripped before events leave the browser. Set `VITE_SENTRY_TRACES_SAMPLE_RATE` between `0` and `1` only when browser performance tracing is intentionally enabled for that environment.

## Server and platform secrets

Keep these in Supabase Edge Function secrets, n8n credentials, the container platform’s secret store, or GitHub Actions secrets as appropriate:

| Secret or setting | Used by | Never put it in |
| --- | --- | --- |
| `WEBHOOK_SECRET` | `ingest-run` and n8n | Browser variables or workflow exports |
| `ADMIN_INVITE_SECRET` | `invite-client` and operator tooling | Browser code or pull requests |
| `SITE_URL` | Supabase Auth and functions | Hard-coded environment-neutral code |
| `INVITE_REDIRECT_URL` | Supabase Auth invite flow | Client-provided request data |
| n8n credentials and API keys | n8n workflows | Exported workflow JSON or Git |
| Supabase service-role key | Trusted server-side administration | Browser variables or Docker build args |
| GitHub Container Registry token | GitHub Actions | Repository files or logs |

Use `.env.mcp.example` as the template for local/staging MCP configuration. Never commit `.env.local`, `.env.mcp`, service-role keys, or real secret values.

## Secret handling rules

- Use separate values for staging and production.
- Generate long random values; do not reuse passwords or commit them to Git.
- Rotate a secret if it appears in a log, workflow export, screenshot, or pull request.
- Review CI logs to ensure secrets are not echoed.
- Prefer short-lived or scoped credentials when the platform supports them.
- Record where a secret is configured, not the secret itself.

## Environment readiness

Before promoting a release, verify:

- The frontend points to the intended Supabase project.
- Auth Site URL and invite redirect URL match the environment.
- Edge Functions have the correct environment-specific secrets.
- n8n points to the intended ingest endpoint.
- Test accounts belong only to the intended environment.
- Database migrations have been rehearsed in staging.
- Logs and alerts are visible to the person responsible for the release.
