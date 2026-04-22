import * as fs from "node:fs";
import * as path from "node:path";
import type { SyncTarget, ContextEntry, SyncResult } from "../types.js";

function findClaudeMdPath(): string {
  return path.join(process.cwd(), "CLAUDE.md");
}

function entriesToClaudeMd(entries: ContextEntry[]): string {
  const lines = ["# AI Context", "", "> Synced by @maiife/context-sync", ""];
  const grouped = new Map<string, ContextEntry[]>();
  for (const entry of entries) {
    const cat = grouped.get(entry.category) ?? [];
    cat.push(entry);
    grouped.set(entry.category, cat);
  }
  for (const [category, items] of grouped) {
    lines.push(`## ${category}`);
    for (const item of items) {
      lines.push(`- **${item.key}**: ${item.value}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

function parseClaudeMd(content: string): ContextEntry[] {
  const entries: ContextEntry[] = [];
  let currentCategory = "general";
  for (const line of content.split("\n")) {
    if (line.startsWith("## ")) {
      currentCategory = line.slice(3).trim();
    } else if (line.startsWith("- **") && line.includes("**: ")) {
      const match = line.match(/^- \*\*(.+?)\*\*: (.+)/);
      if (match) {
        entries.push({ key: match[1], value: match[2], category: currentCategory, updatedAt: new Date().toISOString() });
      }
    }
  }
  return entries;
}

export function createClaudeTarget(): SyncTarget {
  return {
    name: "claude" as const,
    description: "Sync to CLAUDE.md in the current project",
    async push(entries: ContextEntry[]): Promise<SyncResult> {
      try {
        fs.writeFileSync(findClaudeMdPath(), entriesToClaudeMd(entries), "utf-8");
        return { target: "claude", success: true, entriesSynced: entries.length };
      } catch (e) {
        return { target: "claude", success: false, entriesSynced: 0, error: (e as Error).message };
      }
    },
    async pull(): Promise<ContextEntry[]> {
      const filePath = findClaudeMdPath();
      if (!fs.existsSync(filePath)) return [];
      return parseClaudeMd(fs.readFileSync(filePath, "utf-8"));
    },
    async detect(): Promise<boolean> {
      return true;
    },
  };
}
