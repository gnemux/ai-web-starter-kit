# Product Spec: MVP1 Deploy Operations Memory

## Summary

MVP1 Deploy Operations Memory gives the team a repeatable way to record deployments, inspect production health, and keep environment/product configuration rules understandable for future developers and AI agents. It covers `GNE-110`, `GNE-187`, and `GNE-129`.

## User

- Primary user: Repo Owner, release operator, and AI Coding Agent.
- Secondary user: Collaborator developers, future maintainers, and reviewers who need to understand current deployment state without reading chat history.

## Problem

Deployment knowledge is currently split across Vercel, Supabase, PostHog, Linear, local notes, and conversations. Without a repository-owned memory layer, future release checks can confuse Preview and Production, forget blocked smoke test items, or repeat environment decisions that were already made.

## Goals

- Provide a deployment status template for Production and manually created Preview deployments.
- Provide a minimum production monitoring checklist for MVP1.
- Provide environment and product naming rules before more products and provider environments exist.
- Give future AI agents explicit recall and writeback rules for deployment events, smoke tests, monitoring checks, incidents, and environment changes.
- Keep all real secrets and private operational credentials out of repository documents.

## Non-goals

- Do not build a runtime monitoring dashboard.
- Do not integrate Sentry, alert bots, incident paging, payment webhooks, AI providers, or China cloud providers in MVP1.
- Do not create real Production Supabase or PostHog projects through this spec.
- Do not claim a deployment, smoke test, or provider check passed without actual verification.
- Do not store real API keys, service-role keys, tokens, customer data, or private credentials.

## User Journey

```text
deployment or environment event happens
-> operator reports facts or AI inspects available context
-> AI reads deploy memory docs
-> AI summarizes current remembered state
-> AI updates the relevant deployment status, monitoring, or environment matrix section
-> AI records pass / fail / blocked with evidence and next action
-> Repo Owner confirms whether Linear can move forward
```

## Requirements

- `context/deployment-status.md` must explain how to record Preview and Production deployments.
- `context/deployment-status.md` must include smoke test result, known issue, rollback plan, and next action sections.
- `context/production-monitoring.md` must include MVP1 monitoring checks and where to inspect each signal.
- `context/environment-matrix.md` must define `local`, `preview`, and `production` rules.
- `context/environment-matrix.md` must define `app`, `mvp_stage`, `market`, `env`, `version`, and `module` usage.
- AI automation rules must say when to read, summarize, and update these documents.
- All checks must support `pass`, `fail`, `blocked`, and `not_run`.
- Missing facts must be recorded as `blocked` or `unknown`; AI must not infer success.
- Repository examples must use placeholders or non-secret public defaults only.

## Edge States

- Empty: No deployment has been verified yet. Keep templates empty and mark the latest state as `not_run` or `unknown`.
- Loading: Vercel deployment is queued or building. Record `building` and return later with final status.
- Error: Record the failing provider, visible symptom, time, and next owner action. Do not overwrite prior passing checks.
- Permission denied: Record which dashboard or provider requires Repo Owner access.
- Long content: Append dated entries and summarize only the latest state at the top.

## Success Metrics

- Activation: Repo Owner can run a Production smoke test using the repository checklist.
- Retention: Future AI threads can recall current deployment state from repository docs without asking for background already recorded.
- Conversion: Linear deploy issues can move forward based on documented pass / fail / blocked evidence.
- Quality: No secrets are committed, and Preview / Production are not confused in status records.
