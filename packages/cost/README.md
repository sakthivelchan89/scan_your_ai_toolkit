# @maiife-ai-pub/cost

> AI spend calculator + optimizer — unified cost report across OpenAI, Anthropic, Cohere, Google, and local models.

[![npm](https://img.shields.io/npm/v/@maiife-ai-pub/cost)](https://www.npmjs.com/package/@maiife-ai-pub/cost)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](../../LICENSE)

Part of the [Maiife AI Governance Toolkit](https://github.com/sakthivelchan89/scan_your_ai_toolkit).

---

## Install

```bash
npm install -g @maiife-ai-pub/cost
# or run without installing
npx @maiife-ai-pub/cost report
```

---

## CLI

```bash
# Spend report for the last 30 days
maiife-cost report

# Optimization suggestions
maiife-cost optimize
```

Set your API keys as environment variables:

```bash
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
```

---

## MCP Server

```json
{
  "mcpServers": {
    "maiife-cost": {
      "command": "npx",
      "args": ["@maiife-ai-pub/cost", "mcp"]
    }
  }
}
```

**Available tools:** `cost_report`, `cost_optimize`

---

## Programmatic API

```ts
import { estimateCost } from "@maiife-ai-pub/cost";

// Estimate cost for a single request
const usd = estimateCost("gpt-4o", 1500, 300);
console.log(`$${usd.toFixed(4)}`);
```

---

## Supported Models & Pricing

Includes current pricing for: `gpt-4.1`, `gpt-4.1-mini`, `gpt-4o`, `o3`, `o3-mini`, `o4-mini`, `claude-opus-4-5`, `claude-sonnet-4-5`, `claude-haiku-4-5`, `gemini-2.5-pro`, `gemini-2.5-flash`, `command-r-plus`, and more.

Pricing updated April 2026.

---

## License

[Apache 2.0](../../LICENSE) — Built by [Maiife](https://maiife.ai)
