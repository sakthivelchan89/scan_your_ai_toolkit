# @maiife-ai-pub/probe

AI environment scanner — discover IDE extensions, MCP servers, agent frameworks, API keys, local models, and dependencies across your development environment.

Part of the [Maiife](https://maiife.ai) OSS toolkit for AI governance.

## Install

```bash
npm install @maiife-ai-pub/probe
```

Or use directly without installing:

```bash
npx @maiife-ai-pub/probe scan
```

## CLI Usage

### Scan your environment

```bash
npx @maiife-ai-pub/probe scan
```

Example output:

```
Maiife Probe — AI Environment Scanner v0.1.0

Scanning environment...

IDE Extensions
  VS Code
    GitHub Copilot          1.234.0   active
    Continue                0.9.12    active
    Cursor                  0.42.0    active

MCP Servers
  Claude Desktop
    filesystem              local     configured
    github                  remote    configured

Agent Frameworks
  Detected: LangChain (node_modules), AutoGen (pip)

API Keys
  OPENAI_API_KEY            set       (sk-...redacted)
  ANTHROPIC_API_KEY         set       (sk-ant-...redacted)
  AZURE_OPENAI_API_KEY      not set

Local Models
  Ollama
    llama3.2:latest         4.1 GB    running
    mistral:7b              4.1 GB    available

Dependencies
  openai                    4.28.0
  @anthropic-ai/sdk         0.24.3
  langchain                 0.1.36

Score: 87/100  (2 issues found)
```

### Watch mode

```bash
npx @maiife-ai-pub/probe scan --watch
```

### Output formats

```bash
npx @maiife-ai-pub/probe scan --format json
npx @maiife-ai-pub/probe scan --format table
npx @maiife-ai-pub/probe scan --format html > report.html
```

## MCP Server Usage

Add `@maiife-ai-pub/probe` as an MCP server to Claude Desktop or Cursor so AI assistants can query your AI environment directly.

### Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "maiife-probe": {
      "command": "npx",
      "args": ["@maiife-ai-pub/probe", "mcp"]
    }
  }
}
```

### Cursor (`.cursor/mcp.json` in your project or `~/.cursor/mcp.json` globally)

```json
{
  "mcpServers": {
    "maiife-probe": {
      "command": "npx",
      "args": ["@maiife-ai-pub/probe", "mcp"]
    }
  }
}
```

Once configured, your AI assistant can call tools like `probe_scan`, `probe_list_models`, and `probe_check_keys`.

### Docker

```bash
docker run -i ghcr.io/sakthivelchan89/maiife-probe
```

## Programmatic API

```typescript
import { scan } from "@maiife-ai-pub/probe";

const result = await scan();

console.log(result.extensions);   // IDE extensions found
console.log(result.mcpServers);   // MCP server configurations
console.log(result.apiKeys);      // API key presence (values redacted)
console.log(result.models);       // Local models via Ollama / LM Studio
console.log(result.score);        // Governance score 0-100
```

### Types

```typescript
import type { ScanResult, Extension, McpServer, ApiKeyStatus, LocalModel } from "@maiife-ai-pub/probe";
```

## Requirements

- Node.js >= 18

## License

Apache 2.0 — see [LICENSE](./LICENSE)

Copyright 2026 Maiife — [maiife.ai](https://maiife.ai)
