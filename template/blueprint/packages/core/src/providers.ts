export type ProviderMode = "disabled" | "sandbox" | "live";
export type ProviderSelection = { mode: ProviderMode; provider: string | null; configured: boolean };
export function providerAvailable(selection: ProviderSelection) { return selection.mode !== "disabled" && selection.configured && Boolean(selection.provider); }
