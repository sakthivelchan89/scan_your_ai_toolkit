import type { ParsedMCPServer, ScoreCard, AuditResult } from "./types.js";
import { gradeFromScore } from "./types.js";
import { scorePermissions } from "./dimensions/permissions.js";
import { scoreSensitivity } from "./dimensions/sensitivity.js";
import { scoreAuth } from "./dimensions/auth.js";
import { scoreBlastRadius } from "./dimensions/blast-radius.js";
import { scoreVersioning } from "./dimensions/versioning.js";

export function scoreServer(server: ParsedMCPServer): ScoreCard {
  const dimensions = [
    scorePermissions(server),
    scoreSensitivity(server),
    scoreAuth(server),
    scoreBlastRadius(server),
    scoreVersioning(server),
  ];
  const weightedScore = dimensions.reduce((sum, d) => sum + d.score * d.weight, 0);
  const score = Math.round(weightedScore);
  const recommendations: string[] = [];
  for (const d of dimensions) {
    if (d.score < 60) {
      recommendations.push(`${d.dimension}: ${d.details.join("; ")} — improve to raise grade`);
    }
  }
  return { serverName: server.name, grade: gradeFromScore(score), score, dimensions, recommendations };
}

export function auditAll(servers: ParsedMCPServer[], configSource: string): AuditResult {
  const scoreCards = servers.map(scoreServer);
  const avgScore = scoreCards.length > 0
    ? Math.round(scoreCards.reduce((sum, s) => sum + s.score, 0) / scoreCards.length)
    : 100;
  return {
    timestamp: new Date().toISOString(),
    configSource,
    servers: scoreCards,
    overallGrade: gradeFromScore(avgScore),
    overallScore: avgScore,
    criticalCount: scoreCards.filter((s) => s.grade === "D" || s.grade === "F").length,
  };
}
