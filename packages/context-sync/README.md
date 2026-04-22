# @maiife-ai-pub/context-sync

> Cross-tool AI memory sync — one source of truth for your AI context, synced to Cursor Rules, CLAUDE.md, and MCP memory servers.

[![npm](https://img.shields.io/npm/v/@maiife-ai-pub/context-sync)](https://www.npmjs.com/package/@maiife-ai-pub/context-sync)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](../../LICENSE)

Part of the [Maiife AI Governance Toolkit](https://github.com/sakthivelchan89/scan_your_ai_toolkit).

---

## Install

```bash
npm install -g @maiife-ai-pub/context-sync
# or run without installing
npx @maiife-ai-pub/context-sync init
```

---

## CLI

```bash
# Initialise context store
maiife-context-sync init

# Add a context entry
maiife-context-sync add "stack" "TypeScript, Next.js, Supabase"

# List all entries
maiife-context-sync list

# Push context to all configured targets
maiife-context-sync push

# Check sync status across targets
maiife-context-sync status

# Show what has changed since last push
maiife-context-sync diff

# Remove an entry
maiife-context-sync remove "stack"
```

---

## MCP Server

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

**Available tools:** `context_sync_read`, `context_sync_update`, `context_sync_push`, `context_sync_status`

---

## Sync Targets

| Target | Description |
|--------|-------------|
| `cursor` | Writes to `.cursorrules` in the current project |
| `claude` | Writes to `CLAUDE.md` in the current project |
| `mcp-memory` | Pushes to a local MCP memory server via JSON-RPC |

Set `MCP_MEMORY_URL` to push to a remote MCP memory server.

---

## License

[Apache 2.0](../../LICENSE) — Built by [Maiife](https://maiife.ai)
