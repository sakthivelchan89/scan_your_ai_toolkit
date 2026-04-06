import type { Command } from "commander";
import { probeScan } from "../../mcp/tools.js";
import * as fs from "node:fs";

export function registerWatchCommand(program: Command) {
  program
    .command("watch")
    .description("Compare current scan against a baseline and show changes")
    .requiredOption("--baseline <file>", "Path to baseline scan JSON file")
    .option("--path <dir>", "Root path to scan", process.cwd())
    .action(async (opts) => {
      if (!fs.existsSync(opts.baseline)) {
        console.error(`Baseline file not found: ${opts.baseline}`);
        process.exit(1);
      }

      const baseline = JSON.parse(fs.readFileSync(opts.baseline, "utf-8"));
      const current = await probeScan({ path: opts.path });

      const baseCount = baseline.summary?.totalFindings ?? 0;
      const currCount = current.summary.totalFindings;
      const diff = currCount - baseCount;

      console.log("\n  @maiife/probe — Watch Mode\n");
      console.log(`  Baseline: ${baseCount} findings`);
      console.log(`  Current:  ${currCount} findings`);
      console.log(`  Change:   ${diff >= 0 ? "+" : ""}${diff}\n`);

      if (diff > 0) {
        console.log("  New findings detected since baseline.");
      } else if (diff < 0) {
        console.log("  Some findings resolved since baseline.");
      } else {
        console.log("  No changes detected.");
      }
      console.log();
    });
}
