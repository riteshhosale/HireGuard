import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { logger } from "../utils/logger.js";

export function errorMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error(
    {
      error,
      method: req.method,
      path: req.originalUrl,
    },
    "Unhandled application error",
  );

  if (res.headersSent) {
    return;
  }

  let statusCode = 500;
  let message = "Internal server error";

  if (error instanceof Error) {
    message = error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error.name === "ValidationError" ||
      error.name === "ZodError")
  ) {
    statusCode = 400;
    message = "Validation error";
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "CastError"
  ) {
    statusCode = 400;
    message = "Invalid request data";
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    statusCode = 409;
    message = "Duplicate resource";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" &&
    error instanceof Error
      ? {
          error: error.name,
        }
      : {}),
  });
}