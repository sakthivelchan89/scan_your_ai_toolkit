#!/usr/bin/env node
import { Command } from "commander";
import * as fs from "node:fs";
import { evalScoreTool, evalBatchTool, evalCompareTool } from "../mcp/tools.js";
import { listRubrics } from "../core/rubrics/index.js";

const program = new Command();
program.name("maiife-eval").description("LLM-as-judge evaluation engine").version("0.1.0");

program.command("score").description("Score a single output against a rubric")
  .requiredOption("--rubric <name>", "Rubric name")
  .option("--input <file>", "Read output from file")
  .option("--format <fmt>", "Output: table, json", "table")
  .action(async (opts) => {
    let output = "";
    if (opts.input) { output = fs.readFileSync(opts.input, "utf-8"); }
    else if (!process.stdin.isTTY) {
      const chunks: Buffer[] = [];
      for await (const chunk of process.stdin) chunks.push(chunk);
      output = Buffer.concat(chunks).toString("utf-8");
    } else { console.error("Provide output via --input or pipe"); process.exit(1); }
    const result = await evalScoreTool({ output, rubric: opts.rubric });
    if (opts.format === "json") { console.log(JSON.stringify(result, null, 2)); return; }
    console.log(`\nEval Score: ${result.totalScore}/100 (${result.grade}) -- rubric: ${result.rubric}\n`);
    for (const s of result.scores) {
      const bar = "=".repeat(Math.round(s.score / 10)) + "-".repeat(10 - Math.round(s.score / 10));
      console.log(`  ${s.dimension.padEnd(20)} ${bar} ${s.score}  ${s.reasoning}`);
    }
    console.log();
  });

program.command("batch").description("Score batch of outputs from JSONL file")
  .requiredOption("--input <file>", "JSONL file").requiredOption("--rubric <name>", "Rubric name")
  .option("--ci", "CI mode").option("--min-score <n>", "Min average score for CI", "70")
  .action(async (opts) => {
    const lines = fs.readFileSync(opts.input, "utf-8").split("\n").filter((l: string) => l.trim());
    const outputs = lines.map((l: string) => { try { return JSON.parse(l); } catch { return l; } });
    const result = await evalBatchTool({ outputs, rubric: opts.rubric });
    console.log(`\nBatch Eval: ${result.count} outputs - avg ${result.avgScore}/100 - stddev ${result.stdDev}\n`);
    console.log(`  Min: ${result.minScore}  Max: ${result.maxScore}  Outliers: ${result.outliers.length}\n`);
    if (opts.ci && result.avgScore < parseInt(opts.minScore, 10)) { console.log(`  Below CI threshold (${opts.minScore})\n`); process.exit(1); }
  });

program.command("compare").description("Compare baseline vs candidate")
  .requiredOption("--baseline <file>", "Baseline JSONL").requiredOption("--candidate <file>", "Candidate JSONL").requiredOption("--rubric <name>", "Rubric")
  .action(async (opts) => {
    const parseLines = (f: string) => fs.readFileSync(f, "utf-8").split("\n").filter((l: string) => l.trim()).map((l: string) => { try { return JSON.parse(l); } catch { return l; } });
    const result = await evalCompareTool({ baseline: parseLines(opts.baseline), candidate: parseLines(opts.candidate), rubric: opts.rubric });
    console.log(`\nA/B Comparison (${result.rubric})\n`);
    console.log(`  Baseline:  ${result.baseline.avgScore}/100 (n=${result.baseline.count})`);
    console.log(`  Candidate: ${result.candidate.avgScore}/100 (n=${result.candidate.count})`);
    console.log(`  Delta:     ${result.delta > 0 ? "+" : ""}${result.delta}`);
    console.log(`  Winner:    ${result.winner}${result.significant ? " (significant)" : " (not significant)"}\n`);
  });

program.command("rubrics").description("List available rubrics")
  .action(() => { console.log("\nAvailable Rubrics\n"); for (const name of listRubrics()) console.log(`  - ${name}`); console.log(); });

program
  .command('mcp')
  .description('Start MCP server over stdio')
  .action(async () => {
    const { startMCPServer } = await import('../mcp/index.js');
    await startMCPServer();
  });

program.parse();
