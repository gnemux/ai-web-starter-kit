# Documentation Architecture

## Purpose

This document defines where project decisions belong and which source wins
when files overlap. It prevents issue history, current execution state, stable
architecture, and product evidence from silently overriding one another.

## Document Layers

| Layer | Sources | Owns | Must not own |
| --- | --- | --- | --- |
| Entry | `AGENTS.md`, `README.md` | Short navigation and mandatory-reading entry points | Detailed workflow or product decisions |
| Stable project rules | `context/project.md`, `context/architecture.md`, `context/codex-rules.md`, `context/engineering-decision-rules.md`, `specs/collaboration/agent-orchestration.md` | Stage boundaries, architecture, engineering and agent gates | Per-run evidence or transient Issue status |
| Live execution | Linear issue descriptions, relations, states, and approved comments | Current parent/child selection, dependencies, task-scoped scope/checklist, work state | Durable product/engineering/security acceptance, repository architecture, or secrets |
| Product specification | `specs/<capability>/product-spec.md`, `engineering-spec.md`, `test-plan.md`, `acceptance.md` | Product behavior, engineering contract, tests, and acceptance | Provider credentials or mutable task status |
| Provider operations | `integrations/*`, environment/deployment/Supabase context documents | Provider constraints, environment meaning, deployment and operational procedures | Product business policy |
| Durable evidence | `specs/reference-product/*verification.md`, `evidence-index.md`, version decision documents | What was executed, baseline, result, `not_run`, and risk | New requirements or silent architecture changes |
| Historical memory | Older sections in `context/status.md`, archived issue mirrors, superseded records | Audit trail and chronology | Current task selection or current acceptance truth |

## Authority Rules

1. The live Linear graph is authoritative for current task selection, state,
   parent/child relation, dependency, and task-scoped Issue boundary. Durable
   product, engineering, security, and acceptance contracts remain owned by
   repository context/spec documents. A material conflict requires stopping
   and reconciling both sources; Linear must not silently override them.
   `context/linear.md` is a repository baseline and recovery aid, not a reason
   to override newer live Linear state.
2. Stable architecture and engineering rules must be changed in their owning
   context/spec document. A status entry or Issue comment cannot silently
   redefine them.
3. Active product specifications own intended behavior. Durable verification
   owns observed behavior. When they differ, record the gap; do not rewrite
   evidence to look like the intended result.
4. `context/status.md` is append-oriented project memory. Its final “Next
   Steps” section is current, while older checkpoint wording remains historical
   unless an explicit later checkpoint supersedes it.
5. Chat is never the durable source of truth. Material decisions must be
   written to the owning repository document and, when task-scoped, synced to
   the Linear Issue description.

## Placement Rules

- Keep `AGENTS.md` short. It points to formal rules and does not duplicate
  orchestration details.
- Put a durable cross-product architecture decision in `context/architecture.md`.
- Put a workflow rule in the appropriate collaboration or engineering rule
  document.
- Put a product-specific behavior under that product's `specs/` directory.
- Put a provider fact under `integrations/` or the relevant environment/
  deployment document.
- Put one execution's evidence in a named verification document, then link it
  from the evidence index and add only a concise checkpoint to status.
- Mark unexecuted behavior `not_run`; do not infer it from package shape,
  provider configuration, or a successful adjacent test.
- Treat example product names in compile fixtures as fixtures, not roadmap
  commitments.

## Lifecycle And Maintenance

Every material document change should identify whether it changes a stable
rule, intended behavior, observed evidence, or current execution state. Update
the smallest owning set and link rather than repeat large passages.

`context/status.md` and `context/linear.md` are intentionally retained during
MVP3 for traceability. Their size is a non-blocking maintenance concern. A
future documentation-maintenance change may archive completed status epochs and
generate or validate the Linear mirror, but it must preserve current links and
history. This is not required to accept MVP3 or start the next product.

## GNE-274 Structure Review

The GNE-274 architecture review found and corrected four material sources of
misdirection:

- the root README listed only two of the four reusable packages;
- the architecture document described package responsibilities that no longer
  matched public exports;
- the old wording extended MVP3's in-monorepo package-consumption proof into a
  fixed structure for the next product; the evidence repository, separate clean
  template candidate, and separately generated product repository are now
  distinguished;
- the source order did not explicitly distinguish live Linear execution state
  from its repository mirror.

No unresolved documentation defect blocks the MVP3 conclusion or the creation
of a clean template candidate. The remaining long historical files are a
navigation and maintenance cost, not a correctness or security blocker.
