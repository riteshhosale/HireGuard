import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { Scan } from "../models/scan.model.js";
import { Event } from "../models/event.model.js";
import { Finding } from "../models/finding.model.js";

import { analyzeEvidenceWithAI } from "../services/ai.service.js";
import { saveAIAnalysis } from "../services/report.service.js";

import type {
  AuthenticatedRequest,
} from "../types/auth.types.js";

import type {
  FormEvidence,
  NetworkEvent,
  PageEvidence,
  RedirectEvent,
  StopGuardEvidence,
} from "../scanner/types.js";

import type {
  RuleFinding,
} from "../rules/types.js";

import {
  RiskLevel,
} from "../types/scan.types.js";

/**
 * Safely read a string value.
 */
function getString(
  value: unknown,
): string | undefined {
  return typeof value === "string"
    ? value
    : undefined;
}

/**
 * Safely read an array value.
 */
function getArray<T>(
  value: unknown,
): T[] {
  return Array.isArray(value)
    ? (value as T[])
    : [];
}

/**
 * Reconstruct PageEvidence from the
 * persisted PAGE_EVIDENCE event.
 */
function buildPageEvidence(
  pageEvent: {
    url: string;
    timestamp: Date;
    data?: unknown;
  },
  networkEvents: NetworkEvent[],
): PageEvidence {
  const data =
    pageEvent.data &&
    typeof pageEvent.data === "object"
      ? (pageEvent.data as Record<string, unknown>)
      : {};

  const title =
    getString(data.title) ?? "";

  const text =
    getString(data.text) ?? "";

  const forms =
    getArray<FormEvidence>(
      data.forms,
    );

  const redirects =
    getArray<RedirectEvent>(
      data.redirects,
    );

  const storedStopGuard =
    data.stopGuard &&
    typeof data.stopGuard === "object"
      ? (data.stopGuard as Record<string, unknown>)
      : undefined;

  const stopGuard: StopGuardEvidence = {
    triggered:
      storedStopGuard?.triggered === true,

    reason:
      getString(
        storedStopGuard?.reason,
      ),

    evidence:
      getString(
        storedStopGuard?.evidence,
      ),
  };

  return {
    url: pageEvent.url,

    title,

    text,

    forms,

    network: networkEvents,

    redirects,

    stopGuard,
  };
}

export async function analyzeScanWithAIController(
  req: Request<{ scanId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authReq =
      req as AuthenticatedRequest;

    /*
     * Authentication
     */
    if (!authReq.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    const { scanId } = req.params;

    /*
     * Verify scan ownership.
     */
    const scan = await Scan.findOne({
      scanId,

      userId:
        authReq.user.id,
    }).lean();

    if (!scan) {
      res.status(404).json({
        success: false,
        message: "Scan not found",
      });

      return;
    }

    /*
     * Get all persisted events.
     */
    const events = await Event.find({
      scanId,
    })
      .sort({
        timestamp: 1,
      })
      .lean();

    /*
     * PAGE_EVIDENCE events contain:
     *
     * - title
     * - text
     * - forms
     * - redirects
     * - stopGuard
     */
    const pageEvidenceEvents =
      events.filter(
        (event) =>
          event.type ===
          "PAGE_EVIDENCE",
      );

    /*
     * Network events contain:
     *
     * - REQUEST
     * - RESPONSE
     * - REQUEST_FINISHED
     * - REQUEST_FAILED
     */
    const networkEvents: NetworkEvent[] =
      events
        .filter(
          (event) =>
            event.type !==
            "PAGE_EVIDENCE",
        )
        .map(
          (event) => ({
            type:
              event.type as NetworkEvent["type"],

            timestamp:
              event.timestamp.toISOString(),

            url:
              event.url,

            method:
              typeof event.data?.method ===
              "string"
                ? event.data.method
                : undefined,

            status:
              typeof event.data?.status ===
              "number"
                ? event.data.status
                : undefined,

            resourceType:
              typeof event.data?.resourceType ===
              "string"
                ? event.data.resourceType
                : undefined,

            failure:
              typeof event.data?.failure ===
              "string"
                ? event.data.failure
                : undefined,
          }),
        );

    /*
     * Get persisted deterministic findings.
     */
    const findings =
      await Finding.find({
        scanId,
      })
        .sort({
          createdAt: 1,
        })
        .lean();

    /*
     * Convert findings to RuleFinding.
     */
    const ruleFindings: RuleFinding[] =
      findings.map(
        (finding) => ({
          type:
            finding.type as RuleFinding["type"],

          severity:
            finding.severity as RuleFinding["severity"],

          score:
            finding.score,

          evidence:
            finding.evidence,

          source:
            finding.source,
        }),
      );

    /*
     * Reconstruct complete PageEvidence.
     */
    let pages: PageEvidence[];

    if (pageEvidenceEvents.length > 0) {
      pages =
        pageEvidenceEvents.map(
          (pageEvent) =>
            buildPageEvidence(
              {
                url:
                  pageEvent.url,

                timestamp:
                  pageEvent.timestamp,

                data:
                  pageEvent.data,
              },

              networkEvents,
            ),
        );
    } else {
      /*
       * Fallback for scans created before
       * PAGE_EVIDENCE persistence.
       */
      pages = [
        {
          url:
            scan.jobUrl,

          title:
            "",

          text:
            "",

          forms:
            [],

          network:
            networkEvents,

          redirects:
            [],

          stopGuard: {
            triggered:
              false,
          },
        },
      ];
    }

    /*
     * Run Gemini AI analysis.
     */
    const aiResult =
      await analyzeEvidenceWithAI({
        scanId,

        jobUrl:
          scan.jobUrl,

        pages,

        ruleFindings,

        ruleRiskScore:
          scan.riskScore ?? 0,

        ruleRiskLevel:
          scan.riskLevel ??
          RiskLevel.LOW,
      });

    /*
     * Persist Gemini analysis into
     * the existing Report document.
     */
    await saveAIAnalysis(
      scanId,
      aiResult,
    );

    /*
     * Return AI result.
     */
    res.status(200).json({
      success: true,

      data: {
        scanId,

        analysis:
          aiResult,
      },
    });
  } catch (error) {
    next(error);
  }
}