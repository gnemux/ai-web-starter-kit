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
  const [uploadSource, formSource, taskSource, resultsSource] = await Promise.all([
    readFile(
      new URL("../s/[token]/care-evidence-picker-client.tsx", catcareDirectory),
      "utf8"
    ),
    readFile(
      new URL("../s/[token]/care-submission-form-client.tsx", catcareDirectory),
      "utf8"
    ),
    readFile(
      new URL("../s/[token]/task-step-client.tsx", catcareDirectory),
      "utf8"
    ),
    readFile(
      new URL("./plans/[id]/results/page.tsx", catcareDirectory),
      "utf8"
    )
  ]);

  assert.match(uploadSource, /CarePhotoLightbox/);
  assert.match(uploadSource, /photoViewerLabels\.enlargePhoto/);
  assert.match(uploadSource, /labels\.photoDescription/);
  assert.match(formSource, /labels\.formTitle/);
  assert.match(taskSource, /careSubmissionLabels\.photoUploadFailed/);
  assert.match(taskSource, /careSubmissionLabels\.submissionFailed/);
  assert.doesNotMatch(taskSource, /setError\(result\.error\.message\)/);
  assert.doesNotMatch(taskSource, /setError\(mediaError\)/);
  assert.doesNotMatch(uploadSource, /[\u3400-\u9fff]/u);
  assert.doesNotMatch(formSource, /[\u3400-\u9fff]/u);
  assert.doesNotMatch(taskSource, /[\u3400-\u9fff]/u);
  assert.match(resultsSource, /CareEvidenceGallery/);
  assert.doesNotMatch(resultsSource, /target="_blank"/);
});

test("the complete anonymous handoff shell consumes one bilingual copy contract", async () => {
  const [pageSource, accordionSource, displaySource, dictionarySource] =
    await Promise.all([
      readFile(
        new URL("../s/[token]/page.tsx", catcareDirectory),
        "utf8"
      ),
      readFile(
        new URL("../s/[token]/visit-accordion-client.tsx", catcareDirectory),
        "utf8"
      ),
      readFile(
        new URL("../s/[token]/visit-display.tsx", catcareDirectory),
        "utf8"
      ),
      readFile(
        new URL("../../lib/i18n/dictionaries.ts", catcareDirectory),
        "utf8"
      )
    ]);

  assert.match(pageSource, /ownerDictionary\.shareHandoff/);
  assert.match(pageSource, /shareHandoffLabels\.guideDescription/);
  assert.match(pageSource, /labels\.errorInvalidDescription/);
  assert.doesNotMatch(pageSource, /result\.error\.message/);
  assert.doesNotMatch(
    pageSource,
    />\s*(?:照护任务|匿名访问|可查看和提交|主人交代|查看方式|到访前先确认)\s*</u
  );
  assert.match(accordionSource, /shareHandoffLabels\.dayLabel/);
  assert.match(accordionSource, /shareHandoffLabels\.lockedDay/);
  assert.match(accordionSource, /shareHandoffLabels\.visitLabel/);
  assert.doesNotMatch(
    accordionSource,
    /第 \{dayIndex|第 \{visitIndex|这一天还没到|"已提交"|"收起"|"展开"/u
  );
  assert.match(displaySource, /labels\.submittedException/);
  assert.match(displaySource, /labels\.dailyFrequency/);
  assert.match(displaySource, /labels\.visitSummaryMore/);
  assert.doesNotMatch(
    displaySource,
    /已提交异常|按现场情况执行|每周 \$\{|完成\$\{/u
  );
  assert.match(dictionarySource, /shareHandoff: \{[\s\S]*headerTitle: "照护任务"/u);
  assert.match(dictionarySource, /shareHandoff: \{[\s\S]*headerTitle: "Care tasks"/u);
});
