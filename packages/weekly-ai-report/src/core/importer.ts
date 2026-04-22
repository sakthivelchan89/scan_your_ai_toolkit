import * as fs from "node:fs";
import type { WeeklyReport } from "./types.js";

interface RawInteraction {
  tool?: string;
  taskType?: string;
  task?: string;
  durationMinutes?: number | string;
  minutes?: number | string;
  timestamp?: string;
  date?: string;
}

function parseDuration(val: number | string | undefined): number {
  if (!val) return 0;
  const n = typeof val === "string" ? parseFloat(val) : val;
  return isNaN(n) ? 0 : n;
}

function buildReport(interactions: RawInteraction[], period = "imported"): WeeklyReport {
  if (interactions.length === 0) {
    return {
      period, startDate: "", endDate: "", totalInteractions: 0, totalMinutes: 0,
      toolBreakdown: [], taskBreakdown: [], mostProductiveDay: null, previousWeekDelta: null,
      tip: "Import data and run again to see trends",
    };
  }

  const dates = interactions.map((i) => i.timestamp ?? i.date ?? "").filter(Boolean).sort();
  const totalMinutes = interactions.reduce((sum, i) => sum + parseDuration(i.durationMinutes ?? i.minutes), 0);

  const toolMap = new Map<string, { count: number; minutes: number }>();
  const taskMap = new Map<string, { count: number; minutes: number }>();
  for (const i of interactions) {
    const tool = i.tool ?? "unknown";
    const task = i.taskType ?? i.task ?? "unknown";
    const mins = parseDuration(i.durationMinutes ?? i.minutes);
    const t = toolMap.get(tool) ?? { count: 0, minutes: 0 };
    t.count++; t.minutes += mins; toolMap.set(tool, t);
    const tk = taskMap.get(task) ?? { count: 0, minutes: 0 };
    tk.count++; tk.minutes += mins; taskMap.set(task, tk);
  }

  const toolBreakdown = [...toolMap.entries()].map(([tool, d]) => ({
    tool, count: d.count, minutes: d.minutes,
    percentage: Math.round((d.count / interactions.length) * 100),
  })).sort((a, b) => b.count - a.count);

  const taskBreakdown = [...taskMap.entries()].map(([task, d]) => ({
    task, count: d.count, minutes: d.minutes,
    percentage: Math.round((d.count / interactions.length) * 100),
  })).sort((a, b) => b.count - a.count);

  return {
    period, startDate: dates[0] ?? "", endDate: dates[dates.length - 1] ?? "",
    totalInteractions: interactions.length, totalMinutes,
    toolBreakdown, taskBreakdown, mostProductiveDay: null, previousWeekDelta: null,
    tip: "Imported data — connect to Maiife for richer insights",
  };
}

/**
 * Build a WeeklyReport from a JSON file containing an array of interactions.
 * Each item should have: tool, taskType/task, durationMinutes/minutes, timestamp/date
 */
export function collectFromJSON(filePath: string, period?: string): WeeklyReport {
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8")) as RawInteraction[];
  return buildReport(Array.isArray(raw) ? raw : [], period ?? "imported-json");
}

/**
 * Build a WeeklyReport from a CSV file.
 * Expected headers (any order): tool, taskType/task, durationMinutes/minutes, timestamp/date
 */
export function collectFromCSV(filePath: string, period?: string): WeeklyReport {
  const lines = fs.readFileSync(filePath, "utf-8").split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return buildReport([], period ?? "imported-csv");

  const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim().toLowerCase());
  const interactions: RawInteraction[] = lines.slice(1).map((line) => {
    const vals = line.split(",").map((v) => v.replace(/"/g, "").trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
    return {
      tool: obj.tool,
      taskType: obj.tasktype ?? obj.task,
      durationMinutes: obj.durationminutes ?? obj.minutes,
      timestamp: obj.timestamp ?? obj.date,
    };
  });

  return buildReport(interactions, period ?? "imported-csv");
}
