import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum([
      "development",
      "test",
      "production",
    ])
    .default("development"),

  PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(5000),

  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI is required"),

  GEMINI_API_KEY: z
    .string()
    .optional(),

  CORS_ORIGIN: z
    .string()
    .default(
      "http://localhost:5173,https://job-guardai-musa.vercel.app",
    ),

  SCANNER_MODE: z
    .enum(["auto", "direct", "docker"])
    .default("auto"),

  JWT_ACCESS_SECRET: z
    .string()
    .min(
      32,
      "JWT_ACCESS_SECRET must be at least 32 characters",
    ),

  JWT_REFRESH_SECRET: z
    .string()
    .min(
      32,
      "JWT_REFRESH_SECRET must be at least 32 characters",
    ),

  JWT_ACCESS_EXPIRES_IN: z
    .string()
    .default("15m"),

  JWT_REFRESH_EXPIRES_IN: z
    .string()
    .default("7d"),
});

export const env = envSchema.parse(
  process.env,
);