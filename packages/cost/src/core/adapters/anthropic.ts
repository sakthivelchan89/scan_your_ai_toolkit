import type { VendorAdapter, UsageRecord } from "../types.js";

const ANTHROPIC_PRICING: Record<string, { input: number; output: number }> = {
  "claude-opus-4": { input: 15.00, output: 75.00 },
  "claude-sonnet-4": { input: 3.00, output: 15.00 },
  "claude-haiku-3.5": { input: 0.80, output: 4.00 },
};

export function createAnthropicAdapter(): VendorAdapter {
  return {
    name: "anthropic",
    async fetchUsage(apiKey: string, days: number): Promise<UsageRecord[]> {
      if (!apiKey) return [];
      try { return []; } catch { return []; }
    },
  };
}

export { ANTHROPIC_PRICING };
