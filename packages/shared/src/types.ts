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

/** Canonical tool health type — shared across mcp-doctor, mcp-audit, probe */
export type ToolHealthStatus = "healthy" | "degraded" | "dead" | "unknown";

export interface ToolHealth {
  toolName: string;
  status: ToolHealthStatus;
  score?: number;         // 0-100 if scored
  lastChecked: string;   // ISO timestamp
  issues: string[];
  killSwitchRecommended: boolean;
}

/** Heartbeat payload for registry tracking */
export interface ToolHeartbeat {
  packageName: string;
  version: string;
  orgId?: string;
  userId?: string;
  timestamp: string;
  sessionId?: string;
}
