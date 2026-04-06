import type { AIStackProfile } from "../core/types.js";

export function renderMarkdown(profile: AIStackProfile): string {
  const { complexity, categories, stats } = profile;
  const lines = [
    `## 🧠 My AI Stack — Score: ${complexity.total}/100 (${complexity.level})`,
    "",
    `**${stats.totalTools} tools** · ${stats.mcpServerCount} MCP servers · ${stats.agentFrameworkCount} agents · ${stats.localModelCount} local models`,
    "",
  ];
  for (const cat of categories) {
    lines.push(`### ${cat.emoji} ${cat.name}`);
    for (const item of cat.items) {
      lines.push(`- ${item.name}${item.version ? ` v${item.version}` : ""}`);
    }
    lines.push("");
  }
  lines.push(`---`);
  lines.push(`*Generated with [@maiife/ai-stack](https://github.com/maiife/toolkit)*`);
  return lines.join("\n");
}
