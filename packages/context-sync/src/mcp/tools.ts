import { getEntries, addEntry } from "../core/store.js";
import { pushAll, getStatus } from "../core/sync.js";
import { createCursorRulesTarget, createClaudeTarget, createMCPMemoryTarget } from "../core/targets/index.js";

const ALL_TARGETS = [createCursorRulesTarget(), createClaudeTarget(), createMCPMemoryTarget()];

export async function contextSyncRead(params: { category?: string }) {
  return getEntries(params.category);
}

export async function contextSyncUpdate(params: { key: string; value: string; category?: string }) {
  addEntry({ key: params.key, value: params.value, category: params.category ?? "general" });
  return { success: true, key: params.key };
}

export async function contextSyncPush() {
  return pushAll(ALL_TARGETS);
}

export async function contextSyncStatus() {
  return getStatus(ALL_TARGETS);
}
