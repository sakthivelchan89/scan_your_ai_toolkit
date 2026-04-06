export interface RubricDimension {
  name: string;
  weight: number;
  description: string;
  scoringCriteria: { excellent: string; good: string; fair: string; poor: string; };
}

export interface Rubric {
  name: string;
  description: string;
  dimensions: RubricDimension[];
}

export interface EvalScore {
  dimension: string;
  score: number;
  reasoning: string;
}

export interface EvalResult {
  rubric: string;
  totalScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  scores: EvalScore[];
  output: string;
  timestamp: string;
}

export interface BatchResult {
  rubric: string;
  count: number;
  avgScore: number;
  minScore: number;
  maxScore: number;
  stdDev: number;
  results: EvalResult[];
  outliers: EvalResult[];
}

export interface CompareResult {
  rubric: string;
  baseline: { avgScore: number; count: number };
  candidate: { avgScore: number; count: number };
  delta: number;
  winner: "baseline" | "candidate" | "tie";
  pValue: number;
  significant: boolean;
}

export type JudgeFn = (params: { output: string; rubric: Rubric; context?: string; }) => Promise<EvalScore[]>;
