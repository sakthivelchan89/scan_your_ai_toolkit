export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface Finding {
  category: string;
  name: string;
  details: Record<string, unknown>;
  risk: RiskLevel;
}

export interface ToolSummary {
  totalFindings: number;
  riskLevel: RiskLevel;
  recommendations: string[];
}

export interface MaiifeTelemetry {
  toolName: string;
  toolVersion: string;
  timestamp: string;
  environment: {
    os: string;
    nodeVersion: string;
    cwd: string;
  };
  results: Finding[];
  summary: ToolSummary;
}
