#!/usr/bin/env node
import { Command } from "commander";
import * as fs from "node:fs";
import { aiStackGenerate } from "../mcp/tools.js";

const program = new Command();

program
  .name("maiife-ai-stack")
  .description("What's Your AI Stack? — Generate a shareable profile card of your AI toolkit")
  .version("0.1.0")
  .option("--path <dir>", "Root path to scan", process.cwd())
  .option("--format <fmt>", "Output format: json, svg, markdown, badge", "svg")
  .option("--output <file>", "Write output to file instead of stdout")
  .action(async (opts) => {
    const format = opts.format === "badge" ? "markdown" : opts.format;
    const result = await aiStackGenerate({ path: opts.path, format });
    if (opts.output) {
      fs.writeFileSync(opts.output, result.rendered, "utf-8");
      console.log(`✅ AI Stack card written to ${opts.output}`);
      console.log(`   Score: ${result.profile.complexity.total}/100 (${result.profile.complexity.level})`);
      console.log(`   Tools: ${result.profile.stats.totalTools} total`);
    } else {
      console.log(result.rendered);
    }
  });

program.command('mcp')
  .description('Start MCP server (stdio transport)')
  .action(async () => {
    const { startMCPServer } = await import('../mcp/index.js');
    await startMCPServer();
  });

program.parse();
