/**
 * MCP conformance test for @maiife-ai-pub/context-sync
 *
 * Validates protocol compliance per https://spec.modelcontextprotocol.io/
 * - stdio transport behavior
 * - initialize handshake
 * - tools/list returns expected tools
 * - all tool inputSchemas are valid JSON Schema
 * - unknown tool calls return structured errors
 * - no non-JSON output on stdout (stdio invariant)
 *
 * Run with: pnpm test:conformance
 */
import { runConformanceSuite } from "@maiife-ai-pub/shared/testing/conformance";

runConformanceSuite({
  packageName: "@maiife-ai-pub/context-sync",
  binPath: "./dist/cli/index.js",
  expectedTools: ["context_sync_read", "context_sync_update", "context_sync_push", "context_sync_status"],
});
