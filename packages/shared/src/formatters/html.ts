import type { MaiifeTelemetry } from "../types.js";
export function formatHTML(data: MaiifeTelemetry): string {
  const riskColor = { low: "#22c55e", medium: "#f59e0b", high: "#ef4444", critical: "#dc2626" };
  const rows = data.results
    .map((f) => `<tr><td>${f.category}</td><td>${f.name}</td><td style="color:${riskColor[f.risk]}">${f.risk}</td></tr>`)
    .join("\n");
  return `<!DOCTYPE html>
<html>
<head>
  <title>${data.toolName} Report</title>
  <style>
    body { font-family: Inter, sans-serif; max-width: 800px; margin: 2rem auto; color: #0D1B2A; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: left; }
    th { background: #f9fafb; font-weight: 600; }
    .summary { margin-top: 1.5rem; padding: 1rem; background: #f0fdfa; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>${data.toolName}</h1>
  <p>Generated: ${data.timestamp}</p>
  <table>
    <thead><tr><th>Category</th><th>Name</th><th>Risk</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="summary">
    <strong>Risk Level:</strong> ${data.summary.riskLevel.toUpperCase()}<br>
    <strong>Total Findings:</strong> ${data.summary.totalFindings}
    <ul>${data.summary.recommendations.map((r) => `<li>${r}</li>`).join("")}</ul>
  </div>
</body>
</html>`;
}
