export const hrBotProviders = ["groq", "openai"] as const;

export type HrBotProvider = (typeof hrBotProviders)[number];

export const hrBotModels: Record<
  HrBotProvider,
  Array<{ id: string; label: string }>
> = {
  groq: [
    { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B" },
    { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant" },
    { id: "gemma2-9b-it", label: "Gemma 2 9B" },
  ],
  openai: [
    { id: "gpt-4o", label: "GPT-4o" },
    { id: "gpt-4o-mini", label: "GPT-4o Mini" },
    { id: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  ],
};

export const defaultHrBotProvider: HrBotProvider = "groq";
export const defaultHrBotModel = hrBotModels.groq[0].id;

export function isHrBotProvider(value: string): value is HrBotProvider {
  return hrBotProviders.includes(value as HrBotProvider);
}

export function isValidHrBotModel(provider: HrBotProvider, model: string): boolean {
  return hrBotModels[provider].some((entry) => entry.id === model);
}

export function getDefaultModelForProvider(provider: HrBotProvider): string {
  return hrBotModels[provider][0].id;
}

export function normalizeHrBotModel(
  provider: HrBotProvider,
  model: string | undefined,
): string {
  if (model && isValidHrBotModel(provider, model)) {
    return model;
  }
  return getDefaultModelForProvider(provider);
}
