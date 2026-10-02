import { Router } from "express";

import {
  analyzeScanWithAIController,
} from "../controllers/ai.controller.js";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/analyze/:scanId",
  requireAuth,
  analyzeScanWithAIController,
);

export default router;