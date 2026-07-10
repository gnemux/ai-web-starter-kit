const aiCreditsPerUse = 10000;

export function formatAiUsesFromCredits(credits: number) {
  return Math.max(credits / aiCreditsPerUse, 0);
}

export function formatAiCreditsAsUsesLabel(credits: number) {
  return formatAiUseNumber(formatAiUsesFromCredits(credits));
}

function formatAiUseNumber(value: number) {
  return Math.max(value, 0).toLocaleString("zh-CN", {
    maximumFractionDigits: 1
  });
}
