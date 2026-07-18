export type EvidenceUploadAcknowledgement = {
  alreadyUploaded?: boolean;
  attachmentCount?: number;
};

export function reconcileSubmittedEvidenceState({
  attachmentCount,
  evidenceIds,
  uploadedPhotoIndexes
}: {
  attachmentCount: number;
  evidenceIds: readonly string[];
  uploadedPhotoIndexes: readonly number[];
}) {
  const uploadedIds = uploadedPhotoIndexes
    .filter((index) => Number.isInteger(index) && index >= 0 && index < evidenceIds.length)
    .map((index) => evidenceIds[index]);
  const boundedAttachmentCount = Math.min(Math.max(attachmentCount, 0), 3);

  return {
    attachmentCount: boundedAttachmentCount,
    remainingCapacity: 3 - boundedAttachmentCount,
    uploadedIds
  };
}

export function reconcileEvidenceAttachmentCount(
  currentCount: number,
  acknowledgement: EvidenceUploadAcknowledgement
) {
  const authoritativeCount = acknowledgement.attachmentCount;

  if (
    authoritativeCount !== undefined &&
    Number.isInteger(authoritativeCount) &&
    authoritativeCount >= 0 &&
    authoritativeCount <= 3
  ) {
    return authoritativeCount;
  }

  return acknowledgement.alreadyUploaded
    ? currentCount
    : Math.min(currentCount + 1, 3);
}
