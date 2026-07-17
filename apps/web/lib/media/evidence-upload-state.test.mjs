import assert from "node:assert/strict";
import test from "node:test";

import { reconcileEvidenceAttachmentCount } from "./evidence-upload-state.ts";

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
