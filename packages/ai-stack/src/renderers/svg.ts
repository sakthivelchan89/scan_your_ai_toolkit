import type { AIStackProfile, StackCategory } from "../core/types.js";

function renderCategory(cat: StackCategory, x: number, y: number): string {
  const items = cat.items.map((item, i) =>
    `<text x="${x}" y="${y + 28 + i * 22}" fill="#94A3B8" font-size="14" font-family="'JetBrains Mono', monospace">${item.name}${item.version ? ` v${item.version}` : ""}</text>`
  ).join("\n");

  return `
    <text x="${x}" y="${y}" fill="#F0FDFA" font-size="16" font-weight="600" font-family="Inter, sans-serif">${cat.emoji} ${cat.name}</text>
    ${items}
  `;
}

export function renderSVG(profile: AIStackProfile): string {
  const { complexity, categories, stats } = profile;
  const categoryBlocks = categories.slice(0, 4).map((cat, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 60 + col * 380;
    const y = 200 + row * 180;
    return renderCategory(cat, x, y);
  }).join("\n");

  const barWidth = Math.round((complexity.total / 100) * 200);
  const barColor = complexity.total >= 75 ? "#14B8A6" : complexity.total >= 50 ? "#0D9488" : complexity.total >= 25 ? "#F59E0B" : "#64748B";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0D1B2A"/>
      <stop offset="100%" stop-color="#1B2D45"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" rx="16"/>
  <text x="60" y="70" fill="#F0FDFA" font-size="32" font-weight="700" font-family="Syne, sans-serif">🧠 My AI Stack</text>
  <text x="60" y="110" fill="#94A3B8" font-size="16" font-family="Inter, sans-serif">AI Complexity Score</text>
  <rect x="60" y="120" width="200" height="12" fill="#1E293B" rx="6"/>
  <rect x="60" y="120" width="${barWidth}" height="12" fill="${barColor}" rx="6"/>
  <text x="270" y="132" fill="${barColor}" font-size="18" font-weight="700" font-family="Inter, sans-serif">${complexity.total}</text>
  <text x="300" y="132" fill="#64748B" font-size="14" font-family="Inter, sans-serif">${complexity.level}</text>
  <text x="550" y="70" fill="#94A3B8" font-size="14" font-family="Inter, sans-serif">${stats.totalTools} tools · ${stats.mcpServerCount} MCP servers · ${stats.agentFrameworkCount} agents · ${stats.localModelCount} local models</text>
  ${categoryBlocks}
  <text x="60" y="600" fill="#475569" font-size="12" font-family="Inter, sans-serif">Generated ${profile.generatedAt.split("T")[0]}</text>
  <text x="1050" y="600" fill="#0D9488" font-size="13" font-family="Inter, sans-serif">powered by maiife</text>
</svg>`;
}
