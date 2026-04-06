import { detectSubscriptions } from "../core/detector.js";
import { analyzeSubscriptions } from "../core/analyzer.js";

export async function subAuditRun() {
  const subs = detectSubscriptions();
  return analyzeSubscriptions(subs);
}
