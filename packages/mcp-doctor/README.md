# @maiife-ai-pub/mcp-doctor

MCP Server Health Check & Auto-Fixer — brew doctor for your MCP setup.

Diagnoses misconfigured, broken, or risky MCP servers and suggests fixes. Built on top of `@maiife-ai-pub/mcp-audit` for security scoring.

Part of the [Maiife OSS Toolkit](https://maiife.ai) for enterprise AI governance.

## Install

```bash
npm install @maiife-ai-pub/mcp-doctor
```

## CLI Usage

### Run a full health check

```bash
npx @maiife-ai-pub/mcp-doctor check
```

Example output:

```
Checking MCP servers...

  filesystem      OK       All checks passed
  github          WARN     Tool list not restricted — consider limiting to read-only
  database-proxy  ERROR    Server unreachable at tcp://localhost:5432

2 warnings, 1 error. Run with --fix to auto-repair where possible.
```

### Auto-fix known issues

```bash
npx @maiife-ai-pub/mcp-doctor check --fix
```

## MCP Server Usage

Add `@maiife-ai-pub/mcp-doctor` as an MCP server in your Claude Desktop or Cursor config:

```json
{
  "mcpServers": {
    "mcp-doctor": {
      "command": "npx",
      "args": ["@maiife-ai-pub/mcp-doctor", "mcp"],
      "env": {}
    }
  }
}
```

Once configured, Claude/Cursor can call tools like `check_servers`, `diagnose_server`, and `apply_fix` directly from the chat interface.

### Docker

```bash
docker run -i ghcr.io/sakthivelchan89/maiife-mcp-doctor
```

## Programmatic API

```typescript
import { checkServers, diagnoseServer, DiagnosticSeverity } from "@maiife-ai-pub/mcp-doctor";

// Check all servers
const results = await checkServers({ configPath: "./mcp.json" });

for (const result of results) {
  if (result.severity === DiagnosticSeverity.ERROR) {
    console.error(`${result.name}: ${result.message}`);
  }
}

// Diagnose a single server and get fix suggestions
const diagnosis = await diagnoseServer({
  name: "github",
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-github"],
});

console.log(diagnosis.suggestions);
```

## License

Apache 2.0 — see [LICENSE](./LICENSE)

Built by [Maiife](https://maiife.ai) — Enterprise AI Control Plane.
