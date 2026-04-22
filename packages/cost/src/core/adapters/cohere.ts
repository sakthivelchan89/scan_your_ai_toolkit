import type { VendorAdapter, UsageRecord } from "../types.js";

// Prices per 1M tokens (USD) — updated April 2026
const COHERE_PRICING: Record<string, { input: number; output: number }> = {
  "command-r-plus": { input: 2.50, output: 10.00 },
  "command-r": { input: 0.15, output: 0.60 },
  "command": { input: 1.00, output: 2.00 },
  "command-light": { input: 0.30, output: 0.60 },
};

function lookupPricing(model: string): { input: number; output: number } | null {
  if (COHERE_PRICING[model]) return COHERE_PRICING[model];
  for (const [key, price] of Object.entries(COHERE_PRICING)) {
    if (model.startsWith(key)) return price;
  }
  return null;
}

export function estimateCostCohere(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = lookupPricing(model);
  if (!pricing) return 0;
  return (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
}

export function createCohereAdapter(): VendorAdapter {
  return {
    name: "cohere",
    async fetchUsage(apiKey: string, _days: number): Promise<UsageRecord[]> {
      if (!apiKey) return [];
      try {
        // Cohere does not expose a programmatic usage API as of April 2026.
        // Usage data is available in the Cohere dashboard only.
        // Return empty — estimateCost() is the primary utility here.
        return [];
      } catch {
        return [];
      }
    },
  };
}

export { COHERE_PRICING };
