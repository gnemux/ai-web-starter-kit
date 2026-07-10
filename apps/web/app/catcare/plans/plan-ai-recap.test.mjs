import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCatCarePlanAiRecapPrompt,
  getCatCareAiRecapAvailability
} from "./plan-ai-recap.ts";

test("catcare AI recap prompt uses structured summary without private notes", () => {
  const prompt = buildCatCarePlanAiRecapPrompt({
    planTitle: "朋友上门照护计划",
    statusLabel: "已发布",
    summary: {
      attentionCount: 1,
      completedCount: 2,
      entries: [
        {
          category: "meal",
          categoryLabel: "喂食",
          createdAt: "2026-07-07T09:00:00Z",
          id: "entry-1",
          note: "这是一段不应进入 prompt 的私密备注",
          ownerLabel: "汤圆",
          serviceDate: "2026-07-07",
          status: "attention",
          statusLabel: "有异常",
          title: "罐头"
        }
      ],
      headline: "已收到 2 项提交",
      overdueCount: 1,
      overdueEntries: [
        {
          category: "water",
          categoryLabel: "饮水",
          id: "overdue-1",
          ownerLabel: "饺子",
          serviceDate: "2026-07-07",
          title: "换水"
        }
      ],
      pendingCount: 1,
      sourceDescription: "只来自真实提交",
      sourceLabel: "真实提交",
      statusClassName: "",
      statusLabel: "需关注",
      totalCount: 4
    }
  });

  assert.match(prompt, /完成概览：2 项完成/);
  assert.match(prompt, /逾期重点：2026-07-07 饮水 换水/);
  assert.match(prompt, /异常重点：喂食 罐头/);
  assert.doesNotMatch(prompt, /私密备注/);
});

test("catcare AI recap blocks generation when quota is exhausted", () => {
  assert.deepEqual(
    getCatCareAiRecapAvailability({
      hasAiQuota: false,
      isPlanClosed: false,
      isPlanDraft: false
    }),
    {
      canGenerate: false,
      reason: "quota_exhausted"
    }
  );
});

test("catcare AI recap keeps published plans available when quota remains", () => {
  assert.deepEqual(
    getCatCareAiRecapAvailability({
      hasAiQuota: true,
      isPlanClosed: false,
      isPlanDraft: false
    }),
    {
      canGenerate: true,
      reason: null
    }
  );
});
