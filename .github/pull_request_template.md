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

- [ ] No documentation drift or contract conflict was found.
- [ ] Factual documentation drift was corrected and the source evidence is recorded below.
- [ ] An authorized behavior change updated its specification and implementation together; the decision is recorded below.
- [ ] An unresolved contract decision remains; dependent work and its owner are identified below.

Decision, assumption, known limitation, or follow-up owner:

## Safety review

- [ ] No secrets, client data, or credentials were added.
- [ ] Tenant isolation was considered for data-related changes.
- [ ] Database migration and rollback implications were reviewed.
- [ ] Unrelated working-tree changes were left untouched.

Reviewer: confirm the change, proof, and exception sections are complete before approval.
