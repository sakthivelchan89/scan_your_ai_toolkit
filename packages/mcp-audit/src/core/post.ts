export interface PostPayload {
  toolName: "mcp-audit";
  findings: Record<string, unknown>;
  environment: { os: string; hostnameHash: string; nodeVersion: string };
  scannedAt: string;
}

export interface PostInput {
  gateway: string;
  apiKey: string;
  payload: PostPayload;
  retryDelayMs?: number;
  timeoutMs?: number;
}

export interface PostResult {
  ok: boolean;
  status?: number;
  body?: unknown;
  error?: string;
}

async function doFetch(input: PostInput): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), input.timeoutMs ?? 10_000);
  try {
    return await fetch(`${input.gateway.replace(/\/$/, "")}/admin/scout/findings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${input.apiKey}`,
      },
      body: JSON.stringify(input.payload),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function postFindings(input: PostInput): Promise<PostResult> {
  const retryDelayMs = input.retryDelayMs ?? 1000;
  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await doFetch(input);
      if (res.ok) {
        const body = await res.json().catch(() => null);
        return { ok: true, status: res.status, body };
      }
      if (res.status >= 500 && attempt === 0) {
        await new Promise((r) => setTimeout(r, retryDelayMs));
        continue;
      }
      const text = await res.text().catch(() => "");
      return { ok: false, status: res.status, error: text || `HTTP ${res.status}` };
    } catch (err) {
      lastErr = err;
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, retryDelayMs));
        continue;
      }
    }
  }
  return { ok: false, error: lastErr instanceof Error ? lastErr.message : String(lastErr) };
}
