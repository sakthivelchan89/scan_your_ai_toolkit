export interface UsageRecord {
  vendor: string; model: string; date: string;
  inputTokens: number; outputTokens: number; requests: number; costUsd: number;
}

export interface CostReport {
  period: string; startDate: string; endDate: string;
  totalCostUsd: number; totalRequests: number; totalTokens: number;
  byVendor: { vendor: string; costUsd: number; requests: number; percentage: number }[];
  byModel: { model: string; vendor: string; costUsd: number; requests: number }[];
  dailyTrend: { date: string; costUsd: number }[];
}

export interface CostOptimization {
  description: string; currentCost: number; projectedCost: number;
  savingsUsd: number; savingsPercent: number; action: string;
}

export interface VendorAdapter {
  name: string;
  fetchUsage(apiKey: string, days: number): Promise<UsageRecord[]>;
}
