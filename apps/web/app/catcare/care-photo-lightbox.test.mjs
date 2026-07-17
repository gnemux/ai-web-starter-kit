import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const catcareDirectory = new URL("./", import.meta.url);

test("shared CatCare photo viewer provides accessible modal navigation and download", async () => {
  const source = await readFile(
    new URL("./care-photo-lightbox-client.tsx", catcareDirectory),
    "utf8"
  );

  assert.match(source, /aria-modal="true"/);
  assert.match(source, /role="dialog"/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /event\.key === "ArrowLeft"/);
  assert.match(source, /event\.key === "ArrowRight"/);
  assert.match(source, /下载安全处理版/);
  assert.match(source, /document\.body\.style\.overflow = "hidden"/);
});

test("upload preview and owner results both consume the shared viewer", async () => {
  const [uploadSource, resultsSource] = await Promise.all([
    readFile(
      new URL("../s/[token]/visit-accordion-client.tsx", catcareDirectory),
      "utf8"
    ),
    readFile(
      new URL("./plans/[id]/results/page.tsx", catcareDirectory),
      "utf8"
    )
  ]);

  assert.match(uploadSource, /CarePhotoLightbox/);
  assert.match(uploadSource, /放大预览/);
  assert.match(resultsSource, /CareEvidenceGallery/);
  assert.doesNotMatch(resultsSource, /target="_blank"/);
});
