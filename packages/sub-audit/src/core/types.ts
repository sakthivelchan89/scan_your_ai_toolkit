export interface Subscription {
  name: string; vendor: string; monthlyCost: number; usageLast30d: number; lastUsedDate?: string;
  category: "api" | "subscription" | "local";
}
export interface WasteItem { subscription: string; monthlyCost: number; reason: string; suggestion: string; }
export interface OverlapItem { tools: string[]; overlapPercent: number; suggestion: string; }
export interface AuditReport {
  subscriptions: Subscription[]; totalMonthlyCost: number; totalWaste: number;
  wasteItems: WasteItem[]; overlaps: OverlapItem[];
  savingsEstimate: number; recommendations: string[];
}
