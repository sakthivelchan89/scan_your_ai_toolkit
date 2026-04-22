# @maiife-ai-pub/mcp-doctor

> MCP server health check & auto-fixer — brew doctor for your MCP setup. Detects dead, stale, and misconfigured servers.

[![npm](https://img.shields.io/npm/v/@maiife-ai-pub/mcp-doctor)](https://www.npmjs.com/package/@maiife-ai-pub/mcp-doctor)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](../../LICENSE)

Part of the [Maiife AI Governance Toolkit](https://github.com/sakthivelchan89/scan_your_ai_toolkit).

---

## Install

```bash
npm install -g @maiife-ai-pub/mcp-doctor
# or run without installing
npx @maiife-ai-pub/mcp-doctor check
```

---

## CLI

```bash
# Health check all MCP servers
maiife-mcp-doctor check

# Auto-fix detected issues
maiife-mcp-doctor fix

# Watch status continuously (30s interval)
maiife-mcp-doctor status
```

---

## MCP Server

```json
{
  "mcpServers": {
    "maiife-mcp-doctor": {
      "command": "npx",
      "args": ["@maiife-ai-pub/mcp-doctor", "mcp"]
    }
  }
}
```

**Available tools:** `mcp_doctor_checkup`, `mcp_doctor_fix`, `mcp_doctor_status`

---

## Programmatic API

```ts
import { runCheckup, watchServers } from "@maiife-ai-pub/mcp-doctor";
import { parseAllMCPConfigs } from "@maiife-ai-pub/mcp-audit";

// One-shot health check
const report = await runCheckup();
console.log(`${report.summary.healthy}/${report.summary.total} servers healthy`);

// Continuous watch — calls onReport every 60 seconds
const servers = parseAllMCPConfigs();
const stop = watchServers(servers, {
  intervalMs: 60_000,
  onReport: (r) => console.log(`${r.summary.healthy}/${r.summary.total} healthy`),
  onStatusChange: (name, prev, curr) => console.warn(`${name}: ${prev} → ${curr}`),
});

// Stop watching
stop();
```

---

## Health Statuses

| Status | Meaning |
|--------|---------|
| `healthy` | Server responds correctly |
| `degraded` | Responds but with errors or high latency |
| `stale` | Config exists but server has not been seen recently |
| `dead` | Unreachable or failing startup |

---

## License

[Apache 2.0](../../LICENSE) — Built by [Maiife](https://maiife.ai)
