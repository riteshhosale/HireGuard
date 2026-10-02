import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  verifyAccessToken,
} from "../services/token.service.js";

import type {
  AuthenticatedRequest,
} from "../types/auth.types.js";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader =
    req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      success: false,
      message:
        "Authentication required",
    });

    return;
  }

  const [
    scheme,
    token,
  ] = authHeader.split(" ");

  if (
    scheme?.toLowerCase() !==
      "bearer" ||
    !token
  ) {
    res.status(401).json({
      success: false,
      message:
        "Invalid authorization header",
    });

    return;
  }

  try {
    const payload =
      verifyAccessToken(token);

    const authReq =
      req as AuthenticatedRequest;

    authReq.user = {
      id: payload.sub,
      email: payload.email,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message:
        "Invalid or expired access token",
    });
  }
}