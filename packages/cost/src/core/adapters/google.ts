import type { VendorAdapter, UsageRecord } from "../types.js";

// Prices per 1M tokens (USD) — updated April 2026
const GOOGLE_PRICING: Record<string, { input: number; output: number }> = {
  "gemini-2.5-pro": { input: 1.25, output: 10.00 },
  "gemini-2.5-flash": { input: 0.075, output: 0.30 },
  "gemini-2.0-flash": { input: 0.10, output: 0.40 },
  "gemini-1.5-pro": { input: 1.25, output: 5.00 },
  "gemini-1.5-flash": { input: 0.075, output: 0.30 },
  "gemini-1.0-pro": { input: 0.50, output: 1.50 },
};

function lookupPricing(model: string): { input: number; output: number } | null {
  if (GOOGLE_PRICING[model]) return GOOGLE_PRICING[model];
  for (const [key, price] of Object.entries(GOOGLE_PRICING)) {
    if (model.startsWith(key)) return price;
  }
  return null;
}

export function estimateCostGoogle(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = lookupPricing(model);
  if (!pricing) return 0;
  return (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
}

export function createGoogleAdapter(): VendorAdapter {
  return {
    name: "google",
    async fetchUsage(apiKey: string, _days: number): Promise<UsageRecord[]> {
      if (!apiKey) return [];
      try {
        // Google Cloud usage requires Cloud Billing API + service account auth.
        // Vertex AI / Gemini API usage is not available via a simple REST endpoint.
        // Return empty — estimateCost() is the primary utility here.
        return [];
      } catch {
        return [];
      }
    },
  };
}

export { GOOGLE_PRICING };
