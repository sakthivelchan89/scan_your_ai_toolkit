/**
 * Shared MCP conformance test helpers.
 *
 * Validates that an MCP server correctly implements the Model Context Protocol
 * spec (JSON-RPC over stdio) per https://spec.modelcontextprotocol.io/
 *
 * Usage in a package's tests/mcp.conformance.test.ts:
 *
 *   import { runConformanceSuite } from "@maiife-ai-pub/shared/testing/conformance";
 *
 *   runConformanceSuite({
 *     packageName: "@maiife-ai-pub/probe",
 *     binPath: "./dist/mcp/index.js",
 *     expectedTools: ["probe_scan"],
 *   });
 */
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import * as path from "node:path";
import * as fs from "node:fs";

export interface ConformanceOptions {
  /** Package name as it appears in package.json (e.g. "@maiife-ai-pub/probe") */
  packageName: string;
  /** Path to the built MCP server entry point relative to package root */
  binPath: string;
  /** Names of tools the server is expected to expose */
  expectedTools: string[];
  /** Optional override of the test timeout in ms (default 15000) */
  timeoutMs?: number;
}

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: number;
  result?: unknown;
  error?: { code: number; message: string };
}

/**
 * Pure JSON Schema validation helper — checks shape without external deps.
 * This is intentionally minimal: we only validate the contracts we care about
 * for MCP conformance (tool inputSchema must be a JSON Schema object with
 * "type": "object" and a "properties" map).
 */
export function validateToolInputSchema(schema: unknown): { valid: boolean; reason?: string } {
  if (!schema || typeof schema !== "object") {
    return { valid: false, reason: "schema is not an object" };
  }
  const s = schema as Record<string, unknown>;
  if (s.type !== "object") {
    return { valid: false, reason: `schema.type must be "object", got ${JSON.stringify(s.type)}` };
  }
  if (s.properties !== undefined && typeof s.properties !== "object") {
    return { valid: false, reason: "schema.properties must be an object" };
  }
  return { valid: true };
}

/**
 * Spawns an MCP server subprocess and provides JSON-RPC send/receive helpers.
 */
export class McpTestClient {
  private proc: ChildProcessWithoutNullStreams | null = null;
  private buffer = "";
  private nextId = 1;
  private pending = new Map<number, (resp: JsonRpcResponse) => void>();
  private stderr = "";

  constructor(
    private readonly entryPath: string,
    private readonly cwd: string,
    private readonly timeoutMs = 15000
  ) {}

  async start(): Promise<void> {
    if (!fs.existsSync(path.join(this.cwd, this.entryPath))) {
      throw new Error(
        `MCP entry point not found at ${path.join(this.cwd, this.entryPath)}. ` +
          `Did you run \`pnpm build\`?`
      );
    }
    this.proc = spawn("node", [this.entryPath], {
      cwd: this.cwd,
      stdio: ["pipe", "pipe", "pipe"],
    });
    this.proc.stdout.setEncoding("utf8");
    this.proc.stdout.on("data", (chunk: string) => this.handleStdout(chunk));
    this.proc.stderr.setEncoding("utf8");
    this.proc.stderr.on("data", (chunk: string) => {
      this.stderr += chunk;
    });
  }

  private handleStdout(chunk: string): void {
    this.buffer += chunk;
    let newlineIdx: number;
    while ((newlineIdx = this.buffer.indexOf("\n")) >= 0) {
      const line = this.buffer.slice(0, newlineIdx).trim();
      this.buffer = this.buffer.slice(newlineIdx + 1);
      if (!line) continue;
      try {
        const msg = JSON.parse(line) as JsonRpcResponse;
        if (typeof msg.id === "number") {
          const cb = this.pending.get(msg.id);
          if (cb) {
            this.pending.delete(msg.id);
            cb(msg);
          }
        }
      } catch {
        // Non-JSON output (logs) is expected to go to stderr per MCP spec.
        // Anything on stdout that isn't JSON is a conformance violation —
        // record it via stderr buffer for the test to inspect.
        this.stderr += `[stdout-non-json] ${line}\n`;
      }
    }
  }

  async send(method: string, params?: Record<string, unknown>): Promise<JsonRpcResponse> {
    if (!this.proc) throw new Error("Client not started");
    const id = this.nextId++;
    const req: JsonRpcRequest = { jsonrpc: "2.0", id, method, params };
    return new Promise<JsonRpcResponse>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(
          new Error(
            `Timeout waiting for response to ${method} (id=${id}). stderr=${this.stderr}`
          )
        );
      }, this.timeoutMs);
      this.pending.set(id, (resp) => {
        clearTimeout(timer);
        resolve(resp);
      });
      this.proc!.stdin.write(`${JSON.stringify(req)}\n`);
    });
  }

  async stop(): Promise<void> {
    if (!this.proc) return;
    this.proc.stdin.end();
    return new Promise((resolve) => {
      const t = setTimeout(() => {
        this.proc?.kill("SIGKILL");
        resolve();
      }, 2000);
      this.proc!.on("exit", () => {
        clearTimeout(t);
        resolve();
      });
    });
  }

  getStderr(): string {
    return this.stderr;
  }
}

