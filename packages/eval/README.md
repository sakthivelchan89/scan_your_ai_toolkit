# @maiife-ai-pub/eval

LLM-as-judge evaluation engine — score agent outputs with structured rubrics and track quality over time.

Part of the [Maiife](https://maiife.ai) OSS toolkit for AI governance.

## Install

```bash
npm install @maiife-ai-pub/eval
```

Or use directly without installing:

```bash
npx @maiife-ai-pub/eval run --input output.json --rubric rubric.json
```

## CLI Usage

### Run an evaluation

```bash
npx @maiife-ai-pub/eval run --input output.json --rubric rubric.json
```

Example output:

```
Maiife Eval v0.1.0

Evaluation Results
  Rubric: customer-support-v1

  Criteria
    Accuracy          9/10    response facts are correct
    Helpfulness       8/10    addresses all user questions
    Tone              10/10   professional and empathetic
    Conciseness       7/10    slightly verbose

  Overall Score: 85/100   PASS (threshold: 70)
```

### List available rubrics

```bash
npx @maiife-ai-pub/eval rubrics list
```

### Create a custom rubric

```bash
npx @maiife-ai-pub/eval rubrics create my-rubric.json
```

### Output formats

```bash
npx @maiife-ai-pub/eval run --input output.json --rubric rubric.json --format json
npx @maiife-ai-pub/eval run --input output.json --rubric rubric.json --format html > report.html
```

## MCP Server Usage

Add `@maiife-ai-pub/eval` as an MCP server so AI assistants can evaluate outputs on demand.

### Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "maiife-eval": {
      "command": "npx",
      "args": ["@maiife-ai-pub/eval", "mcp"]
    }
  }
}
```

### Cursor (`.cursor/mcp.json` in your project or `~/.cursor/mcp.json` globally)

```json
{
  "mcpServers": {
    "maiife-eval": {
      "command": "npx",
      "args": ["@maiife-ai-pub/eval", "mcp"]
    }
  }
}
```

Once configured, your AI assistant can call tools like `eval_run`, `eval_list_rubrics`, and `eval_compare`.

### Docker

```bash
docker run -i ghcr.io/sakthivelchan89/maiife-eval
```

## Programmatic API

```typescript
import { evaluate } from "@maiife-ai-pub/eval";

const result = await evaluate({
  input: "What is the refund policy?",
  output: "You can return items within 30 days...",
  rubricId: "customer-support-v1",
});

console.log(result.score);     // 0-100
console.log(result.passed);    // boolean
console.log(result.criteria);  // per-criterion scores
```

### Types

```typescript
import type { EvalResult, EvalCriterion, Rubric } from "@maiife-ai-pub/eval";
```

## Requirements

- Node.js >= 18

## License

Apache 2.0 — see [LICENSE](./LICENSE)

Copyright 2026 Maiife — [maiife.ai](https://maiife.ai)
