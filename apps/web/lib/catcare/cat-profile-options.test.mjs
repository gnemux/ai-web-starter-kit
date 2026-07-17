import assert from "node:assert/strict";
import test from "node:test";

import {
  isCatIllustrationSrc,
  normalizeCatIllustrationSrc
} from "./cat-profile-options.ts";

test("legacy PNG cat illustrations remain valid and resolve to optimized WebP", () => {
  const legacy = "/catcare/cats/cat-orange-tabby.png";

  assert.equal(isCatIllustrationSrc(legacy), true);
  assert.equal(
    normalizeCatIllustrationSrc(legacy),
    "/catcare/cats/cat-orange-tabby.webp"
  );
});

test("unknown paths are not treated as built-in cat illustrations", () => {
  assert.equal(isCatIllustrationSrc("owner/photo.png"), false);
  assert.equal(normalizeCatIllustrationSrc("owner/photo.png"), null);
});
