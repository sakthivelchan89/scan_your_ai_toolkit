# @maiife-ai-pub/weekly-ai-report

Your AI Week in Review — Spotify Wrapped for your AI usage, weekly.

Generates a rich weekly digest of your AI activity using data from `@maiife-ai-pub/ai-journal`: top models used, token spend, productivity wins, and AI-generated highlights for the week.

Part of the [Maiife OSS Toolkit](https://maiife.ai) for enterprise AI governance.

## Install

```bash
npm install @maiife-ai-pub/weekly-ai-report
```

## CLI Usage

### Generate this week's report

```bash
npx @maiife-ai-pub/weekly-ai-report generate
```

Example output:

```
Your AI Week in Review  (Mar 31 – Apr 6, 2026)

  Total sessions      47
  Total tokens        284,000
  Estimated cost      $3.12
  Top model           claude-3-5-sonnet (62% of sessions)
  Most active day     Tuesday

  Highlights:
    - Shipped 3 features with AI assistance
    - Saved ~4.2 hours on code review
    - Top task: code generation (48%)

  Trend vs last week:  +12% sessions,  -8% cost (more efficient!)
```

### Generate for a specific week

```bash
npx @maiife-ai-pub/weekly-ai-report generate --week 2026-03-24
```

### Export as HTML

```bash
npx @maiife-ai-pub/weekly-ai-report generate --format html --output report.html
```

## Programmatic API

```typescript
import { generateReport, WeeklyReport, ReportFormat } from "@maiife-ai-pub/weekly-ai-report";

// Generate for the current week
const report: WeeklyReport = await generateReport({
  weekStart: new Date("2026-03-31"),
  journalPath: "~/.maiife/journal",
});

console.log(`Sessions: ${report.totalSessions}`);
console.log(`Cost: $${report.estimatedCost.toFixed(2)}`);
console.log(`Top model: ${report.topModel}`);

// Export to HTML
const html = await generateReport({
  weekStart: new Date("2026-03-31"),
  format: ReportFormat.HTML,
});
```

## License

Apache 2.0 — see [LICENSE](./LICENSE)

Built by [Maiife](https://maiife.ai) — Enterprise AI Control Plane.
