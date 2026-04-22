# @maiife-ai-pub/weekly-ai-report

> Your AI week in review — Spotify Wrapped for your AI usage, delivered weekly.

[![npm](https://img.shields.io/npm/v/@maiife-ai-pub/weekly-ai-report)](https://www.npmjs.com/package/@maiife-ai-pub/weekly-ai-report)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](../../LICENSE)

Part of the [Maiife AI Governance Toolkit](https://github.com/sakthivelchan89/scan_your_ai_toolkit).

---

## Install

```bash
npm install -g @maiife-ai-pub/weekly-ai-report
# or run without installing
npx @maiife-ai-pub/weekly-ai-report generate
```

---

## CLI

```bash
# Generate this week's report
maiife-weekly-ai-report generate

# Generate for a specific period
maiife-weekly-ai-report generate --period 2026-W14

# Output as JSON
maiife-weekly-ai-report generate --format json
```

---

## Programmatic API

```ts
import { collectWeeklyData, generateWeeklyReport } from "@maiife-ai-pub/weekly-ai-report";
import { collectFromJSON, collectFromCSV } from "@maiife-ai-pub/weekly-ai-report";

// Collect from ai-journal export
const report = collectFromJSON("~/.maiife/journal.json", "2026-W14");

// Or from a CSV export
const report2 = collectFromCSV("./usage-export.csv");

console.log(`Top tool:  ${report.topTool}`);
console.log(`Top task:  ${report.topTask}`);
console.log(`Total time: ${report.totalMinutes} min`);
```

---

## What's in a report

- Top AI tool of the week
- Most common task type
- Total time spent with AI
- Longest single session
- Weekly trend vs prior week
- Personalized insight

---

## License

[Apache 2.0](../../LICENSE) — Built by [Maiife](https://maiife.ai)
