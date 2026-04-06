export type HealthStatus = "healthy" | "degraded" | "dead" | "stale";

export interface HealthCheck {
  name: string;
  passed: boolean;
  details: string;
}

export interface ServerHealth {
  name: string;
  status: HealthStatus;
  checks: HealthCheck[];
  responseTimeMs?: number;
  configSource: string;
  suggestions: string[];
}

export interface DoctorReport {
  timestamp: string;
  servers: ServerHealth[];
  summary: {
    healthy: number;
    degraded: number;
    dead: number;
    stale: number;
    total: number;
  };
}

export interface FixAction {
  serverName: string;
  description: string;
  command?: string;
  autoFixable: boolean;
}
