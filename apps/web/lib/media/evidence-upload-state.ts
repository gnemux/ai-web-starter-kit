export type EvidenceUploadAcknowledgement = {
  alreadyUploaded?: boolean;
  attachmentCount?: number;
};

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
