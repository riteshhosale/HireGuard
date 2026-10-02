import type { RuleFinding } from "../rules/types.js";
import type { RiskLevel } from "./scan.types.js";

export interface ReportTimelineEvent {
  timestamp: string;
  type: string;
  url?: string;
  description: string;
}

export interface Report {
  scanId: string;

  jobUrl: string;

  riskScore: number;

  riskLevel: RiskLevel;

  summary: string;

  findings: RuleFinding[];

  timeline: ReportTimelineEvent[];

  domainChecks: {
    originalDomain: string;
    finalDomain: string;
    externalRedirectDetected: boolean;
  };

  recommendedAction: string;

  createdAt: Date;
}