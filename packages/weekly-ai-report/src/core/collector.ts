import { generateDigest } from "@maiife-ai-pub/ai-journal";
import type { WeeklyReport } from "./types.js";

const TIPS = [
  "Try adding system prompts to your Claude conversations for more consistent results",
  "Use chain-of-thought prompting for complex reasoning tasks",
  "Break large tasks into smaller prompts for better AI output quality",
  "Review your most-used AI tool — are you leveraging all its features?",
  "Try a new AI tool this week to compare with your current stack",
  "Set time limits for AI sessions to stay focused and productive",
  "Create reusable prompt templates for your common tasks",
];

export function collectWeeklyData(period: string = "week"): WeeklyReport {
  const digest = generateDigest(period);
  const now = new Date();
  const tipIndex = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));

  const toolBreakdown = digest.toolBreakdown.map((t) => ({
    tool: t.tool,
    count: t.count,
    minutes: t.totalMinutes,
    percentage: t.percentage,
  }));

  const taskBreakdown = digest.taskBreakdown.map((t) => ({
    task: t.tool,
    count: t.count,
    minutes: t.totalMinutes,
    percentage: t.percentage,
  }));

  return {
    period,
    startDate: digest.startDate,
    endDate: digest.endDate,
    totalInteractions: digest.totalEntries,
    totalMinutes: digest.totalMinutes,
    toolBreakdown,
    taskBreakdown,
    mostProductiveDay: null,
    previousWeekDelta: null,
    tip: TIPS[tipIndex % TIPS.length],
  };
}
