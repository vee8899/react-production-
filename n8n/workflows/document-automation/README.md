# Standard document automation contract

Every document workflow should use the same stages and envelope:

1. Select a versioned template by `template_key` and `template_version`.
2. Map approved source fields into `field_values`.
3. Evaluate `conditions` before generation; missing required fields fail safely.
4. Route to `approval` with `mode` `none`, `single`, or `multi`.
5. Generate through a configured provider adapter using `DOCUMENT_PROVIDER_URL`.
6. Store the returned `output_reference` and `output_format` without storing document contents in workflow metadata.
7. Report `workflow_steps`, `entity_refs`, and `status` to the shared runtime.

The template is provider-neutral. Google Docs, PDF, storage, and e-signature providers belong behind the provider adapter and remain credential-free in Git.
