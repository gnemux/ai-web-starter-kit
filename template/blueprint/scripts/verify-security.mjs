import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sql = await readFile(path.join(root, "supabase/migrations/20260713155439_foundation_baseline.sql"), "utf8");
const tables = ["user_profiles", "billing_orders", "billing_subscriptions", "billing_entitlements", "billing_credit_ledger", "billing_usage_ledger", "payment_events"];
for (const table of tables) {
  if (!sql.includes(`alter table public.${table} enable row level security`)) throw new Error(`RLS missing for ${table}`);
  if (!sql.includes(`grant all on table public.${table} to service_role`)) throw new Error(`Service role grant missing for ${table}`);
}
for (const table of tables.slice(0, 6)) if (!sql.includes(`owner_read_${table}`)) throw new Error(`Owner read policy missing for ${table}`);
if (!/create policy owner_insert_user_profiles[\s\S]+with check \(auth\.uid\(\) = id\)/.test(sql)) throw new Error("Profile insert ownership guard missing");
if (!/create policy owner_update_user_profiles[\s\S]+using \(auth\.uid\(\) = id\)[\s\S]+with check \(auth\.uid\(\) = id\)/.test(sql)) throw new Error("Profile update transfer guard missing");
if (/create policy[^;]+payment_events/i.test(sql)) throw new Error("Payment events must have no public policy");
if (!sql.includes("set search_path = ''") || !sql.includes("revoke execute on function public.set_updated_at() from public, anon, authenticated")) throw new Error("Trigger function hardening missing");
for (const required of ["idempotency_key", "related_credit_ledger_id", "source_type", "source_id", "metadata", "reserved", "committed", "released", "failed"]) if (!sql.includes(required)) throw new Error(`Foundation semantics missing: ${required}`);
const billingContract = await readFile(path.join(root, "packages/core/src/billing.ts"), "utf8");
for (const status of ["trialing", "active", "past_due", "canceled", "expired", "refunded"]) if (!billingContract.includes(`\"${status}\"`) || !sql.includes(`'${status}'`)) throw new Error(`Subscription status contract drift: ${status}`);
for (const eventType of ["grant", "reserve", "consume", "release", "refund", "expire", "adjustment"]) if (!billingContract.includes(`\"${eventType}\"`) || !sql.includes(`'${eventType}'`)) throw new Error(`Credit event contract drift: ${eventType}`);
for (const name of await readdir(root)) if ([".env.local", ".git", ".vercel"].includes(name)) throw new Error(`Generated private residue present: ${name}`);
const ignores = await readFile(path.join(root, ".gitignore"), "utf8");
for (const expected of ["node_modules/", ".next/", ".turbo/", ".vercel/", ".env.*"]) if (!ignores.includes(expected)) throw new Error(`Repository hygiene ignore missing: ${expected}`);
const config = await readFile(path.join(root, "apps/web/next.config.ts"), "utf8");
for (const header of ["frame-ancestors 'none'", "Referrer-Policy", "X-Content-Type-Options", "Permissions-Policy"]) if (!config.includes(header)) throw new Error(`Security header missing: ${header}`);
const proxy = await readFile(path.join(root, "apps/web/modules/platform/supabase/proxy.ts"), "utf8");
for (const cookieContract of ["request.cookies.getAll()", "response.cookies.set(name, value, options)", "client.auth.getUser()"] ) if (!proxy.includes(cookieContract)) throw new Error(`Session cookie refresh contract missing: ${cookieContract}`);
console.log("Security and foundation SQL boundaries verified");
