# Integrations Test Plan

## Documentation Checks

Run:

```bash
rg -n "provider-matrix|Provider Matrix" README.md context integrations specs
rg -n "Auth|Database/BaaS|Analytics|Payment|AI|Email|Storage|SMS|Deploy/CDN" integrations/provider-matrix.md
```

Expected:

- The matrix is reachable from repository docs.
- All required provider classes are present.

## Secret Hygiene Checks

Run:

```bash
rg -n "sk_|service_role|webhook secret|api key|token|password|secret key" README.md context integrations specs .env.example
```

Expected:

- Results are only placeholder/rule text, not real credentials.
- No real secret value, private token, service-role key, webhook secret, or provider payload appears.

## Runtime Regression Smoke

Even documentation-only changes should not hide accidental runtime edits. Start the app and verify:

- `/` loads.
- `/login` loads.
- `/dashboard` keeps the existing protected-route behavior while signed out.
- `/account` keeps the existing protected-route behavior while signed out.

## GNE-180 Verification Log

Record actual command results in the PR body. If a check is not run, explain why.
