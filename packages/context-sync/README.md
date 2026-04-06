# @maiife-ai-pub/context-sync

Cross-Tool AI Memory Sync — maintain one source of truth for your AI context and sync it across Claude, Cursor, Copilot, and other tools automatically.

Part of the [Maiife](https://maiife.ai) OSS toolkit for AI governance.

## Install

```bash
npm install @maiife-ai-pub/context-sync
```

Or use directly without installing:

```bash
npx @maiife-ai-pub/context-sync status
```

## CLI Usage

### Check sync status

```bash
npx @maiife-ai-pub/context-sync status
```

Example output:

```
Maiife Context Sync v0.1.0

Sync Status

  Context Store: ~/.maiife/context.json
  Last updated: 2026-04-04 14:32

  Tool Integrations
    Claude Desktop      synced    2 min ago
    Cursor              synced    2 min ago
    VS Code Copilot     stale     last sync 3h ago
    Continue            not configured

  Context Entries: 14
    project-overview    742 chars    all tools
    tech-stack          318 chars    all tools
    coding-style        201 chars    claude, cursor
    team-norms          95 chars     all tools
```

### Add a context entry

```bash
npx @maiife-ai-pub/context-sync add project-overview "This is a pnpm monorepo with Fastify API and Next.js console..."
```

### Sync to all configured tools

```bash
npx @maiife-ai-pub/context-sync push
```

### Pull latest context from a tool

```bash
npx @maiife-ai-pub/context-sync pull --from claude
```

### Watch for changes and auto-sync

```bash
npx @maiife-ai-pub/context-sync watch
```

## MCP Server Usage

Add `@maiife-ai-pub/context-sync` as an MCP server so AI assistants can read and write shared context entries.

### Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "maiife-context-sync": {
      "command": "npx",
      "args": ["@maiife-ai-pub/context-sync", "mcp"]
    }
  }
}
```

### Cursor (`.cursor/mcp.json` in your project or `~/.cursor/mcp.json` globally)

```json
{
  "mcpServers": {
    "maiife-context-sync": {
      "command": "npx",
      "args": ["@maiife-ai-pub/context-sync", "mcp"]
    }
  }
}
```

Once configured, your AI assistant can call tools like `context_get`, `context_set`, `context_list`, and `context_push`.

### Docker

```bash
docker run -i ghcr.io/sakthivelchan89/maiife-context-sync
```

## Programmatic API

```typescript
import { getContext, setContext, syncAll } from "@maiife-ai-pub/context-sync";

// Read a context entry
const overview = await getContext("project-overview");
console.log(overview.value);
console.log(overview.lastUpdated);

// Write a context entry
await setContext("coding-style", "Use functional components, prefer const, no default exports.");

// Push all context to configured tools
const result = await syncAll();
console.log(result.synced);   // tools successfully synced
console.log(result.failed);   // tools that failed
```

### Types

```typescript
import type { ContextEntry, SyncResult, ToolIntegration } from "@maiife-ai-pub/context-sync";
```

## Requirements

- Node.js >= 18

## License

Apache 2.0 — see [LICENSE](./LICENSE)

Copyright 2026 Maiife — [maiife.ai](https://maiife.ai)
