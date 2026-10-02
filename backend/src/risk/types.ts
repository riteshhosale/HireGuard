import type { RuleFinding } from "../rules/types.js";
import { RiskLevel } from "../types/scan.types.js";

export interface RiskResult {
  score: number;
  level: RiskLevel;
  findings: RuleFinding[];
  reasons: string[];
}