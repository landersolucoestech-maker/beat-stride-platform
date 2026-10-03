export type RiskAlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type RiskAlertStatus = "OPEN" | "INVESTIGATING" | "CONFIRMED" | "DISMISSED" | "RESOLVED";

export interface RiskAlertView {
  id: string;
  detectedAt: string;
  recordingTitle: string;
  artistName: string;
  destinationLabel: string;
  reason: string;
  suspiciousUsageCount: string | null;
  severity: RiskAlertSeverity;
  status: RiskAlertStatus;
}

export interface RiskOverview {
  available: boolean;
  openCount: number | null;
  investigatingCount: number | null;
  confirmedCount: number | null;
  suspiciousUsageCount: string | null;
  alerts: RiskAlertView[];
}
