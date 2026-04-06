import * as fs from "node:fs";
import * as path from "node:path";
import type { DepFinding, Scanner, ScanConfig } from "../types.js";

const AI_SDK_PACKAGES: Array<{ name: string; category: string }> = [
  { name: "ai", category: "vercel-ai-sdk" },
  { name: "@ai-sdk/openai", category: "vercel-ai-sdk" },
  { name: "@ai-sdk/anthropic", category: "vercel-ai-sdk" },
  { name: "litellm", category: "litellm" },
  { name: "openai", category: "openai-sdk" },
  { name: "@anthropic-ai/sdk", category: "anthropic-sdk" },
  { name: "@google/generative-ai", category: "google-ai-sdk" },
  { name: "cohere-ai", category: "cohere-sdk" },
];

const AI_SDK_MAP = new Map(AI_SDK_PACKAGES.map((p) => [p.name, p.category]));

export function createDepsScanner(): Scanner<DepFinding> {
  return {
    name: "deps",
    async scan(config: ScanConfig): Promise<DepFinding[]> {
      if (!config.includeProjectDeps) return [];

      const pkgPath = path.join(config.path, "package.json");
      if (!fs.existsSync(pkgPath)) return [];

      try {
        const raw = fs.readFileSync(pkgPath, "utf-8") as string;
        const pkg = JSON.parse(raw);
        const allDeps: Record<string, string> = {
          ...(pkg.dependencies ?? {}),
          ...(pkg.devDependencies ?? {}),
        };

        const findings: DepFinding[] = [];
        for (const [name, version] of Object.entries(allDeps)) {
          const category = AI_SDK_MAP.get(name);
          if (category) {
            findings.push({
              name,
              version: String(version),
              project: config.path,
              category,
            });
          }
        }
        return findings;
      } catch {
        return [];
      }
    },
  };
}
