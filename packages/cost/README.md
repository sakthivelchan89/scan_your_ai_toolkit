# @maiife-ai-pub/cost

AI spend calculator + optimizer — unified cost report across all your AI vendors (OpenAI, Anthropic, Google, Cohere, and more).

Part of the [Maiife](https://maiife.ai) OSS toolkit for AI governance.

## Install

```bash
npm install @maiife-ai-pub/cost
```

Or use directly without installing:

```bash
npx @maiife-ai-pub/cost report
```

## CLI Usage

### Generate a cost report

```bash
npx @maiife-ai-pub/cost report
```

Example output:

```
Maiife Cost v0.1.0

AI Spend Report — April 2026

  Vendor          Requests   Tokens (in/out)   Cost
  OpenAI          4,821      2.1M / 890K       $47.23
  Anthropic       1,203      412K / 201K       $18.94
  Google          892        341K / 98K        $6.12
  -------------------------------------------------------
  Total           6,916      2.85M / 1.19M     $72.29

  Month-to-date budget: $72.29 / $150.00 (48%)
  Projected month-end:  $89.14

  Top models by cost:
    gpt-4o              $31.12 (43%)
    claude-3-5-sonnet   $18.94 (26%)
    gpt-4o-mini         $16.11 (22%)
```

### Show cost for a single request

```bash
npx @maiife-ai-pub/cost calc --model gpt-4o --input 1500 --output 600
```

### Compare model costs

```bash
npx @maiife-ai-pub/cost compare --models gpt-4o,claude-3-5-sonnet,gemini-1.5-pro
```

### Output formats

```bash
npx @maiife-ai-pub/cost report --format json
npx @maiife-ai-pub/cost report --format table
npx @maiife-ai-pub/cost report --format html > report.html
```

## MCP Server Usage

Add `@maiife-ai-pub/cost` as an MCP server so AI assistants can query and analyze AI spend.

### Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json`)

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

### Cursor (`.cursor/mcp.json` in your project or `~/.cursor/mcp.json` globally)

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

Once configured, your AI assistant can call tools like `cost_report`, `cost_calc`, and `cost_compare`.

### Docker

```bash
docker run -i ghcr.io/sakthivelchan89/maiife-cost
```

## Programmatic API

```typescript
import { calcCost, getModelPricing, buildReport } from "@maiife-ai-pub/cost";

// Calculate cost for a single request
const cost = calcCost({ model: "gpt-4o", inputTokens: 1500, outputTokens: 600 });
console.log(cost.usd);  // e.g. 0.0165

// Get pricing table for a model
const pricing = getModelPricing("claude-3-5-sonnet");
console.log(pricing.inputPer1M);   // per-million input token price
console.log(pricing.outputPer1M);  // per-million output token price
```

### Types

```typescript
import type { CostResult, ModelPricing, SpendReport } from "@maiife-ai-pub/cost";
```

## Requirements

- Node.js >= 18

## License

Apache 2.0 — see [LICENSE](./LICENSE)

Copyright 2026 Maiife — [maiife.ai](https://maiife.ai)
