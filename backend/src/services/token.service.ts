import crypto from "node:crypto";

import jwt, {
  type JwtPayload,
  type SignOptions,
} from "jsonwebtoken";

import { env } from "../config/env.js";

import type {
  RefreshTokenPayload,
  UserPayload,
} from "../types/auth.types.js";

function getTokenExpirationDate(
  expiresIn: string,
): Date {
  const match = expiresIn.match(
    /^(\d+)([smhd])$/,
  );

  if (!match) {
    throw new Error(
      `Invalid token expiration format: ${expiresIn}`,
    );
  }

  const amountText = match[1];
  const unit = match[2];

  if (!amountText || !unit) {
    throw new Error(
      `Invalid token expiration format: ${expiresIn}`,
    );
  }

  const amount = Number(amountText);

  if (!Number.isFinite(amount)) {
    throw new Error(
      `Invalid token expiration amount: ${amountText}`,
    );
  }

  const multipliers: Record<
    "s" | "m" | "h" | "d",
    number
  > = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };

  const multiplier =
    multipliers[
      unit as "s" | "m" | "h" | "d"
    ];

  return new Date(
    Date.now() +
      amount * multiplier,
  );
}

/**
 * Generate access token.
 */
export function generateAccessToken(
  userId: string,
  email: string,
): string {
  const payload: UserPayload = {
    sub: userId,
    email,
    type: "access",
  };

  const options: SignOptions = {
    expiresIn:
      env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
  };

  return jwt.sign(
    payload,
    env.JWT_ACCESS_SECRET,
    options,
  );
}

/**
 * Generate refresh token.
 */
export function generateRefreshToken(
  userId: string,
  email: string,
): string {
  const payload: RefreshTokenPayload = {
    sub: userId,
    email,
    type: "refresh",
  };

  const options: SignOptions = {
    expiresIn:
      env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
  };

  return jwt.sign(
    payload,
    env.JWT_REFRESH_SECRET,
    options,
  );
}

/**
 * Parse access-token payload.
 */
function parseAccessTokenPayload(
  decoded: string | JwtPayload,
): UserPayload {
  if (typeof decoded === "string") {
    throw new Error(
      "Invalid access token payload",
    );
  }

  if (decoded.type !== "access") {
    throw new Error(
      "Invalid access token type",
    );
  }

  if (typeof decoded.sub !== "string") {
    throw new Error(
      "Invalid access token subject",
    );
  }

  if (typeof decoded.email !== "string") {
    throw new Error(
      "Invalid access token email",
    );
  }

  return {
    sub: decoded.sub,
    email: decoded.email,
    type: "access",
  };
}

/**
 * Verify access token.
 */
export function verifyAccessToken(
  token: string,
): UserPayload {
  try {
    const decoded = jwt.verify(
      token,
      env.JWT_ACCESS_SECRET,
    );

    return parseAccessTokenPayload(
      decoded,
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith(
        "Invalid access token",
      )
    ) {
      throw error;
    }

    throw new Error(
      "Invalid or expired access token",
    );
  }
}

/**
 * Parse refresh-token payload.
 */
function parseRefreshTokenPayload(
  decoded: string | JwtPayload,
): RefreshTokenPayload {
  if (typeof decoded === "string") {
    throw new Error(
      "Invalid refresh token payload",
    );
  }

  if (decoded.type !== "refresh") {
    throw new Error(
      "Invalid refresh token type",
    );
  }

  if (typeof decoded.sub !== "string") {
    throw new Error(
      "Invalid refresh token subject",
    );
  }

  if (typeof decoded.email !== "string") {
    throw new Error(
      "Invalid refresh token email",
    );
  }

  return {
    sub: decoded.sub,
    email: decoded.email,
    type: "refresh",
  };
}

/**
 * Verify refresh token.
 */
export function verifyRefreshToken(
  token: string,
): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(
      token,
      env.JWT_REFRESH_SECRET,
    );

    return parseRefreshTokenPayload(
      decoded,
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith(
        "Invalid refresh token",
      )
    ) {
      throw error;
    }

    throw new Error(
      "Invalid or expired refresh token",
    );
  }
}

/**
 * Hash refresh token before storing it.
 */
export function hashToken(
  token: string,
): string {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

/**
 * Generate token family identifier.
 */
export function generateTokenFamily(): string {
  return crypto.randomUUID();
}

/**
 * Calculate refresh-token expiration.
 */
export function getRefreshTokenExpiration(): Date {
  return getTokenExpirationDate(
    env.JWT_REFRESH_EXPIRES_IN,
  );
}