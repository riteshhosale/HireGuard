import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  createScanSchema,
} from "../schemas/scan.schema.js";

import * as scanService
  from "../services/scan.service.js";

import type {
  AuthenticatedRequest,
} from "../types/auth.types.js";

export async function createScanController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authReq =
      req as AuthenticatedRequest;

    if (!authReq.user) {
      res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });

      return;
    }

    const parsed =
      createScanSchema.safeParse(
        req.body,
      );

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstMessage = Object.values(fieldErrors)
        .flat()
        .find((message) => Boolean(message));

      res.status(400).json({
        success: false,
        message:
          firstMessage || "Invalid scan data",
        errors:
          fieldErrors,
      });

      return;
    }

    const scan =
      await scanService.createScan(
        parsed.data,
        authReq.user.id,
      );

    res.status(201).json({
      success: true,

      data: {
        scanId:
          scan.scanId,

        status:
          scan.status,

        jobUrl:
          scan.jobUrl,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getScanController(
  req: Request<{
    scanId: string;
  }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authReq =
      req as AuthenticatedRequest;

    if (!authReq.user) {
      res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });

      return;
    }

    const {
      scanId,
    } = req.params;

    const scan =
      await scanService.getScan(
        scanId,
        authReq.user.id,
      );

    if (!scan) {
      res.status(404).json({
        success: false,
        message:
          "Scan not found",
      });

      return;
    }

    res.status(200).json({
      success: true,

      data: {
        scanId:
          scan.scanId,

        status:
          scan.status,

        jobUrl:
          scan.jobUrl,

        riskScore:
          scan.riskScore ?? null,

        riskLevel:
          scan.riskLevel ?? null,

        startedAt:
          scan.startedAt ?? null,

        completedAt:
          scan.completedAt ?? null,

        error:
          scan.error ?? null,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserScansController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    const scans = await scanService.getUserScans(authReq.user.id);

    res.status(200).json({
      success: true,
      data: scans.map((scan) => ({
        scanId: scan.scanId,
        status: scan.status,
        jobUrl: scan.jobUrl,
        riskScore: scan.riskScore ?? null,
        riskLevel: scan.riskLevel ?? null,
        startedAt: scan.startedAt ?? null,
        completedAt: scan.completedAt ?? null,
        createdAt: scan.createdAt ?? null,
        error: scan.error ?? null,
      })),
    });
  } catch (error) {
    next(error);
  }
}