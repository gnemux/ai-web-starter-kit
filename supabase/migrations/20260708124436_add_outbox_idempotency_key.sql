create unique index if not exists outbox_events_idempotency_key_idx
  on public.outbox_events (idempotency_key);
