// Shared TypeScript interfaces for Project INT16

export type Severity = "INFO" | "WARNING" | "ERROR" | "CRITICAL";
export type LogFormat = "A" | "B" | "C" | "unknown";

export interface LogEntry {
  id: string;
  line: number;
  time: string;
  module: string;
  message: string;
  severity: Severity | null;
  rawLine: string;
  format: LogFormat;
}

export interface ClusterResult {
  logId: string;
  message: string;
  cluster_id: number;
  cluster_name: string;
  subsystem?: string;
  description: string;
  confidence: number;
  anomaly_score?: number;
  anomaly?: boolean;
}

export interface ModuleRisk {
  module: string;
  failure_probability: number;
  risk_level: "low" | "medium" | "high";
  error_count: number;
}

export interface SeverityPrediction {
  module: string;
  message: string;
  predicted_severity: Severity;
}

export interface IntelligenceResponse {
  input_log: string;
  analysis: {
    cluster_id: number;
    cluster_name: string;
    subsystem?: string;
    description: string;
    similarity_score: number;
    anomaly: boolean;
  };
}

export interface AnalysisResult {
  logs: LogEntry[];
  clusters: ClusterResult[];
  moduleRisks: ModuleRisk[];
  summary: string;
  // Flags to indicate upstream service availability
  reliabilityUnavailable?: boolean;
  stats: {
    total: number;
    errorDensity: number;
    criticalCount: number;
    highRiskModules: number;
    formatBreakdown: Record<LogFormat, number>;
    severityBreakdown: Record<Severity, number>;
  };
}

export type PipelineStep =
  | "idle"
  | "parsing"
  | "inferring"
  | "clustering"
  | "scoring"
  | "synthesizing"
  | "complete"
  | "error";

export interface PipelineState {
  step: PipelineStep;
  progress: number; // 0-100
  message: string;
  error?: string;
}

export interface PlaygroundRequest {
  endpoint: "severity" | "intelligence" | "reliability";
  input: string;
}

export interface PlaygroundResponse {
  request: object;
  response: object;
  duration: number;
  error?: string;
}
