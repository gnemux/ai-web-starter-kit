# Integrations Product Spec

## Goal

MVP2 establishes the provider decision layer for the commercial starter kit. It should let future Billing, Payment, AI, Analytics, Email, Storage, SMS, Auth, Database, and Deploy work choose providers through shared rules instead of one-off module decisions.

## Users

- Developers implementing commercial modules.
- AI agents starting a new provider-related task.
- Reviewers checking whether a provider change belongs in MVP2, MVP3, or MVP4.

## Problem

The project already uses Supabase, PostHog, and Vercel, while Payment, AI, Email, Storage, and SMS are still planned. Without a shared provider matrix, future work can accidentally hard-code SDKs, expose secrets, or blur MVP2 mock/sandbox work with MVP4 real overseas/china rollout.

## Scope

- Define a provider matrix for Auth, Database/BaaS, Analytics, Payment, AI, Email, Storage, SMS, and Deploy/CDN.
- Record which providers are already real, which are sandbox/mock/no-op, and which are reserved for MVP4.
- Define the public/server-only boundary at the planning level.
- Link provider-specific integration documents from a single entry point.

## Non-Goals

- Do not implement real domestic provider integrations.
- Do not replace the existing Supabase Auth/Database or PostHog Analytics paths.
- Do not implement Payment, AI, Email, Storage, or SMS runtime providers in this issue.
- Do not add secrets, real provider keys, account screenshots, or customer data.

## Success Criteria

- A new engineer can read the matrix and know where each provider belongs.
- Reviewer can answer what is real, what is sandbox/mock/no-op, and what waits for MVP4.
- Future provider work has a documented boundary before implementation starts.
- The matrix can be reached from README and integration docs.
