# @maiife-ai-pub/prompt-score

Prompt quality analyzer — score, improve, and lint your AI prompts before they reach your LLM.

Part of the [Maiife](https://maiife.ai) OSS toolkit for AI governance.

## Install

```bash
npm install @maiife-ai-pub/prompt-score
```

Or use directly without installing:

```bash
npx @maiife-ai-pub/prompt-score score "Your prompt here"
```

## CLI Usage

### Score a prompt

```bash
npx @maiife-ai-pub/prompt-score score "Summarize the following document: ..."
```

Example output:

```
Maiife Prompt Score v0.1.0

Prompt Analysis
  Length            312 chars     OK
  Clarity           high          clear instruction verb detected
  Specificity       medium        consider adding output format
  Role / Persona    none          tip: add a system role for better results
  Injection Risk    low           no obvious injection patterns

Score: 74/100

Suggestions:
  1. Add an output format instruction (e.g. "Return as a bullet list")
  2. Specify a persona: "You are a senior analyst..."
```

### Lint a prompt file

```bash
npx @maiife-ai-pub/prompt-score lint prompts/summarize.txt
```

### Watch a directory for prompt changes

```bash
npx @maiife-ai-pub/prompt-score lint prompts/ --watch
```

### Output formats

```bash
npx @maiife-ai-pub/prompt-score score "..." --format json
npx @maiife-ai-pub/prompt-score score "..." --format table
npx @maiife-ai-pub/prompt-score score "..." --format html > report.html
```

## MCP Server Usage

Add `@maiife-ai-pub/prompt-score` as an MCP server so AI assistants can score and improve prompts on demand.

### Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json`)

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

### Cursor (`.cursor/mcp.json` in your project or `~/.cursor/mcp.json` globally)

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

Once configured, your AI assistant can call tools like `prompt_score`, `prompt_improve`, and `prompt_lint`.

### Docker

```bash
docker run -i ghcr.io/sakthivelchan89/maiife-prompt-score
```

## Programmatic API

```typescript
import { scorePrompt, lintPrompt, improvePrompt } from "@maiife-ai-pub/prompt-score";

const result = await scorePrompt("Summarize the document below...");

console.log(result.score);        // 0-100
console.log(result.issues);       // array of linting issues
console.log(result.suggestions);  // improvement suggestions
```

### Types

```typescript
import type { PromptScoreResult, PromptIssue, ScoreDimension } from "@maiife-ai-pub/prompt-score";
```

## Requirements

- Node.js >= 18

## License

Apache 2.0 — see [LICENSE](./LICENSE)

Copyright 2026 Maiife — [maiife.ai](https://maiife.ai)
