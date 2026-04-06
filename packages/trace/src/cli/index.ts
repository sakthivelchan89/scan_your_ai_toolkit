#!/usr/bin/env node
import { Command } from "commander";
import { traceList, traceView, traceAnalyze } from "../mcp/tools.js";

const program = new Command();
program.name("maiife-trace").description("Agent workflow tracer").version("0.1.0");

program.command("list").description("List recent traces")
  .option("--agent <name>", "Filter by agent").option("--days <n>", "Look back period", "7")
  .action(async (opts) => {
    const traces = await traceList({ agent: opts.agent, days: parseInt(opts.days, 10) });
    console.log(`\nRecent Traces (${traces.length})\n`);
    for (const t of traces) console.log(`  ${t.id} ${t.agent.padEnd(15)} ${t.status.padEnd(8)} ${t.spanCount} spans ${t.durationMs ?? "?"}ms`);
    console.log();
  });

program.command("view").description("View trace details")
  .requiredOption("--id <traceId>", "Trace ID").option("--format <fmt>", "Format: tree, json", "tree")
  .action(async (opts) => {
    const result = await traceView({ id: opts.id, format: opts.format });
    console.log(`\nTrace: ${opts.id}\n`);
    console.log(typeof result === "string" ? result : JSON.stringify(result, null, 2));
    console.log();
  });

program.command("analyze").description("Analyze traces for patterns")
  .option("--agent <name>", "Filter by agent").option("--days <n>", "Period", "30")
  .action(async (opts) => {
    const analyses = await traceAnalyze({ agent: opts.agent, days: parseInt(opts.days, 10) });
    console.log(`\nTrace Analysis (${analyses.length} traces)\n`);
    for (const a of analyses) {
      console.log(`  ${a.traceId}: ${a.totalSpans} spans, ${a.totalDurationMs}ms${a.errorSpans.length > 0 ? `, ${a.errorSpans.length} errors` : ""}`);
      for (const p of a.patterns) console.log(`    ! ${p}`);
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
