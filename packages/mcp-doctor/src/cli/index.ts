#!/usr/bin/env node
import { Command } from "commander";
import { mcpDoctorCheckup, mcpDoctorFix, mcpDoctorStatus } from "../mcp/tools.js";

const program = new Command();

program
  .name("maiife-mcp-doctor")
  .description("MCP Server Health Check & Auto-Fixer")
  .version("0.1.0");

program
  .command("check")
  .description("Full health check on all MCP servers")
  .option("--config <path>", "Path to MCP config file")
  .option("--server <name>", "Check a specific server")
  .option("--format <fmt>", "Output format: json, table", "table")
  .action(async (opts) => {
    const report = await mcpDoctorCheckup({ configPath: opts.config, server: opts.server });
    if (opts.format === "json") { console.log(JSON.stringify(report, null, 2)); return; }
    console.log("\n🏥 MCP Doctor — Health Report\n");
    if (report.servers.length === 0) { console.log("  No MCP servers found.\n"); return; }
    for (const server of report.servers) {
      const icon = server.status === "healthy" ? "✅" : server.status === "degraded" ? "⚠️" : server.status === "stale" ? "💤" : "❌";
      console.log(`  ${icon} ${server.name.padEnd(20)} ${server.status.toUpperCase()}`);
      for (const check of server.checks) {
        const ci = check.passed ? "  ✓" : "  ✗";
        console.log(`     ${ci} ${check.details}`);
      }
      if (server.suggestions.length > 0) {
        for (const s of server.suggestions) console.log(`     → ${s}`);
      }
    }
    const { summary } = report;
    console.log(`\n  Overall: ${summary.healthy} healthy, ${summary.degraded} degraded, ${summary.dead} dead, ${summary.stale} stale\n`);
  });

program
  .command("fix")
  .description("Suggest auto-fixes for broken servers")
  .option("--config <path>", "Path to MCP config file")
  .action(async (opts) => {
    const { fixes } = await mcpDoctorFix({ configPath: opts.config });
    if (fixes.length === 0) { console.log("\n🏥 All servers are healthy!\n"); return; }
    console.log("\n🏥 MCP Doctor — Suggested Fixes\n");
    for (const fix of fixes) {
      const auto = fix.autoFixable ? " [auto-fixable]" : "";
      console.log(`  ${fix.serverName}: ${fix.description}${auto}`);
      if (fix.command) console.log(`    → ${fix.command}`);
    }
    console.log();
  });

program
  .command("status")
  .description("Quick status of all MCP servers")
  .option("--config <path>", "Path to MCP config file")
  .action(async (opts) => {
    const statuses = await mcpDoctorStatus({ configPath: opts.config });
    console.log("\n🏥 MCP Doctor — Quick Status\n");
    for (const s of statuses) {
      const icon = s.status === "healthy" ? "✅" : s.status === "degraded" ? "⚠️" : "❌";
      console.log(`  ${icon} ${s.name.padEnd(20)} ${s.status} ${s.issues > 0 ? `(${s.issues} issues)` : ""}`);
    }
    console.log();
  });

program
  .command('mcp')
  .description('Start MCP server over stdio')
  .action(async () => {
    const { startMCPServer } = await import('../mcp/index.js');
    await startMCPServer();
  });

// If no arguments, default to MCP server (for npx/Glama/Claude Desktop)
if (process.argv.length <= 2) {
  import('../mcp/index.js').then(m => m.startMCPServer());
} else {
  program.parse();
}
