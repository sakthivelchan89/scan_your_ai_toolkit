# @maiife-ai-pub/mcp-audit

> MCP server security scanner — score your MCP configurations on permissions, data sensitivity, and blast radius.

[![npm](https://img.shields.io/npm/v/@maiife-ai-pub/mcp-audit)](https://www.npmjs.com/package/@maiife-ai-pub/mcp-audit)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](../../LICENSE)

Part of the [Maiife AI Governance Toolkit](https://github.com/sakthivelchan89/scan_your_ai_toolkit).

---

## Install

```bash
npm install -g @maiife-ai-pub/mcp-audit
# or run without installing
npx @maiife-ai-pub/mcp-audit scan
```

---

## CLI

```bash
# Scan all MCP configs found on this machine
maiife-mcp-audit scan

# Score a specific server by name
maiife-mcp-audit score --server filesystem
```

---

## MCP Server

```json
{
  "mcpServers": {
    "maiife-mcp-audit": {
      "command": "npx",
      "args": ["@maiife-ai-pub/mcp-audit", "serve"]
    }
  }
}
```

**Available tools:** `mcp_audit_scan`, `mcp_audit_score`

---

## Programmatic API

```ts
import { parseAllMCPConfigs, scoreServer } from "@maiife-ai-pub/mcp-audit";

const servers = parseAllMCPConfigs();
for (const server of servers) {
  const card = scoreServer(server);
  console.log(`${card.serverName}: ${card.overall}/100 (${card.grade})`);
}
```

---

## Scoring

Each server is scored across four dimensions:

| Dimension | Description |
|-----------|-------------|
| **Permissions** | File system access, shell execution, network calls |
| **Data sensitivity** | Access to credentials, secrets, personal data |
| **Blast radius** | Scope of potential damage if compromised |
| **Supply chain** | Source verification, known vulnerabilities |

Score `≥80` = safe · `60–79` = review recommended · `<60` = high risk

---

## License

[Apache 2.0](../../LICENSE) — Built by [Maiife](https://maiife.ai)
