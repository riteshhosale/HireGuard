import { Router } from "express";
import { getReportController } from "../controllers/report.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/:scanId", requireAuth, getReportController);

export default router;