import { getEntries } from "./store.js";
import type { SyncTarget, SyncResult, SyncStatus, DiffResult, ContextEntry } from "./types.js";

export async function pushAll(targets: SyncTarget[]): Promise<SyncResult[]> {
  const entries = getEntries();
  const results: SyncResult[] = [];
  for (const target of targets) {
    const available = await target.detect();
    if (!available) continue;
    const result = await target.push(entries);
    results.push(result);
  }
  return results;
}

export async function pullFrom(target: SyncTarget): Promise<ContextEntry[]> {
  return target.pull();
}

export async function getStatus(targets: SyncTarget[]): Promise<SyncStatus[]> {
  const statuses: SyncStatus[] = [];
  for (const target of targets) {
    const available = await target.detect();
    const entries = available ? await target.pull() : [];
    statuses.push({ target: target.name, available, entriesInTarget: entries.length });
  }
  return statuses;
}

export async function diff(target: SyncTarget): Promise<DiffResult> {
  const local = getEntries();
  const remote = await target.pull();
  const localKeys = new Set(local.map((e) => e.key));
  const remoteKeys = new Set(remote.map((e) => e.key));
  return {
    target: target.name,
    localOnly: [...localKeys].filter((k) => !remoteKeys.has(k)),
    targetOnly: [...remoteKeys].filter((k) => !localKeys.has(k)),
    diverged: [...localKeys].filter((k) => {
      if (!remoteKeys.has(k)) return false;
      const l = local.find((e) => e.key === k);
      const r = remote.find((e) => e.key === k);
      return l && r && l.value !== r.value;
    }),
  };
}
