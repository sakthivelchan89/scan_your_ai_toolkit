import { getEntries } from "./store.js";
import type { Digest, JournalEntry, UsagePattern } from "./types.js";

function periodToDays(period: string): number {
  if (period === "week") return 7;
  if (period === "month") return 30;
  if (period === "year") return 365;
  return 7;
}

function breakdown(entries: JournalEntry[], key: "tool" | "taskType"): UsagePattern[] {
  const groups = new Map<string, { count: number; minutes: number }>();
  for (const entry of entries) {
    const val = entry[key];
    const existing = groups.get(val) ?? { count: 0, minutes: 0 };
    existing.count++;
    existing.minutes += entry.durationMinutes ?? 0;
    groups.set(val, existing);
  }
  const total = entries.length || 1;
  return Array.from(groups.entries())
    .map(([name, { count, minutes }]) => ({
      tool: name,
      count,
      totalMinutes: minutes,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

function generateInsights(entries: JournalEntry[], toolBreakdown: UsagePattern[], taskBreakdown: UsagePattern[]): string[] {
  const insights: string[] = [];
  if (toolBreakdown.length > 0 && toolBreakdown[0].percentage > 80) {
    insights.push(`You rely heavily on ${toolBreakdown[0].tool} (${toolBreakdown[0].percentage}%) — consider diversifying your AI tools`);
  }
  if (taskBreakdown.length > 0) {
    const topTask = taskBreakdown[0];
    insights.push(`Your top AI use case is ${topTask.tool} (${topTask.percentage}% of interactions)`);
  }
  const unusedTasks = ["coding", "writing", "research", "debugging", "data-analysis"]
    .filter((t) => !taskBreakdown.some((tb) => tb.tool === t));
  if (unusedTasks.length > 0) {
    insights.push(`You haven't used AI for ${unusedTasks.slice(0, 2).join(" or ")} this period — it could save time`);
  }
  if (entries.length === 0) {
    insights.push("No AI interactions logged this period — start tracking to see patterns");
  }
  return insights;
}

export function generateDigest(period: string = "week"): Digest {
  const days = periodToDays(period);
  const since = new Date();
  since.setDate(since.getDate() - days);
  const endDate = new Date();
  const entries = getEntries(since);
  const toolBreakdown = breakdown(entries, "tool");
  const taskBreakdown = breakdown(entries, "taskType");
  const totalMinutes = entries.reduce((sum, e) => sum + (e.durationMinutes ?? 0), 0);
  const topTool = toolBreakdown.length > 0 ? toolBreakdown[0].tool : "none";
  const topTask = taskBreakdown.length > 0 ? taskBreakdown[0].tool : "none";
  return {
    period,
    startDate: since.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
    totalEntries: entries.length,
    totalMinutes,
    toolBreakdown,
    taskBreakdown,
    insights: generateInsights(entries, toolBreakdown, taskBreakdown),
    topTool,
    topTask,
  };
}
