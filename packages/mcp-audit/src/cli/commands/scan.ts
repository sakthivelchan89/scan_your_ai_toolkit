import { parseAllMCPConfigs } from "../../core/config-parser.js";
import { auditAll } from "../../core/scorer.js";
import type { AuditResult, ScoreCard } from "../../core/types.js";
import { resolvePostConfig } from "../../core/config.js";
import { postFindings } from "../../core/post.js";
import * as os from "node:os";
import * as crypto from "node:crypto";

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
  postTo?: string;
  key?: string;
  post?: boolean;
  postOnly?: boolean;
}): Promise<void> {
  const allServers = parseAllMCPConfigs(options.config);
  const filtered = options.servers
    ? allServers.filter((s) => options.servers!.split(",").includes(s.name))
    : allServers;

  const result = auditAll(filtered, options.config ?? "auto-detected");

  if (options.format === "json") {
    if (!options.postOnly) console.log(JSON.stringify(result, null, 2));
  } else {
    if (!options.postOnly) printTable(result);
  }

  // Opt-in POST to Maiife gateway.
  const cfg = resolvePostConfig({
    flags: { postTo: options.postTo, key: options.key },
    env: process.env,
  });

  const postingEnabled = options.post !== false;
  if (postingEnabled && cfg.gateway && cfg.apiKey) {
    const payload = {
      toolName: "mcp-audit" as const,
      findings: result as unknown as Record<string, unknown>,
      environment: {
        os: `${os.platform()}-${os.release()}`,
        hostnameHash: crypto.createHash("sha256").update(os.hostname()).digest("hex").slice(0, 16),
        nodeVersion: process.version,
      },
      scannedAt: new Date().toISOString(),
    };
    const post = await postFindings({ gateway: cfg.gateway, apiKey: cfg.apiKey, payload });
    if (post.ok) {
      if (!options.postOnly) console.error(`  posted findings to ${cfg.gateway}`);
    } else {
      console.error(`  WARN: POST failed (${post.status ?? "network"}): ${post.error ?? ""}`);
      if (options.postOnly) process.exit(1);
    }
  } else if (postingEnabled && cfg.gateway && !cfg.apiKey) {
    console.error("  WARN: MAIIFE_GATEWAY set but MAIIFE_API_KEY missing; skipping POST");
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
