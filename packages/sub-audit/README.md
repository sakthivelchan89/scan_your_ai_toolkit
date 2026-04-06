# @maiife-ai-pub/sub-audit

Personal AI Subscription Auditor — find waste in your AI spending.

Analyzes your AI subscriptions, API usage, and token costs via `@maiife-ai-pub/cost` to surface duplicate tools, unused seats, and overpaying for capacity you don't use.

Part of the [Maiife OSS Toolkit](https://maiife.ai) for enterprise AI governance.

## Install

```bash
npm install @maiife-ai-pub/sub-audit
```

## CLI Usage

### Audit all AI subscriptions

```bash
npx @maiife-ai-pub/sub-audit audit
```

Example output:

```
AI Subscription Audit

  ChatGPT Plus     $20/mo    Usage: 12%   WASTE — consider free tier
  Claude Pro       $20/mo    Usage: 78%   OK
  GitHub Copilot   $10/mo    Usage: 91%   OK
  Cursor Pro       $20/mo    Usage: 34%   WARN — low usage
  OpenAI API       $47/mo    Usage: 100%  OPTIMIZE — consider batch API

Monthly total: $117/mo
Estimated savings: $34/mo (29%)
```

### Check a single provider

```bash
npx @maiife-ai-pub/sub-audit check --provider openai
```

## MCP Server Usage

Add `@maiife-ai-pub/sub-audit` as an MCP server in your Claude Desktop or Cursor config:

```json
{
  "mcpServers": {
    "sub-audit": {
      "command": "npx",
      "args": ["@maiife-ai-pub/sub-audit", "mcp"],
      "env": {}
    }
  }
}
```

Once configured, Claude/Cursor can call tools like `audit_subscriptions`, `check_provider`, and `estimate_savings` directly from the chat interface.

### Docker

```bash
docker run -i ghcr.io/sakthivelchan89/maiife-sub-audit
```

## Programmatic API

```typescript
import { auditSubscriptions, estimateSavings, SubscriptionStatus } from "@maiife-ai-pub/sub-audit";

// Load subscriptions from config or env
const results = await auditSubscriptions({
  configPath: "./ai-subscriptions.json",
});

for (const sub of results) {
  if (sub.status === SubscriptionStatus.WASTE) {
    console.warn(`${sub.name}: $${sub.monthlyCost}/mo — ${sub.recommendation}`);
  }
}

// Calculate potential savings
const savings = await estimateSavings(results);
console.log(`Potential monthly savings: $${savings.total}`);
```

## License

Apache 2.0 — see [LICENSE](./LICENSE)

Built by [Maiife](https://maiife.ai) — Enterprise AI Control Plane.
