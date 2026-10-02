import { GoogleGenAI } from "@google/genai";

import { env } from "../config/env.js";

import type {
  AIAnalysisInput,
  AIAnalysisResult,
} from "../types/ai.types.js";

const MODEL_NAME = "gemini-3.5-flash-lite";

const ai = env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
    })
  : null;

/**
 * Structured response schema returned by Gemini.
 */
const aiResponseSchema = {
  type: "object",

  properties: {
    risk_level: {
      type: "string",
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    },

    summary: {
      type: "string",
    },

    findings: {
      type: "array",

      items: {
        type: "object",

        properties: {
          type: {
            type: "string",
          },

          severity: {
            type: "string",
          },

          explanation: {
            type: "string",
          },

          evidence: {
            type: "string",
          },
        },

        required: [
          "type",
          "severity",
          "explanation",
          "evidence",
        ],
      },
    },

    recommended_action: {
      type: "string",
    },
  },

  required: [
    "risk_level",
    "summary",
    "findings",
    "recommended_action",
  ],
};

/**
 * Build a compact evidence object before sending
 * information to Gemini.
 *
 * The AI must only reason from observed evidence.
 */
function buildEvidencePayload(input: AIAnalysisInput) {
  return {
    scanId: input.scanId,

    jobUrl: input.jobUrl,

    ruleRisk: {
      score: input.ruleRiskScore,
      level: input.ruleRiskLevel,
    },

    ruleFindings: input.ruleFindings,

    pages: input.pages.map((page) => ({
      url: page.url,

      title: page.title,

      text: page.text.slice(0, 6000),

      forms: page.forms,

      network: page.network.map((event) => ({
        type: event.type,
        timestamp: event.timestamp,
        url: event.url,
        method: event.method,
        status: event.status,
        resourceType: event.resourceType,
        failure: event.failure,
      })),

      redirects: page.redirects,

      stopGuard: page.stopGuard,
    })),
  };
}

/**
 * Validate Gemini's response before returning it
 * to the rest of the application.
 */
function validateAIResult(
  value: unknown,
): AIAnalysisResult {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    throw new Error(
      "Gemini returned an invalid response.",
    );
  }

  const result =
    value as Record<string, unknown>;

  if (
    typeof result.risk_level !== "string" ||
    !["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(
      result.risk_level,
    ) ||
    typeof result.summary !== "string" ||
    !Array.isArray(result.findings) ||
    typeof result.recommended_action !== "string"
  ) {
    throw new Error(
      "Gemini response does not match the expected AI analysis format.",
    );
  }

  for (const finding of result.findings) {
    if (
      typeof finding !== "object" ||
      finding === null
    ) {
      throw new Error(
        "Gemini returned an invalid finding.",
      );
    }

    const item =
      finding as Record<string, unknown>;

    if (
      typeof item.type !== "string" ||
      typeof item.severity !== "string" ||
      typeof item.explanation !== "string" ||
      typeof item.evidence !== "string"
    ) {
      throw new Error(
        "Gemini returned an invalid finding format.",
      );
    }
  }

  return {
    risk_level:
      result.risk_level as AIAnalysisResult["risk_level"],

    summary: result.summary,

    findings:
      result.findings as AIAnalysisResult["findings"],

    recommended_action:
      result.recommended_action,
  };
}

/**
 * Analyze JobGuard evidence using Gemini.
 */
export async function analyzeEvidenceWithAI(
  input: AIAnalysisInput,
): Promise<AIAnalysisResult> {
  if (!ai) {
    throw new Error(
      "GEMINI_API_KEY is not configured.",
    );
  }

  const evidence =
    buildEvidencePayload(input);

  const prompt = `
You are the AI analysis engine for HireGuard AI.

Your task is to analyze ONLY the evidence provided below.

HireGuard AI is a job scam investigation system.

IMPORTANT RULES:

1. Do NOT invent evidence.

2. Do NOT invent:
- URLs
- redirects
- forms
- credentials
- passwords
- OTP requests
- payment requests
- bank information requests
- government ID requests
- suspicious behavior
- findings
- browser events
- network events

3. Every finding MUST be supported by evidence contained
   in the provided scan data.

4. If there is no evidence for a suspicious behavior,
   do not claim that the behavior occurred.

5. The deterministic rule engine has already analyzed
   the collected evidence.

6. Use the rule engine findings and score as important
   evidence, but explain the observed behavior clearly.

7. Do not increase the risk simply because something
   is theoretically suspicious.

8. Do not create evidence that is not present.

9. Keep the analysis concise and factual.

10. The final response MUST be valid structured JSON.

Analyze the following HireGuard AI scan evidence:

${JSON.stringify(evidence, null, 2)}

Return ONLY the structured JSON response.

Required fields:

risk_level
summary
findings
recommended_action

Each finding must contain:

type
severity
explanation
evidence

The evidence field must describe the actual observed
evidence supporting the finding.
`;

  /**
   * Gemini Interactions API.
   *
   * Structured JSON response is requested directly.
   */
  const response = await ai.interactions.create({
    model: MODEL_NAME,

    input: prompt,

    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: aiResponseSchema,
    },
  });

  const responseText =
    response.output_text;

  if (!responseText) {
    throw new Error(
      "Gemini returned an empty response.",
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new Error(
      "Gemini returned invalid JSON.",
    );
  }

  return validateAIResult(parsed);
}