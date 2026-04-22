# @maiife-ai-pub/shared

> Shared types, formatters, and utilities used by all packages in the Maiife AI Governance Toolkit.

[![npm](https://img.shields.io/npm/v/@maiife-ai-pub/shared)](https://www.npmjs.com/package/@maiife-ai-pub/shared)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](../../LICENSE)

Part of the [Maiife AI Governance Toolkit](https://github.com/sakthivelchan89/scan_your_ai_toolkit).

---

## Install

```bash
npm install @maiife-ai-pub/shared
```

---

## Usage

```ts
import type { RiskLevel, Finding, ToolHealth } from "@maiife-ai-pub/shared";
import { formatTable, formatJSON, formatHTML } from "@maiife-ai-pub/shared";

// Format a list of findings as a terminal table
const output = formatTable(findings);

// Format as JSON
const json = formatJSON(findings);

// Format as HTML report
const html = formatHTML(findings);
```

---

## Exported Types

| Type | Description |
|------|-------------|
| `RiskLevel` | `"low" \| "medium" \| "high" \| "critical"` |
| `Finding` | Security/audit finding with severity and description |
| `ToolHealth` | Health status for an AI tool |
| `ToolHeartbeat` | Telemetry heartbeat from a running tool |

---

## Note

This package is a peer dependency of all other `@maiife-ai-pub/*` packages. You rarely need to install it directly unless building your own toolkit integrations.

---

## License

[Apache 2.0](../../LICENSE) — Built by [Maiife](https://maiife.ai)
