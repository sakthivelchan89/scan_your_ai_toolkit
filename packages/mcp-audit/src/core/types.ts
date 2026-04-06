export type SecurityGrade = "A" | "B" | "C" | "D" | "F";

export interface DimensionScore {
  dimension: string;
  score: number;        // 0-100
  weight: number;       // 0-1
  details: string[];
}

export interface ScoreCard {
  serverName: string;
  grade: SecurityGrade;
  score: number;        // 0-100 weighted total
  dimensions: DimensionScore[];
  recommendations: string[];
}

export interface AuditResult {
  timestamp: string;
  configSource: string;
  servers: ScoreCard[];
  overallGrade: SecurityGrade;
  overallScore: number;
  criticalCount: number;
}

export interface ParsedMCPServer {
  name: string;
  command?: string;
  args: string[];
  url?: string;
  env: Record<string, string>;
  transport: "stdio" | "sse";
  configSource: string;
}

export function gradeFromScore(score: number): SecurityGrade {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}
