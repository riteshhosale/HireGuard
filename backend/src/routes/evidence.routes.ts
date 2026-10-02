import { Router } from "express";

import {
  getScanEventsController,
  getScanFindingsController,
} from "../controllers/evidence.controller.js";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/:scanId/events",
  requireAuth,
  getScanEventsController,
);

router.get(
  "/:scanId/findings",
  requireAuth,
  getScanFindingsController,
);

export default router;