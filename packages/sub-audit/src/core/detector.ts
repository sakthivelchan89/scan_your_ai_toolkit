import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import type { Subscription } from "./types.js";

const KNOWN_SUBSCRIPTIONS: { name: string; vendor: string; monthlyCost: number; detectPaths: string[] }[] = [
  { name: "GitHub Copilot", vendor: "github", monthlyCost: 10, detectPaths: [".config/github-copilot"] },
  { name: "Cursor Pro", vendor: "cursor", monthlyCost: 20, detectPaths: [".cursor"] },
  { name: "ChatGPT Plus", vendor: "openai", monthlyCost: 20, detectPaths: [] },
  { name: "Claude Pro", vendor: "anthropic", monthlyCost: 20, detectPaths: [] },
];

export function detectSubscriptions(): Subscription[] {
  const home = os.homedir();
  const found: Subscription[] = [];
  for (const sub of KNOWN_SUBSCRIPTIONS) {
    const detected = sub.detectPaths.length === 0 || sub.detectPaths.some((p) => fs.existsSync(path.join(home, p)));
    if (detected && sub.detectPaths.length > 0) {
      found.push({ name: sub.name, vendor: sub.vendor, monthlyCost: sub.monthlyCost, usageLast30d: 0, category: "subscription" });
    }
  }
  if (process.env.OPENAI_API_KEY) found.push({ name: "OpenAI API", vendor: "openai", monthlyCost: 0, usageLast30d: 0, category: "api" });
  if (process.env.ANTHROPIC_API_KEY) found.push({ name: "Anthropic API", vendor: "anthropic", monthlyCost: 0, usageLast30d: 0, category: "api" });
  return found;
}
