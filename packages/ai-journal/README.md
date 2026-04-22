# @maiife-ai-pub/ai-journal

> Personal AI usage diary — track how you use AI tools across sessions and get reflective weekly insights.

[![npm](https://img.shields.io/npm/v/@maiife-ai-pub/ai-journal)](https://www.npmjs.com/package/@maiife-ai-pub/ai-journal)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](../../LICENSE)

Part of the [Maiife AI Governance Toolkit](https://github.com/sakthivelchan89/scan_your_ai_toolkit).

---

## Install

```bash
npm install -g @maiife-ai-pub/ai-journal
# or run without installing
npx @maiife-ai-pub/ai-journal log --tool claude --task coding
```

---

## CLI

```bash
# Log an AI interaction
maiife-ai-journal log --tool claude --task coding --duration 30

# Start a timed session
maiife-ai-journal start --tool cursor

# Stop the current session
maiife-ai-journal stop

# Get your weekly digest
maiife-ai-journal digest

# View patterns and insights
maiife-ai-journal insights
```

---

## Programmatic API

```ts
import { logInteraction, generateDigest } from "@maiife-ai-pub/ai-journal";

// Log an interaction
logInteraction({ tool: "claude", task: "code-review", durationMinutes: 20 });

// Generate a digest for the last 7 days
const digest = generateDigest(7);
console.log(`Top tool: ${digest.topTool} (${digest.topToolMinutes} min)`);
```

Entries are stored locally at `~/.maiife/journal.json`.

---

## Export

```ts
import { exportEntries } from "@maiife-ai-pub/ai-journal";

// Export last 30 days as CSV
const csv = exportEntries("csv", new Date(Date.now() - 30 * 86400_000));
```

---

## License

[Apache 2.0](../../LICENSE) — Built by [Maiife](https://maiife.ai)
