#!/usr/bin/env node
import { Command } from "commander";
import { logInteraction } from "../core/logger.js";
import { generateDigest } from "../core/digest.js";
import { setLogging, isLogging } from "../core/store.js";

const program = new Command();

program
  .name("maiife-ai-journal")
  .description("Personal AI Usage Diary — track how you use AI and get reflective insights")
  .version("0.1.0");

program
  .command("start")
  .description("Enable AI interaction logging")
  .action(() => {
    setLogging(true);
    console.log("\n📓 AI Journal logging enabled. Use 'log' to record interactions.\n");
  });

program
  .command("stop")
  .description("Pause AI interaction logging")
  .action(() => {
    setLogging(false);
    console.log("\n📓 AI Journal logging paused.\n");
  });

program
  .command("log")
  .description("Log an AI interaction")
  .requiredOption("--tool <tool>", "AI tool used (claude, chatgpt, cursor, copilot)")
  .requiredOption("--task <type>", "Task type (coding, writing, research, debugging, data-analysis)")
  .option("--duration <min>", "Duration in minutes")
  .option("--notes <text>", "Notes about the interaction")
  .action((opts) => {
    const entry = logInteraction({
      tool: opts.tool,
      taskType: opts.task,
      durationMinutes: opts.duration ? parseInt(opts.duration, 10) : undefined,
      notes: opts.notes,
    });
    console.log(`\n📓 Logged: ${entry.tool} / ${entry.taskType}${entry.durationMinutes ? ` (${entry.durationMinutes}min)` : ""}\n`);
  });

program
  .command("digest")
  .description("View your AI usage digest")
  .option("--period <period>", "Time period: week, month, year", "week")
  .option("--format <fmt>", "Output format: table, json", "table")
  .action((opts) => {
    const digest = generateDigest(opts.period);
    if (opts.format === "json") { console.log(JSON.stringify(digest, null, 2)); return; }
    console.log(`\n📓 AI Journal — ${opts.period.charAt(0).toUpperCase() + opts.period.slice(1)}ly Digest`);
    console.log(`   ${digest.startDate} → ${digest.endDate}\n`);
    if (digest.totalEntries === 0) { console.log("   No interactions logged this period.\n"); return; }
    console.log(`   ${digest.totalEntries} interactions · ${digest.totalMinutes} minutes total\n`);
    console.log("   Tools:");
    for (const t of digest.toolBreakdown) {
      console.log(`     ${t.tool.padEnd(15)} ${t.count} uses (${t.percentage}%) · ${t.totalMinutes}min`);
    }
    console.log("\n   Tasks:");
    for (const t of digest.taskBreakdown) {
      console.log(`     ${t.tool.padEnd(15)} ${t.count} uses (${t.percentage}%) · ${t.totalMinutes}min`);
    }
    console.log("\n   Insights:");
    for (const insight of digest.insights) { console.log(`     💡 ${insight}`); }
    console.log();
  });

program
  .command("insights")
  .description("Get AI usage patterns and reflective nudges")
  .action(() => {
    const digest = generateDigest("month");
    console.log("\n📓 AI Journal — Insights (Last 30 Days)\n");
    if (digest.insights.length === 0) { console.log("   Not enough data yet.\n"); return; }
    for (const insight of digest.insights) { console.log(`   💡 ${insight}`); }
    console.log();
  });

program.parse();
