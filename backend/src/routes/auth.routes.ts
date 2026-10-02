import { Router } from "express";

import {
  register,
  login,
  refresh,
  logout,
  me,
} from "../controllers/auth.controller.js";

import {
  requireAuth,
} from "../middleware/auth.middleware.js";

import { rateLimit, rejectHoneypot } from "../middleware/rate-limit.middleware.js";

const router = Router();

router.post(
  "/register",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 12, name: "register" }),
  rejectHoneypot,
  register,
);

router.post(
  "/login",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20, name: "login" }),
  rejectHoneypot,
  login,
);

router.post(
  "/refresh",
  refresh,
);

router.post(
  "/logout",
  requireAuth,
  logout,
);

router.get(
  "/me",
  requireAuth,
  me,
);

export default router;