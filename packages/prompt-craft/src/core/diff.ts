export interface PromptDiff {
  before: string;
  after: string;
  scoreBefore?: number;
  scoreAfter?: number;
  additions: string[];
  removals: string[];
  summary: string;
}

/**
 * Generate a human-readable diff between two prompt versions.
 * Useful for before/after comparisons when improving prompts.
 */
export function diffPrompts(before: string, after: string, scoreBefore?: number, scoreAfter?: number): PromptDiff {
  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");

  const beforeSet = new Set(beforeLines);
  const afterSet = new Set(afterLines);

  const additions = afterLines.filter((l) => l.trim() && !beforeSet.has(l));
  const removals = beforeLines.filter((l) => l.trim() && !afterSet.has(l));

  const scoreDelta = (scoreBefore !== undefined && scoreAfter !== undefined)
    ? ` Score: ${scoreBefore} → ${scoreAfter} (${scoreAfter >= scoreBefore ? "+" : ""}${scoreAfter - scoreBefore})`
    : "";

  const summary = additions.length > 0 && removals.length > 0
    ? `+${additions.length} lines added, -${removals.length} lines removed.${scoreDelta}`
    : additions.length > 0
    ? `+${additions.length} lines added.${scoreDelta}`
    : removals.length > 0
    ? `-${removals.length} lines removed.${scoreDelta}`
    : `No textual changes.${scoreDelta}`;

  return { before, after, scoreBefore, scoreAfter, additions, removals, summary };
}

/**
 * Format a PromptDiff as a unified-diff-style string for display.
 */
export function formatDiff(diff: PromptDiff): string {
  const lines: string[] = ["--- before", "+++ after", ""];
  const beforeLines = diff.before.split("\n");
  const afterLines = diff.after.split("\n");
  const beforeSet = new Set(beforeLines);
  const afterSet = new Set(afterLines);

  const allLines = [...new Set([...beforeLines, ...afterLines])];
  for (const line of allLines) {
    if (!line.trim()) continue;
    if (beforeSet.has(line) && afterSet.has(line)) {
      lines.push(`  ${line}`);
    } else if (afterSet.has(line)) {
      lines.push(`+ ${line}`);
    } else {
      lines.push(`- ${line}`);
    }
  }

  lines.push("", diff.summary);
  return lines.join("\n");
}
