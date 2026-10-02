import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    success: true,
    service: "HireGuard AI API",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;