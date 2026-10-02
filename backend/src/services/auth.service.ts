import bcrypt from "bcrypt";

import { User } from "../models/user.model.js";

import type {
  AuthResponse,
  AuthTokens,
  AuthUser,
  LoginInput,
  RegisterInput,
} from "../types/auth.types.js";

import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiration,
  hashToken,
  verifyRefreshToken,
} from "./token.service.js";

const BCRYPT_ROUNDS = 12;

function toAuthUser(
  user: {
    _id: unknown;
    name: string;
    email: string;
  },
): AuthUser {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
  };
}

async function createTokens(
  userId: string,
  email: string,
): Promise<AuthTokens> {
  const accessToken =
    generateAccessToken(
      userId,
      email,
    );

  const refreshToken =
    generateRefreshToken(
      userId,
      email,
    );

  return {
    accessToken,
    refreshToken,
  };
}

/**
 * Register a new JobGuard AI user.
 */
export async function registerUser(
  input: RegisterInput,
): Promise<AuthResponse> {
  const name = input.name.trim();

  const email =
    input.email.trim().toLowerCase();

  const existingUser =
    await User.findOne({
      email,
    }).lean();

  if (existingUser) {
    throw new Error(
      "An account with this email already exists",
    );
  }

  const passwordHash =
    await bcrypt.hash(
      input.password,
      BCRYPT_ROUNDS,
    );

  const user = await User.create({
    name,

    email,

    passwordHash,

    refreshTokenHash: null,

    refreshTokenExpiresAt: null,

    isActive: true,

    lastLoginAt: null,
  });

  const userId =
    String(user._id);

  const tokens =
    await createTokens(
      userId,
      user.email,
    );

  const refreshTokenHash =
    hashToken(
      tokens.refreshToken,
    );

  user.refreshTokenHash =
    refreshTokenHash;

  user.refreshTokenExpiresAt =
    getRefreshTokenExpiration();

  await user.save();

  return {
    user: toAuthUser(user),

    tokens,
  };
}

/**
 * Login an existing user.
 */
export async function loginUser(
  input: LoginInput,
): Promise<AuthResponse> {
  const email =
    input.email.trim().toLowerCase();

  const user =
    await User.findOne({
      email,
    }).select(
      "+passwordHash +refreshTokenHash +refreshTokenExpiresAt",
    );

  if (!user) {
    throw new Error(
      "Invalid email or password",
    );
  }

  if (!user.isActive) {
    throw new Error(
      "This account is inactive",
    );
  }

  const passwordMatches =
    await bcrypt.compare(
      input.password,
      user.passwordHash,
    );

  if (!passwordMatches) {
    throw new Error(
      "Invalid email or password",
    );
  }

  const userId =
    String(user._id);

  const tokens =
    await createTokens(
      userId,
      user.email,
    );

  user.refreshTokenHash =
    hashToken(
      tokens.refreshToken,
    );

  user.refreshTokenExpiresAt =
    getRefreshTokenExpiration();

  user.lastLoginAt =
    new Date();

  await user.save();

  return {
    user: toAuthUser(user),

    tokens,
  };
}

/**
 * Refresh an access token.
 *
 * Refresh-token rotation:
 * - Verify JWT
 * - Find user
 * - Compare stored refresh-token hash
 * - Generate a new access token
 * - Generate a new refresh token
 * - Replace stored refresh-token hash
 */
export async function refreshUserToken(
  refreshToken: string,
): Promise<AuthTokens> {
  const payload =
    verifyRefreshToken(
      refreshToken,
    );

  const user =
    await User.findById(
      payload.sub,
    ).select(
      "+refreshTokenHash +refreshTokenExpiresAt",
    );

  if (!user) {
    throw new Error(
      "User not found",
    );
  }

  if (!user.isActive) {
    throw new Error(
      "This account is inactive",
    );
  }

  if (
    !user.refreshTokenHash
  ) {
    throw new Error(
      "Refresh token is not active",
    );
  }

  const incomingTokenHash =
    hashToken(
      refreshToken,
    );

  const tokenMatches =
    incomingTokenHash ===
    user.refreshTokenHash;

  if (!tokenMatches) {
    /**
     * Possible refresh-token reuse.
     *
     * Invalidate the stored refresh token
     * so the current token family cannot
     * continue being used.
     */
    user.refreshTokenHash =
      null;

    user.refreshTokenExpiresAt =
      null;

    await user.save();

    throw new Error(
      "Invalid refresh token",
    );
  }

  if (
    !user.refreshTokenExpiresAt ||
    user.refreshTokenExpiresAt.getTime() <=
      Date.now()
  ) {
    user.refreshTokenHash =
      null;

    user.refreshTokenExpiresAt =
      null;

    await user.save();

    throw new Error(
      "Refresh token has expired",
    );
  }

  const tokens =
    await createTokens(
      String(user._id),
      user.email,
    );

  user.refreshTokenHash =
    hashToken(
      tokens.refreshToken,
    );

  user.refreshTokenExpiresAt =
    getRefreshTokenExpiration();

  await user.save();

  return tokens;
}

/**
 * Logout user by invalidating
 * the stored refresh token.
 */
export async function logoutUser(
  userId: string,
): Promise<void> {
  const user =
    await User.findById(
      userId,
    ).select(
      "+refreshTokenHash +refreshTokenExpiresAt",
    );

  if (!user) {
    throw new Error(
      "User not found",
    );
  }

  user.refreshTokenHash =
    null;

  user.refreshTokenExpiresAt =
    null;

  await user.save();
}

/**
 * Get authenticated user's safe profile.
 */
export async function getAuthenticatedUser(
  userId: string,
): Promise<AuthUser> {
  const user =
    await User.findById(
      userId,
    ).lean();

  if (!user) {
    throw new Error(
      "User not found",
    );
  }

  if (!user.isActive) {
    throw new Error(
      "This account is inactive",
    );
  }

  return toAuthUser(user);
}