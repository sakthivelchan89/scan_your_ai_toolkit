/**
 * MCP conformance test for @maiife-ai-pub/prompt-score
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
  packageName: "@maiife-ai-pub/prompt-score",
  binPath: "./dist/cli/index.js",
  expectedTools: ["prompt_score_analyze", "prompt_score_improve", "prompt_score_track"],
});
