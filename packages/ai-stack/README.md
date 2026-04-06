# @maiife-ai-pub/ai-stack

What's Your AI Stack? — Generate a shareable profile card of your AI toolkit.

Detects your installed AI tools, models, MCP servers, and IDE integrations, then renders a shareable card showing your complete AI setup. Powered by `@maiife-ai-pub/probe`.

Part of the [Maiife OSS Toolkit](https://maiife.ai) for enterprise AI governance.

## Install

```bash
npm install @maiife-ai-pub/ai-stack
```

## CLI Usage

### Generate your AI stack profile

```bash
npx @maiife-ai-pub/ai-stack generate
```

Example output:

```
Your AI Stack

  IDE             VS Code + Cursor (Copilot enabled)
  MCP Servers     filesystem, github, database-proxy
  Local Models    llama3.2, mistral-7b (via Ollama)
  Cloud APIs      OpenAI, Anthropic
  Agents          Claude Code, Copilot Chat

Stack score: 92 / 100  (Enterprise-grade setup)
Shareable link: https://maiife.ai/stack/abc123
```

### Export as JSON

```bash
npx @maiife-ai-pub/ai-stack generate --format json
```

## MCP Server Usage

Add `@maiife-ai-pub/ai-stack` as an MCP server in your Claude Desktop or Cursor config:

```json
{
  "mcpServers": {
    "ai-stack": {
      "command": "npx",
      "args": ["@maiife-ai-pub/ai-stack", "mcp"],
      "env": {}
    }
  }
}
```

Once configured, Claude/Cursor can call tools like `get_stack`, `generate_card`, and `compare_stacks` directly from the chat interface.

### Docker

```bash
docker run -i ghcr.io/sakthivelchan89/maiife-ai-stack
```

## Programmatic API

```typescript
import { generateStack, renderCard, StackProfile } from "@maiife-ai-pub/ai-stack";

// Detect everything installed on this machine
const profile: StackProfile = await generateStack();

console.log(`IDE: ${profile.ide}`);
console.log(`MCP Servers: ${profile.mcpServers.join(", ")}`);
console.log(`Local Models: ${profile.localModels.join(", ")}`);

// Render as a shareable HTML card
const card = renderCard(profile, { theme: "dark" });
```

## License

Apache 2.0 — see [LICENSE](./LICENSE)

Built by [Maiife](https://maiife.ai) — Enterprise AI Control Plane.
