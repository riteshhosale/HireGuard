import type { NextFunction, Request, Response } from "express";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const PRUNE_INTERVAL_MS = 30_000;
let lastPruneAt = 0;

function pruneExpiredBuckets(now: number): void {
  // Avoid a full Map scan on every request; high-cardinality traffic would
  // otherwise turn rate limiting itself into an O(n) hot path per request.
  if (now - lastPruneAt < PRUNE_INTERVAL_MS) return;
  lastPruneAt = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function rateLimit(options: { windowMs: number; max: number; name: string }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    // Pruning is throttled to avoid scanning every IP bucket on every request.
    // Use a shared store for consistent limits across multiple production instances.
    pruneExpiredBuckets(now);

    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key = `${options.name}:${ip}`;
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      res.setHeader("X-RateLimit-Limit", options.max);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, options.max - 1));
      return next();
    }

    current.count += 1;
    res.setHeader("X-RateLimit-Limit", options.max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, options.max - current.count));

    if (current.count > options.max) {
      res.setHeader("Retry-After", Math.ceil((current.resetAt - now) / 1000));
      res.status(429).json({ success: false, message: "Too many requests. Please try again later." });
      return;
    }

    next();
  };
}

export function rejectHoneypot(req: Request, res: Response, next: NextFunction) {
  const honeypot = typeof req.body?.website === "string" ? req.body.website.trim() : "";
  if (honeypot) {
    res.status(400).json({ success: false, message: "Request rejected." });
    return;
  }
  next();
}
