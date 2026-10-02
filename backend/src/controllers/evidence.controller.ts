import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { Event } from "../models/event.model.js";
import { Finding } from "../models/finding.model.js";

import type {
  AuthenticatedRequest,
} from "../types/auth.types.js";

import { Scan } from "../models/scan.model.js";

export async function getScanEventsController(
  req: Request<{ scanId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authReq =
      req as AuthenticatedRequest;

    if (!authReq.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { scanId } = req.params;

    const scan = await Scan.findOne({
      scanId,
      userId: authReq.user.id,
    }).select("_id");

    if (!scan) {
      res.status(404).json({
        success: false,
        message: "Scan not found",
      });
      return;
    }

    const events = await Event.find({
      scanId,
    })
      .sort({ timestamp: 1 })
      .lean();

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
}

export async function getScanFindingsController(
  req: Request<{ scanId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authReq =
      req as AuthenticatedRequest;

    if (!authReq.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { scanId } = req.params;

    const scan = await Scan.findOne({
      scanId,
      userId: authReq.user.id,
    }).select("_id");

    if (!scan) {
      res.status(404).json({
        success: false,
        message: "Scan not found",
      });
      return;
    }

    const findings = await Finding.find({
      scanId,
    })
      .sort({ createdAt: 1 })
      .lean();

    res.json({
      success: true,
      data: findings,
    });
  } catch (error) {
    next(error);
  }
}