# @maiife-ai-pub/sub-audit

> Personal AI subscription auditor — find waste and overlaps in your AI spending before your next renewal.

[![npm](https://img.shields.io/npm/v/@maiife-ai-pub/sub-audit)](https://www.npmjs.com/package/@maiife-ai-pub/sub-audit)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](../../LICENSE)

Part of the [Maiife AI Governance Toolkit](https://github.com/sakthivelchan89/scan_your_ai_toolkit).

---

## Install

```bash
npm install -g @maiife-ai-pub/sub-audit
# or run without installing
npx @maiife-ai-pub/sub-audit
```

---

## CLI

```bash
# Run the subscription audit (table output)
maiife-sub-audit

# JSON output
maiife-sub-audit --format json
```

---

## MCP Server

```json
{
  "mcpServers": {
    "maiife-sub-audit": {
      "command": "npx",
      "args": ["@maiife-ai-pub/sub-audit", "mcp"]
    }
  }
}
```

**Available tools:** `sub_audit_run`

---

## Programmatic API

```ts
import { detectSubscriptions, analyzeSubscriptions } from "@maiife-ai-pub/sub-audit";

// Detect subscriptions from your environment
const subscriptions = await detectSubscriptions();

// Analyze for waste and overlaps
const report = analyzeSubscriptions(subscriptions, { minUsagePer30d: 5 });

console.log(`Monthly cost:      $${report.totalMonthlyCost}`);
console.log(`Detected waste:    $${report.totalWaste}/mo`);
console.log(`Estimated savings: $${report.savingsEstimate}/mo`);
```

---

## What it detects

Scans for active API keys, installed tools, and running services to identify:
- Unused or rarely-used subscriptions
- Overlapping tools with the same capabilities
- Free-tier alternatives for paid tools

---

## License

[Apache 2.0](../../LICENSE) — Built by [Maiife](https://maiife.ai)
