import * as fs from "node:fs";
import * as path from "node:path";
import type { APIKeyFinding, Scanner, ScanConfig } from "../types.js";

const ENV_FILES = [".env", ".env.local", ".env.production", ".env.development"];

const KEY_PATTERNS: Array<{ pattern: RegExp; vendor: string }> = [
  { pattern: /^OPENAI_API_KEY$/i, vendor: "openai" },
  { pattern: /^ANTHROPIC_API_KEY$/i, vendor: "anthropic" },
  { pattern: /^COHERE_API_KEY$/i, vendor: "cohere" },
  { pattern: /^(GOOGLE_AI_KEY|GEMINI_API_KEY)$/i, vendor: "google" },
  { pattern: /^MISTRAL_API_KEY$/i, vendor: "mistral" },
  { pattern: /^GROQ_API_KEY$/i, vendor: "groq" },
  { pattern: /^TOGETHER_API_KEY$/i, vendor: "together" },
];

function detectVendor(varName: string): string | null {
  for (const { pattern, vendor } of KEY_PATTERNS) {
    if (pattern.test(varName)) return vendor;
  }
  return null;
}

function parseEnvFile(content: string): string[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const eqIdx = line.indexOf("=");
      return eqIdx > 0 ? line.slice(0, eqIdx).trim() : "";
    })
    .filter(Boolean);
}

export function createKeysScanner(): Scanner<APIKeyFinding> {
  return {
    name: "keys",
    async scan(config: ScanConfig): Promise<APIKeyFinding[]> {
      const findings: APIKeyFinding[] = [];

      for (const envFile of ENV_FILES) {
        const filePath = path.join(config.path, envFile);
        if (!fs.existsSync(filePath)) continue;

        try {
          const raw = fs.readFileSync(filePath, "utf-8") as string;
          const varNames = parseEnvFile(raw);

          for (const varName of varNames) {
            const vendor = detectVendor(varName);
            if (!vendor) continue;
            findings.push({
              vendor,
              location: filePath,
              variable: varName,
              managed: false,
            });
          }
        } catch {
          // ignore read errors
        }
      }

      return findings;
    },
  };
}
