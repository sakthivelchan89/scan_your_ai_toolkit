# @maiife-ai-pub/prompt-craft

> Gamified personal prompt coach — Duolingo for AI prompting. Earn XP, unlock levels and badges as your prompts improve.

[![npm](https://img.shields.io/npm/v/@maiife-ai-pub/prompt-craft)](https://www.npmjs.com/package/@maiife-ai-pub/prompt-craft)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](../../LICENSE)

Part of the [Maiife AI Governance Toolkit](https://github.com/sakthivelchan89/scan_your_ai_toolkit).

---

## Install

```bash
npm install -g @maiife-ai-pub/prompt-craft
# or run without installing
npx @maiife-ai-pub/prompt-craft score --input prompt.txt
```

---

## CLI

```bash
# Score a prompt and earn XP
maiife-prompt-craft score --input prompt.txt

# Get an improved version of your prompt
maiife-prompt-craft improve --input prompt.txt

# View your profile (level, XP, badges)
maiife-prompt-craft profile

# Get this week's prompting challenge
maiife-prompt-craft challenge
```

---

## MCP Server

```json
{
  "mcpServers": {
    "maiife-prompt-craft": {
      "command": "npx",
      "args": ["@maiife-ai-pub/prompt-craft", "mcp"]
    }
  }
}
```

**Available tools:** `prompt_craft_score`, `prompt_craft_improve`, `prompt_craft_profile`, `prompt_craft_challenge`

---

## Programmatic API

```ts
import { recordScore, getLevelName, checkBadges, diffPrompts } from "@maiife-ai-pub/prompt-craft";

// Record a score and earn XP
const result = recordScore(75);
console.log(`Level: ${getLevelName(result.totalXP)} | +${result.xpGained} XP`);

// Check for newly unlocked badges
const badges = checkBadges(result.totalXP, result.streak);

// Diff two prompt versions
const diff = diffPrompts(beforePrompt, afterPrompt, 42, 75);
console.log(formatDiff(diff));
```

Progress is stored locally at `~/.maiife/prompt-craft.json`.

---

## License

[Apache 2.0](../../LICENSE) — Built by [Maiife](https://maiife.ai)
