#!/usr/bin/env node
import { Command } from "commander";
import { subAuditRun } from "../mcp/tools.js";

const program = new Command();
program.name("maiife-sub-audit").description("Personal AI Subscription Auditor").version("0.1.0")
  .option("--format <fmt>", "Output: table, json", "table")
  .action(async (opts) => {
    const report = await subAuditRun();
    if (opts.format === "json") { console.log(JSON.stringify(report, null, 2)); return; }
    console.log(`\nAI Subscription Audit\n`);
    console.log(`  Total monthly cost: $${report.totalMonthlyCost}`);
    console.log(`  Detected waste: $${report.totalWaste}/mo\n`);
    if (report.wasteItems.length > 0) { console.log("  Waste:"); for (const w of report.wasteItems) console.log(`    ${w.subscription} ($${w.monthlyCost}/mo) -- ${w.reason}`); }
    if (report.overlaps.length > 0) { console.log("\n  Overlaps:"); for (const o of report.overlaps) console.log(`    ${o.tools.join(" + ")} -- ${o.suggestion}`); }
    if (report.recommendations.length > 0) { console.log("\n  Recommendations:"); for (const r of report.recommendations) console.log(`    ${r}`); }
    console.log(`\n  Estimated savings: $${report.savingsEstimate}/mo\n`);
  });

program
  .command('mcp')
  .description('Start MCP server over stdio')
  .action(async () => {
    const { startMCPServer } = await import('../mcp/index.js');
    await startMCPServer();
  });

program.parse();
