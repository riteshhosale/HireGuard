import type { RuleFinding } from "../rules/types.js";
import { RiskLevel } from "../types/scan.types.js";
import type { RiskResult } from "./types.js";

const MAX_RISK_SCORE = 100;

export function calculateRisk(
  findings: RuleFinding[],
): RiskResult {
  const uniqueFindings = deduplicateFindings(findings);

  const rawScore = uniqueFindings.reduce(
    (total, finding) => total + finding.score,
    0,
  );

  const score = Math.min(
    rawScore,
    MAX_RISK_SCORE,
  );

  return {
    score,
    level: getRiskLevel(score),
    findings: uniqueFindings,
    reasons: uniqueFindings.map(
      (finding) =>
        `${finding.type}: ${finding.evidence}`,
    ),
  };
}

function deduplicateFindings(
  findings: RuleFinding[],
): RuleFinding[] {
  const seen = new Set<string>();

  return findings.filter((finding) => {
    const key = `${finding.type}:${finding.evidence}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
}

function getRiskLevel(score: number): RiskLevel {
  if (score >= 75) {
    return RiskLevel.CRITICAL;
  }

  if (score >= 50) {
    return RiskLevel.HIGH;
  }

  if (score >= 25) {
    return RiskLevel.MEDIUM;
  }

  return RiskLevel.LOW;
}