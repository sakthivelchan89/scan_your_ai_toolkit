import type { VendorAdapter, UsageRecord } from "../types.js";

const OPENAI_PRICING: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 2.50, output: 10.00 },
  "gpt-4o-mini": { input: 0.15, output: 0.60 },
  "gpt-4-turbo": { input: 10.00, output: 30.00 },
  "gpt-3.5-turbo": { input: 0.50, output: 1.50 },
  "o1": { input: 15.00, output: 60.00 },
  "o1-mini": { input: 3.00, output: 12.00 },
};

export function createOpenAIAdapter(): VendorAdapter {
  return {
    name: "openai",
    async fetchUsage(apiKey: string, days: number): Promise<UsageRecord[]> {
      if (!apiKey) return [];
      try { return []; } catch { return []; } // Stub: would call /v1/organization/usage
    },
  };
}

export { OPENAI_PRICING };
