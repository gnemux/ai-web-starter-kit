# Test Plan: Collaboration Workflow And AI Guardrails

## Unit Tests

- Not applicable. This is a documentation and process-rule change.

## Integration Tests

- Runtime application integration is not applicable for documentation-only
  workflow changes.
- Agent orchestration changes require a live Linear read-only simulation that
  proves parent selection, child fallback order, dependency state, exact
  `parentId`, and zero mutations.

## Browser / E2E Checks

- Not applicable. No UI behavior changes.

## Manual Verification

- Check `specs/collaboration/product-spec.md` describes developer, owner, AI, GitHub, Vercel, and Linear responsibilities.
- Check `specs/collaboration/engineering-spec.md` gives AI-specific branch handling rules.
- Check `AGENTS.md` instructs future agents to inspect branch state and avoid direct `main` edits.
- Check `context/codex-rules.md` provides a concrete branch safety checklist before edits.
- Check `context/codex-rules.md` requires result plus next-step guidance after key workflow actions.
- Check `specs/collaboration/engineering-spec.md` documents AI-created PR body expectations.
- Check `specs/collaboration/product-spec.md` and `specs/collaboration/engineering-spec.md` document `Create a merge commit` as the default for non-owner collaborator PRs while Vercel Hobby commit-author checks apply.
- Check `specs/collaboration/engineering-spec.md` documents the owner-authored no-op trigger commit remediation for already-reviewed PRs that were merged with a blocked contributor-authored deployment commit.
- Check `.github/pull_request_template.md` no longer contains a default Supabase-only checklist.
- Check `context/status.md` records the documentation update.
- Parse `.codex/config.toml` and `.codex/agents/*.toml`; confirm three agents,
  `max_depth = 1`, and read-only Terra Reviewer.
- Run the simulation in `specs/collaboration/agent-orchestration.md` and confirm
  it selects one child, leaves the parent open, and does not enter the next
  child.

## Regression Risks

- Future AI agents may skip relevant specs if task routing is unclear; `AGENTS.md` and `context/codex-rules.md` must remain explicit.
- GitHub branch rules may still be unenforced under the current free personal private-repo setup, so process discipline remains required.
