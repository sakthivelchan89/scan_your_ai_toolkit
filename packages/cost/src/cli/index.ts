#!/usr/bin/env node
import { Command } from "commander";
import { costReport, costOptimize } from "../mcp/tools.js";

const program = new Command();
program.name("maiife-cost").description("AI spend calculator + optimizer").version("0.1.0");

program.command("report").description("Generate spend report")
  .option("--period <period>", "Period: last-7d, last-30d, last-90d", "last-30d")
  .option("--format <fmt>", "Output: table, json", "table")
  .action(async (opts) => {
    const report = await costReport({ period: opts.period });
    if (opts.format === "json") { console.log(JSON.stringify(report, null, 2)); return; }
    console.log(`\nAI Spend Report (${report.period})\n`);
    console.log(`  Total: $${report.totalCostUsd} - ${report.totalRequests} requests - ${(report.totalTokens / 1000000).toFixed(1)}M tokens\n`);
    if (report.byVendor.length > 0) { console.log("  By Vendor:"); for (const v of report.byVendor) console.log(`    ${v.vendor.padEnd(15)} $${v.costUsd.toFixed(2)} (${v.percentage}%)`); }
    if (report.byModel.length > 0) { console.log("\n  By Model:"); for (const m of report.byModel) console.log(`    ${m.model.padEnd(20)} $${m.costUsd.toFixed(2)} (${m.requests} reqs)`); }
    console.log();
  });

program.command("optimize").description("Get optimization suggestions")
  .option("--period <period>", "Period", "last-30d")
  .action(async (opts) => {
    const { optimizations } = await costOptimize({ period: opts.period });
    console.log("\nCost Optimization Suggestions\n");
    if (optimizations.length === 0) { console.log("  No suggestions -- your spend looks efficient!\n"); return; }
    for (const o of optimizations) { console.log(`  ${o.description}`); console.log(`     Save: $${o.savingsUsd}/mo (${o.savingsPercent}%)`); console.log(`     Action: ${o.action}\n`); }
  });

program
  .command('mcp')
  .description('Start MCP server over stdio')
  .action(async () => {
    const { startMCPServer } = await import('../mcp/index.js');
    await startMCPServer();
  });

program.parse();
