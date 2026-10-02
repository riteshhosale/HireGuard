import { analyzeRules } from "../rules/rule-engine.js";
import type { PageEvidence } from "./types.js";
import { calculateRisk } from "../risk/risk-engine.js";

export function analyzePageRisk(
  page: PageEvidence,
) {
  const findings = analyzeRules(page);

  return calculateRisk(findings);
}