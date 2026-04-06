import type { Recommendation } from "./types.js";
import { compareModels } from "./comparer.js";

export function recommend(task: string): Recommendation {
  const results = compareModels(task);
  const bestQuality = results.reduce((a, b) => a.qualityScore > b.qualityScore ? a : b);
  const bestValue = results[0];
  const savingsVsBest = bestQuality.costPerRequest > 0
    ? Math.round(((bestQuality.costPerRequest - bestValue.costPerRequest) / bestQuality.costPerRequest) * 100) : 0;
  return {
    task, bestQuality: bestQuality.model, bestValue: bestValue.model,
    suggestion: bestQuality.model === bestValue.model
      ? `${bestQuality.model} is both highest quality and best value for ${task}`
      : `Use ${bestValue.model} for ${task} — ${savingsVsBest}% cheaper than ${bestQuality.model} with good quality`,
    savingsVsBest,
  };
}
