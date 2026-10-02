import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { Scan } from "../models/scan.model.js";
import { Report } from "../models/report.model.js";

import type {
  AuthenticatedRequest,
} from "../types/auth.types.js";

export async function getReportController(
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

    const { scanId } =
      req.params;

    /*
     * Verify that the scan belongs
     * to the authenticated user.
     */
    const scan = await Scan.findOne({
      scanId,

      userId:
        authReq.user.id,
    })
      .select("_id")
      .lean();

    if (!scan) {
      res.status(404).json({
        success: false,
        message: "Report not found",
      });

      return;
    }

    /*
     * Get the report after ownership
     * has been verified.
     */
    const report =
      await Report.findOne({
        scanId,
      }).lean();

    if (!report) {
      res.status(404).json({
        success: false,
        message: "Report not found",
      });

      return;
    }

    res.status(200).json({
      success: true,

      data: report,
    });
  } catch (error) {
    next(error);
  }
}