import type { ProbeResult, ScanConfig, ScanCategory, Scanner } from "./types.js";

type ScannerMap = Partial<Record<ScanCategory, Scanner<unknown>>>;

const EMPTY_RESULT: ProbeResult = {
  ide: [],
  mcp: [],
  agents: [],
  keys: [],
  models: [],
  deps: [],
  tools: [],
  extensions: [],
};

export async function runScan(
  config: ScanConfig,
  scanners: ScannerMap
): Promise<ProbeResult> {
  const result: ProbeResult = { ...EMPTY_RESULT };

  const tasks = Object.entries(scanners)
    .filter(([category]) => config.categories.includes(category as ScanCategory))
    .map(async ([category, scanner]) => {
      const findings = await scanner!.scan(config);
      (result as unknown as Record<string, unknown[]>)[category] = findings;
    });

  await Promise.all(tasks);
  return result;
}
