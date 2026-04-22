import type { AuditResult, ScoreCard } from "./types.js";

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface Finding {
  serverName: string;
  severity: Severity;
  score: number;
  grade: string;
  issues: string[];
  killSwitchRecommended: boolean;
}

function scoreToSeverity(score: number): Severity {
  if (score < 40) return "critical";
  if (score < 60) return "high";
  if (score < 75) return "medium";
  if (score < 90) return "low";
  return "info";
}

export function toFindings(result: AuditResult): Finding[] {
  return result.servers.map((card): Finding => ({
    serverName: card.serverName,
    severity: scoreToSeverity(card.score),
    score: card.score,
    grade: card.grade,
    issues: card.recommendations,
    killSwitchRecommended: card.score < 40,
  }));
}

/**
 * Returns true if this server's score is bad enough to warrant a kill switch.
 * Threshold: score < 40 (grade D or F).
 */
export function shouldKillSwitch(card: ScoreCard): boolean {
  return card.score < 40;
}

/**
 * Export audit results as structured JSON with severity classifications.
 */
export function exportFindings(result: AuditResult): string {
  const findings = toFindings(result);
  return JSON.stringify({
    timestamp: result.timestamp,
    configSource: result.configSource,
    overallGrade: result.overallGrade,
    overallScore: result.overallScore,
    criticalCount: result.criticalCount,
    killSwitchTargets: findings.filter((f) => f.killSwitchRecommended).map((f) => f.serverName),
    findings,
  }, null, 2);
}
