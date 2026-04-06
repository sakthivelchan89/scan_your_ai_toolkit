# @maiife-ai-pub/model-match

Personal Model Recommender — find the best model for YOUR tasks.

Profiles your actual task distribution and recommends the optimal model(s) using evaluation data from `@maiife-ai-pub/eval`. Considers cost, latency, quality, and context window requirements.

Part of the [Maiife OSS Toolkit](https://maiife.ai) for enterprise AI governance.

## Install

```bash
npm install @maiife-ai-pub/model-match
```

## CLI Usage

### Get model recommendations

```bash
npx @maiife-ai-pub/model-match recommend
```

Example output:

```
Model Match for Your Task Profile

  Task breakdown:
    Code generation   45%
    Summarization     30%
    Q&A               15%
    Creative writing  10%

  Top recommendations:
    1. claude-3-5-sonnet   Score: 94   Best for: code + summarization, balanced cost
    2. gpt-4o-mini         Score: 81   Best for: high-volume Q&A, lowest cost
    3. gemini-1.5-pro      Score: 78   Best for: long-context summarization

  Current model: gpt-4o   Estimated waste: $23/mo
```

### Recommend for a specific task type

```bash
npx @maiife-ai-pub/model-match recommend --task "code-review"
```

## MCP Server Usage

Add `@maiife-ai-pub/model-match` as an MCP server in your Claude Desktop or Cursor config:

```json
{
  "mcpServers": {
    "model-match": {
      "command": "npx",
      "args": ["@maiife-ai-pub/model-match", "mcp"],
      "env": {}
    }
  }
}
```

Once configured, Claude/Cursor can call tools like `recommend_model`, `compare_models`, and `estimate_cost` directly from the chat interface.

### Docker

```bash
docker run -i ghcr.io/sakthivelchan89/maiife-model-match
```

## Programmatic API

```typescript
import { recommendModel, compareModels, TaskProfile } from "@maiife-ai-pub/model-match";

// Build a task profile
const profile: TaskProfile = {
  codeGeneration: 0.45,
  summarization: 0.30,
  qa: 0.15,
  creativeWriting: 0.10,
};

// Get top recommendations
const recommendations = await recommendModel(profile, {
  maxMonthlyCost: 50,
  minContextWindow: 32000,
});

console.log(`Top pick: ${recommendations[0].model} (score: ${recommendations[0].score})`);

// Compare two specific models side-by-side
const comparison = await compareModels("claude-3-5-sonnet", "gpt-4o", profile);
console.log(comparison.summary);
```

## License

Apache 2.0 — see [LICENSE](./LICENSE)

Built by [Maiife](https://maiife.ai) — Enterprise AI Control Plane.
