-- Restore AI billing storage to credit units.
-- Product UI may display uses, but billing tables store credits:
-- 1 CatCare AI use = 10000 credits.

update public.billing_entitlements
set
  unit = 'credit',
  updated_at = now(),
  metadata = metadata || jsonb_build_object('unit_renamed_to_credit', true)
where feature_key = 'ai_tokens'
  and allowance_kind = 'quantity'
  and unit = 'token';

update public.billing_usage_ledger
set
  unit = 'credit',
  metadata = metadata || jsonb_build_object('unit_renamed_to_credit', true)
where feature_key = 'ai_tokens'
  and unit = 'token';

update public.billing_credit_ledger
set
  unit = 'credit',
  metadata = metadata || jsonb_build_object('unit_renamed_to_credit', true)
where unit = 'token'
  and (source_type = 'ai_usage' or reason ilike '%ai%');

update public.billing_entitlements
set
  quantity = quantity * 10000,
  quantity_used = quantity_used * 10000,
  updated_at = now(),
  metadata = metadata || jsonb_build_object('unit_restored_to_credit', true)
where feature_key = 'ai_tokens'
  and allowance_kind = 'quantity'
  and unit = 'credit'
  and quantity < 10000;

update public.billing_usage_ledger
set
  units = units * 10000,
  metadata = metadata || jsonb_build_object('unit_restored_to_credit', true)
where feature_key = 'ai_tokens'
  and unit = 'credit'
  and units < 10000;

update public.billing_credit_ledger
set
  amount = amount * 10000,
  metadata = metadata || jsonb_build_object('unit_restored_to_credit', true)
where unit = 'credit'
  and abs(amount) < 10000;

update public.billing_entitlements
set
  quantity = greatest(10000, round(quantity / 10000) * 10000),
  updated_at = now(),
  metadata = metadata || jsonb_build_object('unit_rounded_to_credit_block', true)
where feature_key = 'ai_tokens'
  and allowance_kind = 'quantity'
  and unit = 'credit'
  and mod(quantity, 10000) <> 0;

update public.billing_entitlements
set
  quantity_used = round(quantity_used / 10000) * 10000,
  updated_at = now(),
  metadata = metadata || jsonb_build_object('used_rounded_to_credit_block', true)
where feature_key = 'ai_tokens'
  and allowance_kind = 'quantity'
  and unit = 'credit'
  and mod(quantity_used, 10000) <> 0;

update public.billing_usage_ledger
set
  units = greatest(10000, round(units / 10000) * 10000),
  metadata = metadata || jsonb_build_object('unit_rounded_to_credit_block', true)
where feature_key = 'ai_tokens'
  and unit = 'credit'
  and mod(units, 10000) <> 0;

update public.billing_credit_ledger
set
  amount = sign(amount) * greatest(10000, round(abs(amount) / 10000) * 10000),
  metadata = metadata || jsonb_build_object('amount_rounded_to_credit_block', true)
where unit = 'credit'
  and mod(abs(amount), 10000) <> 0;
