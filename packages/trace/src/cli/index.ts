#!/usr/bin/env node
import { Command } from "commander";
import { traceList, traceView, traceAnalyze } from "../mcp/tools.js";
import { listStoredTraces } from "../core/store.js";
import { exportOTELFile, exportOTELHttp } from "../core/otel.js";

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

program.command("export").description("Export traces in OTLP/JSON format")
  .option("--agent <name>", "Filter by agent")
  .option("--days <n>", "Look back period", "7")
  .option("--output <path>", "Output file path (omit to write to stdout)")
  .option("--http <url>", "POST to OTLP HTTP endpoint (overrides OTEL_EXPORTER_OTLP_ENDPOINT)")
  .action(async (opts) => {
    const traces = listStoredTraces(opts.agent, parseInt(opts.days, 10));
    if (traces.length === 0) {
      console.error("No traces to export");
      return;
    }
    if (opts.http || process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
      await exportOTELHttp(traces, opts.http);
      console.error(`  exported ${traces.length} trace(s) to ${opts.http ?? process.env.OTEL_EXPORTER_OTLP_ENDPOINT}`);
    } else {
      exportOTELFile(traces, opts.output);
      if (opts.output) console.error(`  exported ${traces.length} trace(s) to ${opts.output}`);
    }
  });

program.command('mcp')
  .description('Start MCP server (stdio transport)')
  .action(async () => {
    const { startMCPServer } = await import('../mcp/index.js');
    await startMCPServer();
  });

program.parse();
