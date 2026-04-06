# @maiife-ai-pub/ai-journal

Personal AI Usage Diary — track how you use AI tools, record outcomes, and get weekly reflective insights.

Part of the [Maiife](https://maiife.ai) OSS toolkit for AI governance.

## Install

```bash
npm install @maiife-ai-pub/ai-journal
```

Or use directly without installing:

```bash
npx @maiife-ai-pub/ai-journal log "Used Claude to draft a product spec. Saved ~2h."
```

## CLI Usage

### Log an AI interaction

```bash
npx @maiife-ai-pub/ai-journal log "Used GPT-4o to refactor the auth module. Result was good."
```

### View your journal

```bash
npx @maiife-ai-pub/ai-journal view
```

Example output:

```
Maiife AI Journal v0.1.0

Your AI Usage — Last 7 Days

  Mon Apr 01   3 interactions   ~4.5h saved
    - Used Claude to write onboarding copy
    - Used GPT-4o to review PR diff
    - Used Gemini for competitive research

  Tue Apr 02   1 interaction    ~1h saved
    - Used Claude to debug Prisma migration

  Wed Apr 03   5 interactions   ~6h saved
    - Drafted pitch deck talking points
    - Summarized 3 customer interviews
    - ...

  Weekly Summary
    Total interactions:  9
    Estimated time saved: 11.5h
    Most used tool: Claude (6/9)
    Top use case: Writing & drafting
```

### Weekly reflection

```bash
npx @maiife-ai-pub/ai-journal reflect
```

### Search past entries

```bash
npx @maiife-ai-pub/ai-journal search "refactor"
```

### Output formats

```bash
npx @maiife-ai-pub/ai-journal view --format json
npx @maiife-ai-pub/ai-journal view --format html > journal.html
```

## Programmatic API

```typescript
import { addEntry, getEntries, weeklyReflection } from "@maiife-ai-pub/ai-journal";

// Add a journal entry
await addEntry({
  tool: "claude",
  task: "Drafted product spec",
  outcome: "saved ~2h, high quality",
  timeSavedHours: 2,
});

// Retrieve entries
const entries = await getEntries({ since: "2026-04-01" });
console.log(entries.length);

// Weekly reflection
const reflection = await weeklyReflection();
console.log(reflection.totalInteractions);
console.log(reflection.estimatedTimeSaved);
console.log(reflection.topTool);
```

### Types

```typescript
import type { JournalEntry, WeeklyReflection } from "@maiife-ai-pub/ai-journal";
```

## Requirements

- Node.js >= 18

## License

Apache 2.0 — see [LICENSE](./LICENSE)

Copyright 2026 Maiife — [maiife.ai](https://maiife.ai)
