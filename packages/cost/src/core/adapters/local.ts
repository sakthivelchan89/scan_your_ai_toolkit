import type { VendorAdapter, UsageRecord } from "../types.js";

export function createLocalAdapter(): VendorAdapter {
  return {
    name: "local",
    async fetchUsage(_apiKey: string, _days: number): Promise<UsageRecord[]> { return []; },
  };
}
