import type { Subscription, AuditReport, WasteItem, OverlapItem } from "./types.js";

const OVERLAP_GROUPS: { tools: string[]; description: string }[] = [
  { tools: ["GitHub Copilot", "Cursor Pro"], description: "Both provide AI code completion — keep one" },
  { tools: ["ChatGPT Plus", "Claude Pro"], description: "Both provide chat AI — keep primary, use API for secondary" },
];

export function analyzeSubscriptions(subscriptions: Subscription[]): AuditReport {
  const totalMonthlyCost = subscriptions.reduce((sum, s) => sum + s.monthlyCost, 0);
  const wasteItems: WasteItem[] = [];
  for (const sub of subscriptions) {
    if (sub.monthlyCost > 0 && sub.usageLast30d < 5) {
      wasteItems.push({
        subscription: sub.name, monthlyCost: sub.monthlyCost,
        reason: sub.usageLast30d === 0 ? "No usage in 30 days" : `Only ${sub.usageLast30d} uses in 30 days`,
        suggestion: `Cancel or downgrade ${sub.name}`,
      });
    }
  }
  const overlaps: OverlapItem[] = [];
  const subNames = new Set(subscriptions.map((s) => s.name));
  for (const group of OVERLAP_GROUPS) {
    const present = group.tools.filter((t) => subNames.has(t));
    if (present.length >= 2) overlaps.push({ tools: present, overlapPercent: 80, suggestion: group.description });
  }
  const totalWaste = wasteItems.reduce((sum, w) => sum + w.monthlyCost, 0);
  const overlapSavings = overlaps.length * 10;
  const recommendations: string[] = [];
  if (wasteItems.length > 0) recommendations.push(`Cancel ${wasteItems.length} unused subscription(s) to save $${totalWaste}/mo`);
  if (overlaps.length > 0) recommendations.push(`Consolidate ${overlaps.length} overlapping tool group(s)`);
  if (totalMonthlyCost > 50 && !subscriptions.some((s) => s.category === "local"))
    recommendations.push("Consider local models (Ollama) for simple tasks at $0 cost");
  return { subscriptions, totalMonthlyCost, totalWaste, wasteItems, overlaps, savingsEstimate: totalWaste + overlapSavings, recommendations };
}
