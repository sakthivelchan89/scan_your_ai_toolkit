import * as fs from "node:fs";
import * as path from "node:path";
import type { SyncTarget, ContextEntry, SyncResult } from "../types.js";

function findCursorRulesPath(): string {
  return path.join(process.cwd(), ".cursorrules");
}

function entriesToRules(entries: ContextEntry[]): string {
  const lines = ["# AI Context (synced by @maiife/context-sync)", ""];
  const grouped = new Map<string, ContextEntry[]>();
  for (const entry of entries) {
    const cat = grouped.get(entry.category) ?? [];
    cat.push(entry);
    grouped.set(entry.category, cat);
  }
  for (const [category, items] of grouped) {
    lines.push(`## ${category}`);
    for (const item of items) {
      lines.push(`- ${item.key}: ${item.value}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

function parseRules(content: string): ContextEntry[] {
  const entries: ContextEntry[] = [];
  let currentCategory = "general";
  for (const line of content.split("\n")) {
    if (line.startsWith("## ")) {
      currentCategory = line.slice(3).trim();
    } else if (line.startsWith("- ") && line.includes(": ")) {
      const [key, ...rest] = line.slice(2).split(": ");
      entries.push({ key: key.trim(), value: rest.join(": ").trim(), category: currentCategory, updatedAt: new Date().toISOString() });
    }
  }
  return entries;
}

export function createCursorRulesTarget(): SyncTarget {
  return {
    name: "cursorrules",
    description: "Sync to .cursorrules in the current project",
    async push(entries: ContextEntry[]): Promise<SyncResult> {
      try {
        fs.writeFileSync(findCursorRulesPath(), entriesToRules(entries), "utf-8");
        return { target: "cursorrules", success: true, entriesSynced: entries.length };
      } catch (e) {
        return { target: "cursorrules", success: false, entriesSynced: 0, error: (e as Error).message };
      }
    },
    async pull(): Promise<ContextEntry[]> {
      const filePath = findCursorRulesPath();
      if (!fs.existsSync(filePath)) return [];
      return parseRules(fs.readFileSync(filePath, "utf-8"));
    },
    async detect(): Promise<boolean> {
      return fs.existsSync(findCursorRulesPath());
    },
  };
}
