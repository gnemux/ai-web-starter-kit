import assert from "node:assert/strict";
import test from "node:test";

import sharp from "sharp";

import { normalizePrivateImageBuffer } from "./private-image-core.ts";

test("normalizes a large image to bounded WebP and strips EXIF", async () => {
  const input = await sharp({
    create: {
      background: { b: 120, g: 80, r: 40 },
      channels: 3,
      height: 1800,
      width: 2400
    }
  })
    .jpeg({ quality: 95 })
    .withExif({ IFD0: { Artist: "private-location-test" } })
    .toBuffer();
  const before = await sharp(input).metadata();

  assert.ok(before.exif);

  const output = await normalizePrivateImageBuffer(input, {
    maxDimension: 1600
  });
  const after = await sharp(output.data).metadata();

  assert.equal(after.format, "webp");
  assert.ok((after.width ?? 0) <= 1600);
  assert.ok((after.height ?? 0) <= 1600);
  assert.equal(after.exif, undefined);
  assert.equal(after.xmp, undefined);
});

test("rejects formats outside the upload contract", async () => {
  const svg = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20"/></svg>'
  );

  await assert.rejects(
    normalizePrivateImageBuffer(svg, { maxDimension: 1600 }),
    /unsupported_image/
  );
});
