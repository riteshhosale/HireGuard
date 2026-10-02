import { Report } from "../models/report.model.js";

import type { PageEvidence } from "./types.js";

import type { RiskResult } from "../risk/types.js";

import type {
  AIAnalysisResult,
} from "../types/ai.types.js";

function getHostname(
  url: string,
): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function getRecommendedAction(
  riskLevel: string,
): string {
  switch (riskLevel) {
    case "CRITICAL":
      return "STOP_APPLICATION";

    case "HIGH":
      return "STOP_APPLICATION";

    case "MEDIUM":
      return "PROCEED_WITH_CAUTION";

    case "LOW":
      return "NO_MAJOR_RED_FLAGS_DETECTED";

    default:
      return "REVIEW_REPORT";
  }
}

function createSummary(
  riskLevel: string,
  findingsCount: number,
): string {
  if (findingsCount === 0) {
    return "No major suspicious signals were detected during the scan.";
  }

  return `${findingsCount} suspicious signal(s) detected. Overall risk level: ${riskLevel}.`;
}

export async function createReport(
  scanId: string,
  jobUrl: string,
  pages: PageEvidence[],
  risk: RiskResult,
) {
  const firstPage = pages[0];

  const finalUrl =
    firstPage?.url ?? jobUrl;

  const originalDomain =
    getHostname(jobUrl);

  const finalDomain =
    getHostname(finalUrl);

  const externalRedirectDetected =
    Boolean(
      originalDomain &&
        finalDomain &&
        originalDomain !== finalDomain,
    );

  const timeline =
    pages.flatMap((page) => [
      ...page.network.map(
        (event) => ({
          timestamp:
            event.timestamp,

          type:
            event.type,

          url:
            event.url,

          description:
            `${event.type} ${event.method ?? ""} ${event.url}`,
        }),
      ),

      ...page.redirects.map(
        (redirect) => ({
          timestamp:
            redirect.timestamp,

          type:
            "REDIRECT",

          url:
            redirect.to,

          description:
            `Redirected from ${redirect.from || "initial page"} to ${redirect.to}`,
        }),
      ),

      ...page.forms.map(
        (form) => ({
          timestamp:
            new Date().toISOString(),

          type:
            "FORM_DETECTED",

          url:
            page.url,

          description:
            `Form detected with ${form.fields.length} field(s).`,
        }),
      ),
    ]);

  const report =
    await Report.findOneAndUpdate(
      {
        scanId,
      },

      {
        scanId,

        jobUrl,

        riskScore:
          risk.score,

        riskLevel:
          risk.level,

        summary:
          createSummary(
            risk.level,
            risk.findings.length,
          ),

        findings:
          risk.findings,

        timeline,

        domainChecks: {
          originalDomain,

          finalDomain,

          externalRedirectDetected,
        },

        recommendedAction:
          getRecommendedAction(
            risk.level,
          ),
      },

      {
        returnDocument:
          "after",

        upsert:
          true,
      },
    );

  return report;
}

/**
 * Save Gemini AI analysis into the
 * existing report document.
 */
export async function saveAIAnalysis(
  scanId: string,
  analysis: AIAnalysisResult,
) {
  return Report.findOneAndUpdate(
    {
      scanId,
    },

    {
      $set: {
        aiAnalysis: analysis,
      },
    },

    {
      returnDocument:
        "after",
    },
  );
}

/**
 * Get report by scan ID.
 */
export async function getReport(
  scanId: string,
) {
  return Report.findOne({
    scanId,
  }).lean();
}