import assert from "node:assert/strict";
import test from "node:test";

import {
  reconcileEvidenceAttachmentCount,
  reconcileSubmittedEvidenceState
} from "./evidence-upload-state.ts";

test("a completed submission reconciles visible count and the submitted file snapshot", () => {
  assert.deepEqual(
    reconcileSubmittedEvidenceState({
      attachmentCount: 1,
      evidenceIds: ["first", "second"],
      uploadedPhotoIndexes: [0]
    }),
    {
      attachmentCount: 1,
      remainingCapacity: 2,
      uploadedIds: ["first"]
    }
  );

  assert.deepEqual(
    reconcileSubmittedEvidenceState({
      attachmentCount: 4,
      evidenceIds: ["submitted"],
      uploadedPhotoIndexes: [0, 1, -1]
    }),
    {
      attachmentCount: 3,
      remainingCapacity: 0,
      uploadedIds: ["submitted"]
    }
  );
});

test("a lost response retry restores the authoritative attachment count", () => {
  assert.equal(
    reconcileEvidenceAttachmentCount(0, {
      alreadyUploaded: true,
      attachmentCount: 1
    }),
    1
  );
});

test("sequential upload acknowledgements advance without double counting", () => {
  const afterDuplicate = reconcileEvidenceAttachmentCount(0, {
    alreadyUploaded: true,
    attachmentCount: 1
  });
  const afterSecond = reconcileEvidenceAttachmentCount(afterDuplicate, {
    alreadyUploaded: false,
    attachmentCount: 2
  });

  assert.equal(afterSecond, 2);
  assert.equal(
    reconcileEvidenceAttachmentCount(afterSecond, {
      alreadyUploaded: true,
      attachmentCount: 2
    }),
    2
  );
});

test("a valid server count replaces stale local state", () => {
  assert.equal(
    reconcileEvidenceAttachmentCount(3, {
      alreadyUploaded: true,
      attachmentCount: 2
    }),
    2
  );
});
