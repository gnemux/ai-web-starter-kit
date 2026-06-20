# Test Plan: Deploy Operations Memory

## Unit Tests

- Not applicable. This is a documentation and process automation change.

## Integration Tests

- Not applicable. No runtime integration behavior changes.

## Browser / E2E Checks

- Not applicable. No UI behavior changes.

## Manual Verification

- Check `context/deployment-status.md` has a latest status section, Preview and Production templates, smoke test table, known issues, rollback plan, and next actions.
- Check `context/production-monitoring.md` has MVP1 monitoring checks with owner, inspection location, expected result, and failure action.
- Check `context/environment-matrix.md` has local / preview / production rules and multi-product naming rules.
- Check `specs/deploy/engineering-spec.md` tells AI when to recall and update deploy memory.
- Check `AGENTS.md` and `context/codex-rules.md` point future AI agents to deploy memory docs.
- Check `integrations/vercel.md` links the deploy memory docs.
- Run `git diff --check`.

## Regression Risks

- Future agents may still rely on chat history instead of repository memory if trigger rules are too vague.
- Operators may record successful Vercel deploys as full smoke test success; checklist wording must keep provider checks separate.
- Environment variable records could leak secrets if docs do not repeatedly say to record key status only, not values.
