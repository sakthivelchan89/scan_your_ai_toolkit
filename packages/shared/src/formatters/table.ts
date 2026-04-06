import type { MaiifeTelemetry } from "../types.js";
export function formatTable(data: MaiifeTelemetry): string {
  const lines: string[] = [];
  lines.push(`\n  ${data.toolName} v${data.toolVersion}`);
  lines.push(`  ${data.timestamp}\n`);
  for (const finding of data.results) {
    lines.push(`  [${finding.risk.toUpperCase().padEnd(8)}] ${finding.category}: ${finding.name}`);
  }
  lines.push(`\n  Summary: ${data.summary.totalFindings} findings — ${data.summary.riskLevel.toUpperCase()}`);
  for (const rec of data.summary.recommendations) {
    lines.push(`    - ${rec}`);
  }
  lines.push("");
  return lines.join("\n");
}
