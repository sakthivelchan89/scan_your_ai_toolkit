# @maiife-ai-pub/ai-toolkit

> All 15 Maiife AI Governance Toolkit packages in one install.

[![npm](https://img.shields.io/npm/v/@maiife-ai-pub/ai-toolkit)](https://www.npmjs.com/package/@maiife-ai-pub/ai-toolkit)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](../../LICENSE)

## Install

```bash
npm install @maiife-ai-pub/ai-toolkit
```

## What's Included

| Package | Description | MCP |
|---------|-------------|-----|
| probe | AI environment scanner | ✓ |
| ai-stack | AI stack profile card | ✓ |
| ai-journal | AI interaction journal | |
| context-sync | Context sync to AI tools | ✓ |
| cost | AI spend calculator | ✓ |
| eval | Output quality scorer | ✓ |
| mcp-audit | MCP server security audit | ✓ |
| mcp-doctor | MCP server health check | ✓ |
| model-match | Model recommender | ✓ |
| prompt-craft | Gamified prompt coach | ✓ |
| prompt-score | Prompt quality analyzer | ✓ |
| shared | Shared types & formatters | |
| sub-audit | Subscription auditor | ✓ |
| trace | Agent workflow tracer | ✓ |
| weekly-ai-report | Weekly AI report | |

## CLI

```bash
# List all packages
npx @maiife-ai-pub/ai-toolkit list

# Print setup commands for Claude Code MCP
npx @maiife-ai-pub/ai-toolkit setup
```

## Add MCP Servers to Claude Code

```bash
# One-liner per server
claude mcp add probe -s user -- npx @maiife-ai-pub/probe mcp
claude mcp add prompt-score -s user -- npx @maiife-ai-pub/prompt-score mcp
# ... etc (run `npx @maiife-ai-pub/ai-toolkit setup` for all 12)
```

## License

[Apache 2.0](../../LICENSE) — Built by [Maiife](https://maiife.ai)
