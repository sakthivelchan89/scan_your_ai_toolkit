import { parseAllMCPConfigs } from "../../core/config-parser.js";
import { auditAll } from "../../core/scorer.js";
import type { AuditResult, ScoreCard } from "../../core/types.js";

function scoreBar(score: number, width = 12): string {
  const filled = Math.round((score / 100) * width);
  const empty = width - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

function gradeDisplay(card: ScoreCard): string {
  const plusMinus = card.score % 10 >= 7 ? "+" : card.score % 10 <= 3 ? "-" : "";
  return `${card.grade}${plusMinus}`;
}

function printTable(result: AuditResult): void {
  console.log(`\nMCP Audit Report — ${result.configSource}`);
  console.log(`Overall: ${result.overallGrade}  (Score: ${result.overallScore})  Critical: ${result.criticalCount}\n`);

  for (const card of result.servers) {
    const bar = scoreBar(card.score);
    console.log(`  ${card.serverName.padEnd(20)} ${bar}  ${gradeDisplay(card).padEnd(3)}  (Score: ${card.score})`);
    for (let i = 0; i < card.dimensions.length; i++) {
      const d = card.dimensions[i];
      const prefix = i < card.dimensions.length - 1 ? "├─" : "└─";
      const icon = d.score >= 75 ? "✓" : d.score >= 50 ? "!" : "✗";
      console.log(`  ${prefix} ${d.dimension.padEnd(15)} ${icon}  ${d.details[0] ?? ""}`);
    }
    if (card.recommendations.length > 0) {
      console.log(`     recommendations:`);
      for (const rec of card.recommendations) {
        console.log(`       - ${rec}`);
      }
    }
    console.log();
  }
}

export async function runScan(options: {
  config?: string;
  servers?: string;
  format: string;
  ci: boolean;
  minGrade: string;
}): Promise<void> {
  const allServers = parseAllMCPConfigs(options.config);
  const filtered = options.servers
    ? allServers.filter((s) => options.servers!.split(",").includes(s.name))
    : allServers;

  const result = auditAll(filtered, options.config ?? "auto-detected");

  if (options.format === "json") {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printTable(result);
  }

  // CI exit code: fail if any server is below min grade
  if (options.ci) {
    const gradeOrder = ["A", "B", "C", "D", "F"];
    const minIdx = gradeOrder.indexOf(options.minGrade.toUpperCase());
    const failed = result.servers.filter((s) => gradeOrder.indexOf(s.grade) > minIdx);
    if (failed.length > 0) {
      console.error(`\nCI FAIL: ${failed.length} server(s) below minimum grade ${options.minGrade}`);
      process.exit(1);
    }
  }
}
