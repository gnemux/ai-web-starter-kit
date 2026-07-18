import assert from "node:assert/strict";
import test from "node:test";

import {
  getBoundedImageDimensions,
  validateClientImageSelection
} from "./client-image.ts";

test("client image dimensions preserve aspect ratio and never upscale", () => {
  assert.deepEqual(getBoundedImageDimensions(4032, 3024, 1600), {
    height: 1200,
    width: 1600
  });
  assert.deepEqual(getBoundedImageDimensions(800, 1200, 1600), {
    height: 1200,
    width: 800
  });
});

test("client selection accepts a 15 MB phone original and rejects larger input", () => {
  const maxBytes = 15 * 1024 * 1024;

  assert.equal(
    validateClientImageSelection({ size: maxBytes, type: "image/jpeg" }, maxBytes),
    null
  );
  assert.match(
    validateClientImageSelection(
      { size: maxBytes + 1, type: "image/jpeg" },
      maxBytes
    ),
    /15 MB/
  );
  assert.match(
    validateClientImageSelection({ size: 100, type: "image/gif" }, maxBytes),
    /JPG、PNG 或 WebP/
  );
});

test("client selection accepts localized error messages without changing limits", () => {
  const maxBytes = 15 * 1024 * 1024;
  const messages = {
    oversizedPhoto: "Each photo must be no larger than {megabytes} MB.",
    unsupportedPhoto: "Only JPG, PNG, or WebP photos are supported."
  };

  assert.equal(
    validateClientImageSelection(
      { size: maxBytes + 1, type: "image/jpeg" },
      maxBytes,
      messages
    ),
    "Each photo must be no larger than 15 MB."
  );
  assert.equal(
    validateClientImageSelection(
      { size: 100, type: "image/gif" },
      maxBytes,
      messages
    ),
    "Only JPG, PNG, or WebP photos are supported."
  );
});
