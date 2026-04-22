# @maiife-ai-pub/model-match

> Personal model recommender — find the best AI model for YOUR tasks based on cost, capability, and speed trade-offs.

[![npm](https://img.shields.io/npm/v/@maiife-ai-pub/model-match)](https://www.npmjs.com/package/@maiife-ai-pub/model-match)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](../../LICENSE)

Part of the [Maiife AI Governance Toolkit](https://github.com/sakthivelchan89/scan_your_ai_toolkit).

---

## Install

```bash
npm install -g @maiife-ai-pub/model-match
# or run without installing
npx @maiife-ai-pub/model-match recommend --task coding
```

---

## CLI

```bash
# Get a model recommendation for a task
maiife-model-match recommend --task coding

# Compare specific models
maiife-model-match compare --models gpt-4o,claude-sonnet-4-6 --task reasoning
```

---

## MCP Server

```json
{
  "mcpServers": {
    "maiife-model-match": {
      "command": "npx",
      "args": ["@maiife-ai-pub/model-match", "mcp"]
    }
  }
}
```

**Available tools:** `model_match_compare`, `model_match_recommend`

---

## Programmatic API

```ts
import { recommendModel, compareModels } from "@maiife-ai-pub/model-match";

// Get the best model for a task
const rec = await recommendModel({ task: "coding" });
console.log(`Recommended: ${rec.model} — ${rec.reason}`);

// Compare two models
const comparison = await compareModels({
  models: ["gpt-4o", "claude-sonnet-4-6"],
  task: "reasoning",
});
```

---

## Supported Models

`gpt-4.1` · `gpt-4.1-mini` · `gpt-4o` · `o3` · `o3-mini` · `o4-mini` · `claude-opus-4-5` · `claude-sonnet-4-5` · `claude-haiku-4-5` · `gemini-2.5-pro` · `gemini-2.5-flash`

---

## License

[Apache 2.0](../../LICENSE) — Built by [Maiife](https://maiife.ai)
