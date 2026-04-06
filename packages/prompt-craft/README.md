# @maiife-ai-pub/prompt-craft

Gamified Personal Prompt Coach — Duolingo for AI prompting with levels, streaks, and badges.

Analyzes your prompts, scores them with `@maiife-ai-pub/prompt-score`, and guides you through leveled exercises to improve clarity, specificity, and output quality.

Part of the [Maiife OSS Toolkit](https://maiife.ai) for enterprise AI governance.

## Install

```bash
npm install @maiife-ai-pub/prompt-craft
```

## CLI Usage

### Score a prompt and get coaching feedback

```bash
npx @maiife-ai-pub/prompt-craft score "Summarize this document"
```

Example output:

```
Prompt Score: 42 / 100  (Level: Beginner)

  Clarity       3 / 10   Too vague — which document? what length?
  Specificity   4 / 10   No format or audience specified
  Context       2 / 10   Missing role, task, and constraints

Suggestions:
  - Add a role: "You are a technical writer..."
  - Specify output format: "in 3 bullet points"
  - Define the audience: "for a non-technical executive"

Improved prompt: "You are a technical writer. Summarize the following document in 3 bullet points for a non-technical executive."
New score: 87 / 100
```

### Start a coaching session

```bash
npx @maiife-ai-pub/prompt-craft coach
```

## MCP Server Usage

Add `@maiife-ai-pub/prompt-craft` as an MCP server in your Claude Desktop or Cursor config:

```json
{
  "mcpServers": {
    "prompt-craft": {
      "command": "npx",
      "args": ["@maiife-ai-pub/prompt-craft", "mcp"],
      "env": {}
    }
  }
}
```

Once configured, Claude/Cursor can call tools like `score_prompt`, `improve_prompt`, and `get_exercises` directly from the chat interface.

### Docker

```bash
docker run -i ghcr.io/sakthivelchan89/maiife-prompt-craft
```

## Programmatic API

```typescript
import { scorePrompt, improvePrompt, PromptLevel } from "@maiife-ai-pub/prompt-craft";

// Score a prompt
const result = await scorePrompt("Summarize this document");

console.log(`Score: ${result.score}`);
console.log(`Level: ${result.level}`);
console.log(`Suggestions: ${result.suggestions.join("\n")}`);

// Get an improved version
const improved = await improvePrompt("Summarize this document", {
  targetLevel: PromptLevel.Advanced,
  audience: "non-technical",
});

console.log(`Improved: ${improved.prompt}`);
console.log(`New score: ${improved.score}`);
```

## License

Apache 2.0 — see [LICENSE](./LICENSE)

Built by [Maiife](https://maiife.ai) — Enterprise AI Control Plane.
