#!/usr/bin/env node
import { Command } from "commander";
import { runScan } from "./commands/scan.js";
import { runScore } from "./commands/score.js";

const program = new Command();

program
  .name("maiife-mcp-audit")
  .description("MCP server security scanner — score and audit MCP configurations")
  .version("0.1.0");

program
  .command("scan")
  .description("Scan all MCP server configurations and produce security scorecards")
  .option("--config <path>", "Path to a specific MCP config file")
  .option("--servers <names>", "Comma-separated server names to audit")
  .option("--format <format>", "Output format: json or table", "table")
  .option("--ci", "CI mode: exit with code 1 if any server is below min-grade", false)
  .option("--min-grade <grade>", "Minimum acceptable grade for CI mode", "B")
  .option("--post-to <url>", "POST results to a Maiife gateway (overrides MAIIFE_GATEWAY env)")
  .option("--key <mk>", "Maiife API key (overrides MAIIFE_API_KEY env)")
  .option("--no-post", "Disable posting even if env is set")
  .option("--post-only", "Exit 1 if POST fails; suppress local output")
  .action(async (options) => {
    await runScan(options);
  });

program
  .command("score")
  .description("Score a single MCP server and output its full scorecard as JSON")
  .requiredOption("--server <name>", "Name of the MCP server to score")
  .option("--config <path>", "Path to a specific MCP config file")
  .action(async (options) => {
    await runScore(options);
  });

program.command('mcp')
  .description('Start MCP server (stdio transport)')
  .action(async () => {
    const { startMCPServer } = await import('../mcp/index.js');
    await startMCPServer();
  });

program.parse(process.argv);
