import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const catcareDirectory = new URL("./", import.meta.url);

test("shared CatCare photo viewer provides accessible modal navigation and localized download", async () => {
  const [source, focusSource] = await Promise.all([
    readFile(
      new URL("./care-photo-lightbox-client.tsx", catcareDirectory),
      "utf8"
    ),
    readFile(
      new URL("./use-dialog-focus-boundary.ts", catcareDirectory),
      "utf8"
    )
  ]);

  assert.match(source, /aria-modal="true"/);
  assert.match(source, /role="dialog"/);
  assert.match(source, /useDialogFocusBoundary/);
  assert.match(source, /event\.key === "ArrowLeft"/);
  assert.match(source, /event\.key === "ArrowRight"/);
  assert.match(source, /labels\.downloadSafe/);
  assert.doesNotMatch(source, /照片预览|上一张|下一张|下载安全/);
  assert.match(focusSource, /event\.key === "Escape"/);
  assert.match(focusSource, /event\.key !== "Tab"/);
  assert.match(focusSource, /event\.shiftKey/);
  assert.match(focusSource, /document\.body\.style\.overflow = "hidden"/);
});
test("upload preview and owner results both consume the shared viewer", async () => {
  const [uploadSource, resultsSource] = await Promise.all([
    readFile(
      new URL("../s/[token]/care-evidence-picker-client.tsx", catcareDirectory),
      "utf8"
    ),
    readFile(
      new URL("./plans/[id]/results/page.tsx", catcareDirectory),
      "utf8"
    )
  ]);

  assert.match(uploadSource, /CarePhotoLightbox/);
  assert.match(uploadSource, /photoViewerLabels\.enlargePhoto/);
  assert.match(resultsSource, /CareEvidenceGallery/);
  assert.doesNotMatch(resultsSource, /target="_blank"/);
});
