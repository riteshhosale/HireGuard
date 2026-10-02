import type { Request, Response } from "express";

import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
} from "../schemas/auth.schema.js";

import { env } from "../config/env.js";

import {
  getAuthenticatedUser,
  loginUser,
  logoutUser,
  refreshUserToken,
  registerUser,
} from "../services/auth.service.js";

import type { AuthenticatedRequest } from "../types/auth.types.js";

/**
 * POST /api/v1/auth/register
 */
export async function register(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Invalid registration data",
      errors:
        parsed.error.flatten().fieldErrors,
    });

    return;
  }

  try {
    const result =
      await registerUser(parsed.data);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: result,
    });
  } catch (error) {
    console.error(
      "REGISTER ERROR:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Registration failed";

    if (
      message.includes("already exists")
    ) {
      res.status(409).json({
        success: false,
        message,
      });

      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      ...(env.NODE_ENV !== "production"
        ? { error: message }
        : {}),
    });
  }
}

/**
 * POST /api/v1/auth/login
 */
export async function login(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed =
    loginSchema.safeParse(
      req.body,
    );

  if (!parsed.success) {
    res.status(400).json({
      success: false,

      message:
        "Invalid login data",

      errors:
        parsed.error.flatten()
          .fieldErrors,
    });

    return;
  }

  try {
    const result =
      await loginUser(
        parsed.data,
      );

    res.status(200).json({
      success: true,

      message:
        "Login successful",

      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Login failed";

    if (
      message ===
        "Invalid email or password"
    ) {
      res.status(401).json({
        success: false,

        message,
      });

      return;
    }

    if (
      message ===
      "This account is inactive"
    ) {
      res.status(403).json({
        success: false,

        message,
      });

      return;
    }

    res.status(500).json({
      success: false,

      message:
        "Login failed",
    });
  }
}

/**
 * POST /api/v1/auth/refresh
 */
export async function refresh(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed =
    refreshTokenSchema.safeParse(
      req.body,
    );

  if (!parsed.success) {
    res.status(400).json({
      success: false,

      message:
        "Refresh token is required",

      errors:
        parsed.error.flatten()
          .fieldErrors,
    });

    return;
  }

  try {
    const tokens =
      await refreshUserToken(
        parsed.data.refreshToken,
      );

    res.status(200).json({
      success: true,

      message:
        "Token refreshed successfully",

      data: {
        tokens,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Token refresh failed";

    res.status(401).json({
      success: false,

      message:
        message ===
          "User not found" ||
        message ===
          "This account is inactive"
          ? message
          : "Invalid or expired refresh token",
    });
  }
}

/**
 * POST /api/v1/auth/logout
 */
export async function logout(
  req: Request,
  res: Response,
): Promise<void> {
  const authReq =
    req as AuthenticatedRequest;

  const user =
    authReq.user;

  if (!user) {
    res.status(401).json({
      success: false,

      message:
        "Authentication required",
    });

    return;
  }

  try {
    await logoutUser(
      user.id,
    );

    res.status(200).json({
      success: true,

      message:
        "Logout successful",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Logout failed";

    if (
      message ===
      "User not found"
    ) {
      res.status(404).json({
        success: false,

        message,
      });

      return;
    }

    res.status(500).json({
      success: false,

      message:
        "Logout failed",
    });
  }
}

/**
 * GET /api/v1/auth/me
 */
export async function me(
  req: Request,
  res: Response,
): Promise<void> {
  const authReq =
    req as AuthenticatedRequest;

  const user =
    authReq.user;

  if (!user) {
    res.status(401).json({
      success: false,

      message:
        "Authentication required",
    });

    return;
  }

  try {
    const authenticatedUser =
      await getAuthenticatedUser(
        user.id,
      );

    res.status(200).json({
      success: true,

      data: {
        user:
          authenticatedUser,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve user";

    if (
      message ===
        "User not found" ||
      message ===
        "This account is inactive"
    ) {
      res.status(401).json({
        success: false,

        message,
      });

      return;
    }

    res.status(500).json({
      success: false,

      message:
        "Unable to retrieve user",
    });
  }
}