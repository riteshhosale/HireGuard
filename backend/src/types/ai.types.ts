import type { PageEvidence } from "../scanner/types.js";
import type { RuleFinding } from "../rules/types.js";
import type { RiskLevel } from "./scan.types.js";

export interface AIAnalysisInput {
  scanId: string;

  jobUrl: string;

  pages: PageEvidence[];

  ruleFindings: RuleFinding[];

  ruleRiskScore: number;

  ruleRiskLevel: RiskLevel;
}

export interface AIFinding {
  type: string;

  severity: string;

  explanation: string;

  evidence: string;
}

export interface AIAnalysisResult {
  risk_level: RiskLevel;

  summary: string;

  findings: AIFinding[];

  recommended_action: string;
}