export interface ModelProfile {
  name: string; vendor: string; costPer1MInput: number; costPer1MOutput: number;
  avgLatencyMs: number; strengths: string[];
}
export interface MatchResult {
  model: string; qualityScore: number; costPerRequest: number; latencyMs: number; valueScore: number;
}
export interface Recommendation {
  task: string; bestQuality: string; bestValue: string; suggestion: string; savingsVsBest: number;
}
