# 🛡️ Maiife Toolkit

Open-source AI governance tools. Each works standalone as an MCP server or CLI — together they form a governance mesh.

[![scan_your_ai_toolkit MCP server](https://glama.ai/mcp/servers/sakthivelchan89/scan_your_ai_toolkit/badges/card.svg)](https://glama.ai/mcp/servers/sakthivelchan89/scan_your_ai_toolkit)

[![scan_your_ai_toolkit MCP server](https://glama.ai/mcp/servers/sakthivelchan89/scan_your_ai_toolkit/badges/score.svg)](https://glama.ai/mcp/servers/sakthivelchan89/scan_your_ai_toolkit)
[![npm scope](https://img.shields.io/badge/npm-%40maiife--ai--pub-teal)](https://www.npmjs.com/org/maiife-ai-pub)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](https://github.com/sakthivelchan89/scan_your_ai_toolkit/pulls)

Built by [Maiife](https://maiife.ai) — Enterprise AI Control Plane.

## Tools

| Package | Description | Published |
|---------|-------------|-----------|
| `@maiife-ai-pub/shared` | Shared types and formatters used by all toolkit packages | ✅ |
| `@maiife-ai-pub/probe` | AI environment scanner — discover IDE extensions, MCP servers, agent frameworks, API keys, local models | ✅ |
| `@maiife-ai-pub/mcp-audit` | MCP server security scanner — score configs on permissions, data sensitivity, blast radius | ✅ |
| `@maiife-ai-pub/ai-stack` | "What's Your AI Stack?" — shareable profile card of your AI toolkit | 🚧 |
| `@maiife-ai-pub/mcp-doctor` | MCP health check & auto-fixer — brew doctor for your MCP setup | 🚧 |
| `@maiife-ai-pub/ai-journal` | Personal AI usage diary — track how you use AI, get reflective insights | 🚧 |
| `@maiife-ai-pub/context-sync` | Cross-tool AI memory sync — one context.json, synced to Cursor, Claude, MCP | 🚧 |
| `@maiife-ai-pub/prompt-score` | Prompt quality analyzer — score, improve, and lint your AI prompts | 🚧 |
| `@maiife-ai-pub/eval` | LLM-as-judge evaluation engine — score agent outputs with structured rubrics | 🚧 |
| `@maiife-ai-pub/trace` | Agent workflow tracer — trace, view, and analyze execution spans | 🚧 |
| `@maiife-ai-pub/cost` | AI spend calculator + optimizer — unified cost report across vendors | 🚧 |
| `@maiife-ai-pub/prompt-craft` | Gamified prompt coach — levels, streaks, badges for prompt improvement | 🚧 |
| `@maiife-ai-pub/sub-audit` | Personal AI subscription auditor — find waste in your AI spending | 🚧 |
| `@maiife-ai-pub/model-match` | Personal model recommender — find the best model for YOUR tasks | 🚧 |
| `@maiife-ai-pub/weekly-ai-report` | AI week in review — Spotify Wrapped for your AI usage, weekly | 🚧 |

## Quick Start

```bash
# Scan your AI environment
npx @maiife-ai-pub/probe scan

# Audit your MCP server security
npx @maiife-ai-pub/mcp-audit scan

# Generate your AI Stack profile card
npx @maiife-ai-pub/ai-stack --format svg --output my-stack.svg

# Health check your MCP servers
npx @maiife-ai-pub/mcp-doctor check

# Log an AI interaction
npx @maiife-ai-pub/ai-journal log --tool claude --task coding --duration 30

# Sync AI context across tools
npx @maiife-ai-pub/context-sync push

# Score your AI prompts
npx @maiife-ai-pub/prompt-score analyze --input prompt.txt

# Evaluate agent outputs with rubrics
npx @maiife-ai-pub/eval score --rubric code-review --input review.txt

# Trace agent workflows
npx @maiife-ai-pub/trace list --days 7

# Track AI spend across vendors
npx @maiife-ai-pub/cost report --period last-30d

# Gamified prompt coaching
npx @maiife-ai-pub/prompt-craft score --input prompt.txt

# Audit AI subscriptions for waste
npx @maiife-ai-pub/sub-audit

# Find the best model for your tasks
npx @maiife-ai-pub/model-match recommend --task coding

# Generate your AI week in review
npx @maiife-ai-pub/weekly-ai-report generate
```

## Use as MCP Server

Every tool with an MCP server can be added to Claude Desktop, Cursor, or any MCP-compatible client. Each exposes tools over stdio transport.

`~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "maiife-probe": {
      "command": "npx",
      "args": ["@maiife-ai-pub/probe", "mcp"]
    },
    "maiife-mcp-audit": {
      "command": "npx",
      "args": ["@maiife-ai-pub/mcp-audit", "mcp"]
    },
    "maiife-mcp-doctor": {
      "command": "npx",
      "args": ["@maiife-ai-pub/mcp-doctor", "mcp"]
    },
    "maiife-eval": {
      "command": "npx",
      "args": ["@maiife-ai-pub/eval", "mcp"]
    },
    "maiife-prompt-score": {
      "command": "npx",
      "args": ["@maiife-ai-pub/prompt-score", "mcp"]
    },
    "maiife-prompt-craft": {
      "command": "npx",
      "args": ["@maiife-ai-pub/prompt-craft", "mcp"]
    },
    "maiife-cost": {
      "command": "npx",
      "args": ["@maiife-ai-pub/cost", "mcp"]
    },
    "maiife-model-match": {
      "command": "npx",
      "args": ["@maiife-ai-pub/model-match", "mcp"]
    },
    "maiife-ai-stack": {
      "command": "npx",
      "args": ["@maiife-ai-pub/ai-stack", "mcp"]
    },
    "maiife-context-sync": {
      "command": "npx",
      "args": ["@maiife-ai-pub/context-sync", "mcp"]
    },
    "maiife-sub-audit": {
      "command": "npx",
      "args": ["@maiife-ai-pub/sub-audit", "mcp"]
    },
    "maiife-trace": {
      "command": "npx",
      "args": ["@maiife-ai-pub/trace", "mcp"]
    }
  }
}
```

Pick the tools you need — you don't have to add all of them. Once configured, Claude can call tools like `probe_scan`, `mcp_audit_scan`, `eval_score`, `prompt_score_analyze`, `cost_report`, and more directly from chat.

## Run with Docker

Each MCP server is published as a Docker image on GHCR. Useful for sandboxed environments or Glama integration.

```bash
# Pull and run any server
docker run -i ghcr.io/sakthivelchan89/maiife-probe
docker run -i ghcr.io/sakthivelchan89/maiife-mcp-audit
docker run -i ghcr.io/sakthivelchan89/maiife-eval
# ... same pattern for all 12 packages

# Or build from source
docker build -f packages/probe/Dockerfile -t maiife-probe .
docker run -i maiife-probe
```

Docker images use stdio transport (no ports exposed). Pass `-i` for interactive stdin/stdout communication with MCP clients.

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repo on GitHub
2. **Create a branch**: `git checkout -b feat/my-improvement`
3. **Make your changes** — each package lives in `packages/<name>/`
4. **Run tests**: `pnpm test`
5. **Open a PR** against `main` — describe what you changed and why

Please follow the existing code style (TypeScript, ESM, Vitest for tests). Each package should work as both a CLI and an MCP server where applicable.

## License

[Apache 2.0](./LICENSE) — free to use, modify, and distribute.

---

Part of the [Maiife](https://maiife.ai) platform — Enterprise AI Control Plane.
