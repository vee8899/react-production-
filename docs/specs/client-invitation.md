# Feature spec: Client invitation

## Purpose

Provision a client’s Auth user, organization, client record, onboarding workspace, feature subscriptions, and visible services through one protected operator flow.

## Boundary

`POST /functions/v1/invite-client` requires `X-Admin-Invite-Secret`. It is not called from browser code.

## Request

The request includes company name, email, plan, vertical key, feature keys, and optional service records. Service status may be `onboarding`, `active`, `paused`, or `cancelled`.

## Provisioning rules

- The Auth invite is sent to `/accept-invite`.
- The database provisioning RPC creates organization, owner membership, client, subscriptions, onboarding, and client services in one transaction.
- A failed database transaction triggers cleanup of the newly invited Auth user.
- Service rows are scoped to both `client_id` and `organization_id`.
- Duplicate service feature types are resolved through the database uniqueness constraint.

## Acceptance criteria

- Invalid methods return `405`.
- Invalid or missing admin secrets return `401`.
- Invalid input returns `400`.
- A successful invite returns organization, client, onboarding, and user IDs.
- A provisioning failure does not leave a partial workspace where cleanup succeeds.
- The invited user can consent, set a password, and reach the dashboard.
