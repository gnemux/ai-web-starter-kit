-- Ensure one entitlement row per trusted source fact and feature.
-- NULL source_id rows remain unrestricted by Postgres unique semantics.
with duplicated_source_entitlements as (
  select
    id,
    row_number() over (
      partition by source_type, source_id, feature_key
      order by created_at asc, id asc
    ) as duplicate_rank
  from public.billing_entitlements
  where source_id is not null
)
delete from public.billing_entitlements
where id in (
  select id
  from duplicated_source_entitlements
  where duplicate_rank > 1
);

alter table public.billing_entitlements
  add constraint billing_entitlements_source_feature_unique
  unique (source_type, source_id, feature_key);
