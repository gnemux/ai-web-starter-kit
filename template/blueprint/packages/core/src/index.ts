export * from "./ai";
export * from "./auth";
export * from "./billing";
export * from "./payment";
export * from "./providers";

export type ArchivableRecord = { archivedAt: string | null };
export type HistoricalReference<T> = { current: T | null; snapshotLabel: string | null; wasArchived: boolean };

export function isActiveRecord(record: ArchivableRecord) {
  return record.archivedAt === null;
}

export function historicalReferenceLabel(input: { currentLabel: string | null; snapshotLabel: string | null; wasArchived: boolean }, deletedSuffix = "(deleted)") {
  if (input.currentLabel && !input.wasArchived) return input.currentLabel;
  const label = input.snapshotLabel ?? input.currentLabel ?? "Unknown item";
  return `${label} ${deletedSuffix}`;
}
