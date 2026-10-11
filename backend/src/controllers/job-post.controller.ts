import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types/auth.types.js";
import { analyzeJobPostSchema } from "../schemas/job-post.schema.js";
import { analyzeLinkedInJobPost, getJobPostAnalyses } from "../services/linkedin-job.service.js";

export async function analyzeJobPostController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }
    const parsed = analyzeJobPostSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.issues[0]?.message || "Invalid job post data" });
      return;
    }
    const result = await analyzeLinkedInJobPost(parsed.data, userId);
    res.status(201).json({
      success: true,
      data: {
        id: result._id,
        sourceUrl: result.sourceUrl,
        jobTitle: result.jobTitle,
        companyName: result.companyName,
        description: result.description,
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        findings: result.findings,
        extractionStatus: result.extractionStatus,
        extractionMessage: result.extractionMessage,
        analyzedAt: result.analyzedAt,
        disclaimer: "Automated risk indicators are not proof that a job is fraudulent. Verify the employer independently.",
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function listJobPostAnalysesController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }
    const results = await getJobPostAnalyses(userId);
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
}
