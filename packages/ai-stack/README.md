# @maiife-ai-pub/ai-stack

> What's Your AI Stack? — Generate a shareable profile card of your AI toolkit with complexity score and tool breakdown.

[![npm](https://img.shields.io/npm/v/@maiife-ai-pub/ai-stack)](https://www.npmjs.com/package/@maiife-ai-pub/ai-stack)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](../../LICENSE)

Part of the [Maiife AI Governance Toolkit](https://github.com/sakthivelchan89/scan_your_ai_toolkit).

---

## Install

```bash
npm install -g @maiife-ai-pub/ai-stack
# or run without installing
npx @maiife-ai-pub/ai-stack --format svg --output my-stack.svg
```

---

## CLI

```bash
# Print your AI stack as SVG (default)
maiife-ai-stack

# Output as markdown badge
maiife-ai-stack --format markdown

# Output as JSON
maiife-ai-stack --format json

# Save to file
maiife-ai-stack --format svg --output my-stack.svg

# Scan a specific directory
maiife-ai-stack --path /path/to/project
```

---

## MCP Server

```json
{
  "mcpServers": {
    "maiife-ai-stack": {
      "command": "npx",
      "args": ["@maiife-ai-pub/ai-stack", "mcp"]
    }
  }
}
```

**Available tools:** `ai_stack_generate`

---

## Programmatic API

```ts
import { buildAIStackProfile, aggregateTeamStack } from "@maiife-ai-pub/ai-stack";

// Profile a single developer's stack
const profile = await buildAIStackProfile({ path: process.cwd() });
console.log(`Stack complexity: ${profile.complexity.total}/100 (${profile.complexity.level})`);

// Aggregate across a team
const teamMap = new Map([["alice", profileA], ["bob", profileB]]);
const team = aggregateTeamStack(teamMap);
console.log(`Team fragmentation: ${team.fragmentationScore}%`);
```

---

## License

[Apache 2.0](../../LICENSE) — Built by [Maiife](https://maiife.ai)
