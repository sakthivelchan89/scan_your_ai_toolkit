#!/usr/bin/env node
import { Command } from "commander";
import * as fs from "node:fs";
import { collectWeeklyData } from "../core/collector.js";
import { renderMarkdown, renderTable } from "../core/renderer.js";

const program = new Command();
program
  .name("maiife-weekly-ai-report")
  .description("Your AI Week in Review")
  .version("0.1.0");

program
  .command("generate")
  .description("Generate your AI report")
  .option("--period <p>", "Period: week, month, year", "week")
  .option("--format <fmt>", "Format: table, markdown, json", "table")
  .option("--output <file>", "Write to file")
  .action(async (opts) => {
    const report = collectWeeklyData(opts.period);
    let output: string;
    if (opts.format === "markdown") output = renderMarkdown(report);
    else if (opts.format === "json") output = JSON.stringify(report, null, 2);
    else output = renderTable(report);
    if (opts.output) {
      fs.writeFileSync(opts.output, output, "utf-8");
      console.log(`Report written to ${opts.output}`);
    } else {
      console.log(output);
    }
  });

if (process.argv.length <= 2) process.argv.push("generate");
program.parse();
