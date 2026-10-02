import type { Types } from "mongoose";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface AuthenticatedRequest {
  user?: AuthenticatedUser;
}

export interface UserPayload {
  sub: string;
  email: string;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string;
  email: string;
  type: "refresh";
}

export interface UserDocumentData {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  refreshTokenHash: string | null;
  refreshTokenExpiresAt: Date | null;
  isActive: boolean;
  lastLoginAt: Date | null;
}