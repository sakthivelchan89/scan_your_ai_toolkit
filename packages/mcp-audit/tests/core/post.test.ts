import { describe, it, expect, vi, beforeEach } from "vitest";
import { postFindings } from "../../src/core/post";

const fetchMock = vi.fn();
(globalThis as any).fetch = fetchMock;

beforeEach(() => { fetchMock.mockReset(); });

const payload = {
  toolName: "mcp-audit" as const,
  findings: { mcp: [], agents: [], keys: [], models: [], ide: [], extensions: [], tools: [], deps: [] },
  environment: { os: "linux", hostnameHash: "abc", nodeVersion: "20.0.0" },
  scannedAt: "2026-04-19T12:00:00Z",
};

describe("postFindings", () => {
  it("returns { ok: true } on 2xx", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ id: "f1" }) });
    const r = await postFindings({ gateway: "https://g", apiKey: "mk-1", payload });
    expect(r.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://g/admin/scout/findings");
    expect((init as any).headers.Authorization).toBe("Bearer mk-1");
  });

  it("retries once on 5xx", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 503, text: () => Promise.resolve("svc down") });
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ id: "f1" }) });
    const r = await postFindings({ gateway: "https://g", apiKey: "mk-1", payload, retryDelayMs: 0 });
    expect(r.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does NOT retry on 401/403", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 401, text: () => Promise.resolve("bad key") });
    const r = await postFindings({ gateway: "https://g", apiKey: "mk-1", payload, retryDelayMs: 0 });
    expect(r.ok).toBe(false);
    expect(r.status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns { ok: false, error } on network exception after retry", async () => {
    fetchMock.mockRejectedValue(new Error("ECONNREFUSED"));
    const r = await postFindings({ gateway: "https://g", apiKey: "mk-1", payload, retryDelayMs: 0 });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/ECONNREFUSED/);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