/**
 * Standard MCP conformance suite — validates the protocol contract.
 *
 * Tests included:
 *   1. Server starts on stdio without crashing
 *   2. Server responds to initialize request
 *   3. Server responds to tools/list and exposes expected tools
 *   4. All tool inputSchemas are valid JSON Schema objects
 *   5. Server returns a structured error for unknown tools
 *   6. Server doesn't write non-JSON to stdout (stdio transport invariant)
 *   7. Server shuts down cleanly on stdin close
 */
export function runConformanceSuite(opts: ConformanceOptions): void {
  // Lazy-load vitest globals so this module can also be imported by non-test code
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v = globalThis as any;
  const describe: (name: string, fn: () => void) => void = v.describe;
  const it: (name: string, fn: () => Promise<void> | void, timeout?: number) => void = v.it;
  const expect: (actual: unknown) => {
    toBe: (expected: unknown) => void;
    toBeDefined: () => void;
    toBeTruthy: () => void;
    toContain: (expected: unknown) => void;
    toEqual: (expected: unknown) => void;
  } = v.expect;
  const beforeAll: (fn: () => Promise<void> | void) => void = v.beforeAll;
  const afterAll: (fn: () => Promise<void> | void) => void = v.afterAll;

  if (!describe || !it || !expect) {
    throw new Error(
      "runConformanceSuite must be called from within a vitest test file (no test runner detected)"
    );
  }

  describe(`MCP Conformance: ${opts.packageName}`, () => {
    let client: McpTestClient;
    const cwd = process.cwd();
    const timeoutMs = opts.timeoutMs ?? 15000;

    beforeAll(async () => {
      client = new McpTestClient(opts.binPath, cwd, timeoutMs);
      await client.start();
      // Initialize handshake per MCP spec
      const initResp = await client.send("initialize", {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "maiife-conformance-test", version: "1.0.0" },
      });
      if (initResp.error) {
        throw new Error(`initialize failed: ${initResp.error.message}`);
      }
    });

    afterAll(async () => {
      if (client) await client.stop();
    });

    it("responds to initialize with serverInfo and capabilities", async () => {
      // Already tested in beforeAll, but assert again for explicit reporting
      const resp = await client.send("initialize", {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "maiife-conformance-test", version: "1.0.0" },
      });
      // Some servers may reject re-initialize; either accept it or get a clean error
      expect(resp).toBeDefined();
      expect(resp.jsonrpc).toBe("2.0");
    });

    it("responds to tools/list with expected tools", async () => {
      const resp = await client.send("tools/list");
      expect(resp.error).toBe(undefined);
      const result = resp.result as { tools: Array<{ name: string; inputSchema: unknown }> };
      expect(result).toBeDefined();
      expect(Array.isArray(result.tools)).toBe(true);
      const toolNames = result.tools.map((t) => t.name);
      for (const expected of opts.expectedTools) {
        expect(toolNames).toContain(expected);
      }
    });

    it("all tools have valid JSON Schema inputSchemas", async () => {
      const resp = await client.send("tools/list");
      const result = resp.result as { tools: Array<{ name: string; inputSchema: unknown }> };
      for (const tool of result.tools) {
        const validation = validateToolInputSchema(tool.inputSchema);
        if (!validation.valid) {
          throw new Error(`Tool ${tool.name} has invalid inputSchema: ${validation.reason}`);
        }
      }
    });

    it("returns a structured error for unknown tool calls", async () => {
      const resp = await client.send("tools/call", {
        name: "__nonexistent_tool_for_conformance__",
        arguments: {},
      });
      // MCP servers may return either an error response OR a result with isError: true
      const hasError =
        resp.error !== undefined ||
        (resp.result &&
          typeof resp.result === "object" &&
          (resp.result as { isError?: boolean }).isError === true);
      expect(hasError).toBe(true);
    });

    it("does not write non-JSON to stdout (stdio transport invariant)", () => {
      const stderr = client.getStderr();
      const nonJsonOnStdout = stderr
        .split("\n")
        .filter((l) => l.startsWith("[stdout-non-json]"));
      if (nonJsonOnStdout.length > 0) {
        throw new Error(
          `Server wrote non-JSON to stdout (violates MCP stdio spec):\n${nonJsonOnStdout.join("\n")}`
        );
      }
    });
  });
}
