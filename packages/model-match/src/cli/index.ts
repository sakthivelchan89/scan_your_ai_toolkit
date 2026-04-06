#!/usr/bin/env node
import { Command } from "commander";
import { modelMatchCompare, modelMatchRecommend } from "../mcp/tools.js";

const program = new Command();
program.name("maiife-model-match").description("Personal Model Recommender").version("0.1.0");

program.command("compare").description("Compare models for a task")
  .requiredOption("--task <type>", "Task: coding, writing, analysis, general, simple-tasks")
  .option("--tokens <n>", "Avg tokens per request", "1000")
  .action(async (opts) => {
    const results = await modelMatchCompare({ task: opts.task, tokens: parseInt(opts.tokens, 10) });
    console.log(`\nModel Comparison: ${opts.task}\n`);
    console.log("  Model                  Quality  Cost/req  Latency  Value");
    for (const r of results) console.log(`  ${r.model.padEnd(22)} ${String(r.qualityScore).padEnd(8)} $${r.costPerRequest.toFixed(4).padEnd(8)} ${String(r.latencyMs + "ms").padEnd(8)} ${r.valueScore}`);
    console.log();
  });

program.command("recommend").description("Get model recommendation")
  .requiredOption("--task <type>", "Task type")
  .action(async (opts) => {
    const rec = await modelMatchRecommend({ task: opts.task });
    console.log(`\nRecommendation for: ${rec.task}\n`);
    console.log(`  Best quality: ${rec.bestQuality}`);
    console.log(`  Best value:   ${rec.bestValue}`);
    console.log(`  ${rec.suggestion}\n`);
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
