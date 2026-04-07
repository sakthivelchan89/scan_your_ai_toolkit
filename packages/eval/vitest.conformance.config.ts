import { defineConfig } from 'vitest/config';

/**
 * Conformance test config — runs only *.conformance.test.ts files.
 * These validate MCP protocol compliance and stdio transport behavior.
 *
 * Hook timeout is increased because spawning a Node subprocess and
 * completing the MCP initialize handshake can take several seconds
 * on slower machines / cold caches.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.conformance.test.ts'],
    testTimeout: 30000,
    hookTimeout: 60000,
  },
});
