import { Router } from "express";

import {
  createScanController,
  getScanController,
  getUserScansController,
} from "../controllers/scan.controller.js";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";

import { rateLimit, rejectHoneypot } from "../middleware/rate-limit.middleware.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  rateLimit({ windowMs: 10 * 60 * 1000, max: 20, name: "scan" }),
  rejectHoneypot,
  createScanController,
);

router.get(
  "/",
  requireAuth,
  getUserScansController,
);

router.get(
  "/:scanId",
  requireAuth,
  getScanController,
);

export default router;