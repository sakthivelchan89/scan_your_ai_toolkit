#!/usr/bin/env node
import { Command } from "commander";
import * as fs from "node:fs";
import { promptScoreAnalyze, promptScoreImprove, promptScoreTrack } from "../mcp/tools.js";

const program = new Command();

program
  .name("maiife-prompt-score")
  .description("Prompt quality analyzer — score, improve, and lint your AI prompts")
  .version("0.1.0");

program
  .command("analyze")
  .description("Score a prompt's quality")
  .option("--input <file>", "Read prompt from file")
  .option("--project <name>", "Project name for tracking")
  .option("--format <fmt>", "Output: table, json", "table")
  .action(async (opts) => {
    let prompt = "";
    if (opts.input) {
      prompt = fs.readFileSync(opts.input, "utf-8");
    } else if (!process.stdin.isTTY) {
      const chunks: Buffer[] = [];
      for await (const chunk of process.stdin) chunks.push(chunk);
      prompt = Buffer.concat(chunks).toString("utf-8");
    } else {
      console.error("Provide prompt via --input or pipe: echo '...' | maiife-prompt-score analyze");
      process.exit(1);
    }
    const result = await promptScoreAnalyze({ prompt, project: opts.project });
    if (opts.format === "json") { console.log(JSON.stringify(result, null, 2)); return; }
    console.log(`\n Prompt Score: ${result.totalScore}/100 (${result.grade})\n`);
    for (const d of result.dimensions) {
      const bar = "█".repeat(Math.round(d.score / 10)) + "░".repeat(10 - Math.round(d.score / 10));
      console.log(`  ${d.name.padEnd(16)} ${bar} ${d.score}`);
    }
    if (result.antiPatterns.length > 0) {
      console.log("\n  Anti-patterns:");
      for (const a of result.antiPatterns) console.log(`    ! ${a}`);
    }
    if (result.suggestions.length > 0) {
      console.log("\n  Suggestions:");
      for (const s of result.suggestions) console.log(`    -> ${s}`);
    }
    console.log();
  });

program
  .command("improve")
  .description("Get an improved version of a prompt")
  .option("--input <file>", "Read prompt from file")
  .action(async (opts) => {
    let prompt = "";
    if (opts.input) { prompt = fs.readFileSync(opts.input, "utf-8"); }
    else if (!process.stdin.isTTY) {
      const chunks: Buffer[] = [];
      for await (const chunk of process.stdin) chunks.push(chunk);
      prompt = Buffer.concat(chunks).toString("utf-8");
    } else { console.error("Provide prompt via --input or pipe"); process.exit(1); }
    const result = await promptScoreImprove({ prompt });
    console.log(`\n Prompt Improvement: ${result.scoreBefore} -> ${result.scoreAfter}\n`);
    console.log("Changes:");
    for (const c of result.changes) console.log(`  [${c.dimension}] ${c.description}`);
    console.log("\n--- Improved Prompt ---\n");
    console.log(result.improved);
    console.log();
  });

program
  .command("lint")
  .description("Lint prompt files in a directory")
  .requiredOption("--dir <path>", "Directory to scan")
  .option("--min-score <n>", "Minimum acceptable score", "60")
  .action(async (opts) => {
    const minScore = parseInt(opts.minScore, 10);
    const files = fs.readdirSync(opts.dir).filter((f: string) => f.endsWith(".txt") || f.endsWith(".md") || f.endsWith(".prompt"));
    let failures = 0;
    console.log(`\n Linting ${files.length} prompt files (min score: ${minScore})\n`);
    for (const file of files) {
      const prompt = fs.readFileSync(`${opts.dir}/${file}`, "utf-8");
      const result = await promptScoreAnalyze({ prompt, track: false });
      const icon = result.totalScore >= minScore ? "PASS" : "FAIL";
      console.log(`  ${icon} ${file.padEnd(30)} ${result.totalScore}/100 (${result.grade})`);
      if (result.totalScore < minScore) failures++;
    }
    console.log();
    if (failures > 0) { console.log(`  ${failures} file(s) below threshold\n`); process.exit(1); }
  });

program
  .command("track")
  .description("View prompt score trends")
  .option("--project <name>", "Filter by project")
  .option("--days <n>", "Look back period", "30")
  .action(async (opts) => {
    const entries = await promptScoreTrack({ project: opts.project, days: parseInt(opts.days, 10) });
    console.log(`\n Prompt Score Trends (last ${opts.days} days)\n`);
    if (entries.length === 0) { console.log("  No scores tracked yet.\n"); return; }
    const avg = Math.round(entries.reduce((s, e) => s + e.score, 0) / entries.length);
    console.log(`  ${entries.length} prompts scored - avg: ${avg}/100\n`);
    for (const e of entries.slice(-10)) {
      console.log(`  ${e.timestamp.split("T")[0]} ${e.grade} ${e.score}/100 ${e.project ? `[${e.project}]` : ""}`);
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

program.parse();
