export type CriticalEffectResult = { ok: true } | { ok: false };

export async function ensureCriticalSubmissionEffects(input: {
  writeAudit: () => Promise<CriticalEffectResult>;
  writeNotification: () => Promise<CriticalEffectResult>;
  writeOutbox: () => Promise<CriticalEffectResult>;
}): Promise<CriticalEffectResult> {
  const audit = await input.writeAudit();
  if (!audit.ok) return { ok: false };
  const outbox = await input.writeOutbox();
  if (!outbox.ok) return { ok: false };
  const notification = await input.writeNotification();
  return notification.ok ? { ok: true } : { ok: false };
}
