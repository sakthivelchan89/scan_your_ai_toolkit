# @maiife-ai-pub/prompt-score

> Prompt quality analyzer — score, improve, and lint your AI prompts across clarity, specificity, context, and safety dimensions.

[![npm](https://img.shields.io/npm/v/@maiife-ai-pub/prompt-score)](https://www.npmjs.com/package/@maiife-ai-pub/prompt-score)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](../../LICENSE)

Part of the [Maiife AI Governance Toolkit](https://github.com/sakthivelchan89/scan_your_ai_toolkit).

---

## Install

```bash
npm install -g @maiife-ai-pub/prompt-score
# or run without installing
npx @maiife-ai-pub/prompt-score analyze --input prompt.txt
```

---

## CLI

```bash
# Analyze a prompt file
maiife-prompt-score analyze --input prompt.txt

# Get an improved version
maiife-prompt-score improve --input prompt.txt

# Lint prompts in a directory
maiife-prompt-score lint --dir ./prompts

# Track scores over time for a project
maiife-prompt-score track --project my-app
```

---

## MCP Server

```json
{
  "mcpServers": {
    "maiife-prompt-score": {
      "command": "npx",
      "args": ["@maiife-ai-pub/prompt-score", "mcp"]
    }
  }
}
```

**Available tools:** `prompt_score_analyze`, `prompt_score_improve`, `prompt_score_track`

---

## Programmatic API

```ts
import { scorePrompt, improvePrompt, createPromptGate } from "@maiife-ai-pub/prompt-score";

// Score a prompt
const result = scorePrompt("Summarize this.");
console.log(`Score: ${result.score}/100 (${result.grade})`);
// { score: 42, grade: "D", dimensions: { clarity: 50, specificity: 30, ... } }

// Gate prompts below a threshold
const gate = createPromptGate({ minScore: 60 });
const check = gate.check("Summarize this.");
if (!check.allow) console.warn(`Prompt blocked: ${check.reason}`);
```

---

## Scoring Dimensions

| Dimension | What it checks |
|-----------|----------------|
| **Clarity** | Unambiguous instruction, no contradictions |
| **Specificity** | Concrete constraints, examples, format hints |
| **Context** | Role, background, relevant details provided |
| **Safety** | No jailbreak patterns, appropriate scope |

---

## License

[Apache 2.0](../../LICENSE) — Built by [Maiife](https://maiife.ai)
