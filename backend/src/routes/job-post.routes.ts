import { Router } from "express";
import { analyzeJobPostController, listJobPostAnalysesController } from "../controllers/job-post.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { rateLimit } from "../middleware/rate-limit.middleware.js";

const router = Router();
router.use(requireAuth);
router.post("/analyze", rateLimit({ windowMs: 10 * 60 * 1000, max: 10, name: "job-post-analyze" }), analyzeJobPostController);
router.get("/", listJobPostAnalysesController);
export default router;
