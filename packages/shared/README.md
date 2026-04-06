# @maiife-ai-pub/shared

Shared types and formatters for the Maiife AI governance toolkit.

## Install

```bash
npm install @maiife-ai-pub/shared
```

## API

### Types

```ts
import type { RiskLevel, Finding, ToolSummary, MaiifeTelemetry } from "@maiife-ai-pub/shared";
```

| Type | Description |
|------|-------------|
| `RiskLevel` | Severity level for a finding (`"critical"`, `"high"`, `"medium"`, `"low"`, `"info"`) |
| `Finding` | A single scanner finding with `id`, `riskLevel`, `title`, `description`, and optional `remediation` |
| `ToolSummary` | Aggregated summary for a scanned tool: `toolId`, `toolName`, `findings[]`, `score` |
| `MaiifeTelemetry` | Top-level telemetry envelope: `scanId`, `timestamp`, `tools[]`, `overallScore` |

### Formatters

```ts
import { formatJSON, formatTable, formatHTML } from "@maiife-ai-pub/shared";
```

| Function | Signature | Description |
|----------|-----------|-------------|
| `formatJSON` | `(data: MaiifeTelemetry) => string` | Pretty-prints telemetry as JSON |
| `formatTable` | `(data: MaiifeTelemetry) => string` | Renders findings as a plain-text table |
| `formatHTML` | `(data: MaiifeTelemetry) => string` | Renders findings as an HTML report |

## License

Apache 2.0 — see [LICENSE](./LICENSE).
