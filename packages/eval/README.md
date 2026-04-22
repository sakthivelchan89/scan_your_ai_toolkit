# @maiife-ai-pub/eval

> LLM-as-judge evaluation engine — score agent outputs with structured rubrics using Claude as the judge.

[![npm](https://img.shields.io/npm/v/@maiife-ai-pub/eval)](https://www.npmjs.com/package/@maiife-ai-pub/eval)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](../../LICENSE)

Part of the [Maiife AI Governance Toolkit](https://github.com/sakthivelchan89/scan_your_ai_toolkit).

---

## Install

```bash
npm install -g @maiife-ai-pub/eval
# or run without installing
npx @maiife-ai-pub/eval score --rubric code-review --input output.txt
```

---

## CLI

```bash
# Score a single output
maiife-eval score --rubric code-review --input output.txt

# Score a batch from a JSONL file
maiife-eval batch --rubric code-review --input outputs.jsonl

# Compare baseline vs candidate
maiife-eval compare --rubric code-review --baseline base.txt --candidate new.txt

# List available rubrics
maiife-eval rubrics
```

Set `ANTHROPIC_API_KEY` to enable Claude-as-judge scoring.

---

## MCP Server

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

**Available tools:** `eval_score`, `eval_batch`, `eval_compare`

---

## Programmatic API

```ts
import { evalScore, createClaudeJudge } from "@maiife-ai-pub/eval";

const judge = createClaudeJudge(process.env.ANTHROPIC_API_KEY);
const result = await evalScore({
  output: "The answer is 42.",
  rubric: { name: "accuracy", criteria: ["factually correct", "concise"] },
  judge,
});
console.log(`Score: ${result.score}/100 (${result.grade})`);
```

---

## Built-in Rubrics

`code-review` · `summarization` · `instruction-following` · `helpfulness` · `accuracy`

---

## License

[Apache 2.0](../../LICENSE) — Built by [Maiife](https://maiife.ai)
