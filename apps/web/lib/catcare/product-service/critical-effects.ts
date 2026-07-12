export type CriticalEffectResult = { ok: true } | { ok: false };

export async function ensureCriticalSubmissionEffects(input: {
  writeAudit: () => Promise<CriticalEffectResult>;
  writeOutbox: () => Promise<CriticalEffectResult>;
}): Promise<CriticalEffectResult> {
  const audit = await input.writeAudit();
  if (!audit.ok) return { ok: false };
  const outbox = await input.writeOutbox();
  return outbox.ok ? { ok: true } : { ok: false };
}
