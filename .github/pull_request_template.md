## Change

Describe the intended behavior, why this scope is necessary, and the authored
specification, ADR, or runbook reviewed. Write `None` when no authored document
applies.

## Scope

- [ ] Application behavior
- [ ] Database or RLS
- [ ] Supabase Edge Function
- [ ] n8n or infrastructure
- [ ] Documentation only

## Proof

- [ ] `npm.cmd run lint`
- [ ] `npm.cmd run test -- --run`
- [ ] `npm.cmd run build`
- [ ] Relevant staging or acceptance checks completed, or the reason they were skipped is recorded below.
- [ ] Authored documentation was updated where approved behavior or operations changed, or no update was needed.

Commands and results:

Skipped checks and reason:

## Exception or documentation drift

- [ ] No conflict between authored documentation and implementation was found.
- [ ] A conflict was found and an explicit decision is recorded below before either source was changed.

Decision, assumption, known limitation, or follow-up owner:

## Safety review

- [ ] No secrets, client data, or credentials were added.
- [ ] Tenant isolation was considered for data-related changes.
- [ ] Database migration and rollback implications were reviewed.
- [ ] Unrelated working-tree changes were left untouched.

Reviewer: confirm the change, proof, and exception sections are complete before approval.
