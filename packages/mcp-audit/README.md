# @maiife-ai-pub/mcp-audit

MCP server security scanner — score configs on permissions, data sensitivity, blast radius.

Part of the [Maiife OSS Toolkit](https://maiife.ai) for enterprise AI governance.

## Install

```bash
npm install @maiife-ai-pub/mcp-audit
```

## CLI Usage

### Scan all configured MCP servers

```bash
npx @maiife-ai-pub/mcp-audit scan
```

Example output:

```
Scanning MCP servers...

  filesystem      Grade: B  Score: 72  [permissions: medium, data: low, blast: medium]
  github          Grade: C  Score: 58  [permissions: high, data: medium, blast: high]
  database-proxy  Grade: D  Score: 41  [permissions: high, data: high, blast: critical]

3 servers scanned. 1 critical risk found.
```

### Score a specific server

```bash
npx @maiife-ai-pub/mcp-audit score --server github
```

Example output:

```
Security Score: github
  Permissions score:  45 / 100  (read + write + delete tools detected)
  Data sensitivity:   60 / 100  (accesses repository content)
  Blast radius:       55 / 100  (cross-repo tool calls possible)

  Overall grade: C  (Score: 53)
  Recommendation: Restrict tool list to read-only operations for untrusted agents.
```

## MCP Server Usage

Add `@maiife-ai-pub/mcp-audit` as an MCP server in your Claude Desktop or Cursor config:

```json
{
  "mcpServers": {
    "mcp-audit": {
      "command": "npx",
      "args": ["@maiife-ai-pub/mcp-audit", "mcp"],
      "env": {}
    }
  }
}
```

Once configured, Claude/Cursor can call tools like `scan_servers`, `score_server`, and `list_risks` directly from the chat interface.

### Docker

```bash
docker run -i ghcr.io/sakthivelchan89/maiife-mcp-audit
```

## Programmatic API

```typescript
import { scanServers, scoreServer, SecurityGrade } from "@maiife-ai-pub/mcp-audit";

// Scan all servers from a config file
const results = await scanServers({ configPath: "./mcp.json" });

for (const result of results) {
  console.log(`${result.name}: ${result.grade} (${result.score})`);
}

// Score a single server definition
const score = await scoreServer({
  name: "my-server",
  command: "node",
  args: ["./server.js"],
  tools: ["read_file", "write_file", "execute_command"],
});

if (score.grade === SecurityGrade.D || score.grade === SecurityGrade.F) {
  console.warn("High-risk server detected:", score.recommendations);
}
```

## CI Integration

Fail the build if any server scores below a threshold:

```bash
npx @maiife-ai-pub/mcp-audit scan --ci --min-grade B
```

Exit code is `0` if all servers meet the threshold, `1` otherwise. Use in GitHub Actions:

```yaml
- name: Audit MCP servers
  run: npx @maiife-ai-pub/mcp-audit scan --ci --min-grade B
```

## License

Apache 2.0 — see [LICENSE](./LICENSE)

Built by [Maiife](https://maiife.ai) — Enterprise AI Control Plane.
