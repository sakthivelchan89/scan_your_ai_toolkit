# @maiife-ai-pub/probe

> AI environment scanner — discover IDE extensions, MCP servers, agent frameworks, API keys, and local models running on your machine.

[![npm](https://img.shields.io/npm/v/@maiife-ai-pub/probe)](https://www.npmjs.com/package/@maiife-ai-pub/probe)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](../../LICENSE)

Part of the [Maiife AI Governance Toolkit](https://github.com/sakthivelchan89/scan_your_ai_toolkit).

---

## Install

```bash
npm install -g @maiife-ai-pub/probe
# or run without installing
npx @maiife-ai-pub/probe scan
```

---

## CLI

```bash
# Full environment scan
maiife-probe scan

# Watch mode — re-scan on changes
maiife-probe watch

# Scan a specific directory
maiife-probe scan --path /path/to/project
```

### Post results to Maiife

If you have a Maiife account, point probe at your gateway to land findings in your governed substrate:

```bash
export MAIIFE_GATEWAY=https://gateway.maiife.ai   # or your org's gateway
export MAIIFE_API_KEY=mk-...                      # create in console → API Keys
maiife-probe scan                                  # scans AND posts
```

Flags:

- `--post-to <url>`  override `MAIIFE_GATEWAY`
- `--key <mk-...>`  override `MAIIFE_API_KEY`
- `--no-post`         run scan locally even if env is set
- `--post-only`       silent POST; exit 1 on failure (for CI)

Posting is fully optional. With no env + no flags, probe behaves exactly as a standalone CLI.

---

## MCP Server

Add to your Claude Desktop config (`%APPDATA%\Claude\claude_desktop_config.json` on Windows, `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "maiife-probe": {
      "command": "npx",
      "args": ["@maiife-ai-pub/probe", "mcp"]
    }
  }
}
```

**Available tools:** `probe_scan`

---

## Programmatic API

```ts
import { scanEnvironment } from "@maiife-ai-pub/probe";

const result = await scanEnvironment({ scope: "full", path: process.cwd() });
console.log(result.ide);     // IDE extensions
console.log(result.mcp);     // MCP servers
console.log(result.agents);  // Agent frameworks
console.log(result.keys);    // API keys found
console.log(result.models);  // Local models (Ollama, vLLM)
```

---

## License

[Apache 2.0](../../LICENSE) — Built by [Maiife](https://maiife.ai)
