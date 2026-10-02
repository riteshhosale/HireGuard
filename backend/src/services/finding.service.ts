import { Finding } from "../models/finding.model.js";
import type { RuleFinding } from "../rules/types.js";

export async function saveFindings(
  scanId: string,
  findings: RuleFinding[],
): Promise<void> {
  if (findings.length === 0) {
    return;
  }

  await Finding.insertMany(
    findings.map((finding) => ({
      scanId,
      type: finding.type,
      severity: finding.severity,
      score: finding.score,
      evidence: finding.evidence,
      source: finding.source,
    })),
  );
}